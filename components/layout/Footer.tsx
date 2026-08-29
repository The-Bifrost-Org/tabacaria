export function Footer(){
    return(
        <footer className="bg-white border-t border-brand-border py-4 px-4 text-center">
            <p className="text-xs text-ink-muted">
                © {new Date().getFullYear()} Suave Tabacaria — Todos os direitos reservados
            </p>
            <p className="text-xs text-ink-muted mt-1">
                Venda proibida para menores de 18 anos
            </p>
        </footer>
    );
}