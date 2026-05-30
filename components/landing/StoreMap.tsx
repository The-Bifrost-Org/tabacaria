export function StoreMap() {
  return (
    <section className="pt-4 -mb-24">
      <div className="px-4 mb-6 text-center">
        <h2 className="text-xl font-bold text-ink-primary font-['Playfair_Display']">
          Nossa Localização
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Rua Frederico José Marques, 106 — Riachuelo, Batatais SP
        </p>
      </div>

      <div className="px0">
        <div className="rounded-2x2 overflow-hidden shadow-sm border border-[#E8E5DF]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!4v1780023564350!6m8!1m7!1sejcncSFu2AvubnnnF-g-JA!2m2!1d-20.90079242695683!2d-47.5945311045806!3f270.8366067463655!4f-15.477622116192208!5f0.7820865974627469"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}