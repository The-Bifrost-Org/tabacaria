import "dotenv/config";
import { PrismaClient } from ".prisma/client/default";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@tabacaria.com" },
    update: {},
    create: {
      email: "admin@tabacaria.com",
      passwordHash: hash
    }
  });
  console.log("✔ Admin criado — admin@tabacaria.com / admin123");

  // Categorias
  const categories = [
    { name: "Todos", slug: "todos", order: 0 },
    { name: "Narguilés", slug: "narguiles", order: 1 },
    { name: "Essências", slug: "essencias", order: 2 },
    { name: "Carvões", slug: "carvoes", order: 3 },
    { name: "Acessórios", slug: "acessorios", order: 4 }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }
  console.log("✔ Categorias criadas");

  // Produto de exemplo
  const essencias = await prisma.category.findUnique({
    where: { slug: "essencias" }
  });

  if (essencias) {
    await prisma.product.upsert({
      where: { id: "produto-exemplo-1" },
      update: {},
      create: {
        id: "produto-exemplo-1",
        name: "Essência Premium",
        price: 12.0,
        available: true,
        categoryId: essencias.id,
        variations: {
          create: [
            { name: "Mint", price: 12.0, order: 0 },
            { name: "Uva", price: 14.0, order: 1 },
            { name: "Morango", price: 12.0, order: 2 }
          ]
        }
      }
    });
    console.log("✔ Produto de exemplo criado");
  }

  console.log("\n✅ Seed concluído!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
