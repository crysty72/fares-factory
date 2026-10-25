

function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">
        <p className="eyebrow">
          <span />
          MÁS QUE MODA · FARES FACTORY
        </p>

        <h1>
          VESTÍ TU ESTILO.
          <br />
          <span>MARCÁ LA DIFERENCIA.</span>
        </h1>

        <p className="hero-description">
          Indumentaria y calzado para damas, hombres y niños.
          Encontrá tu próximo look y elegí cómo querés vestir,
          con opciones de compra mayorista y minorista.
        </p>

        <div className="hero-actions">
          <a className="button button-gold" href="#catalogo">
            DESCUBRÍ LA COLECCIÓN <span>↗</span>
          </a>

          <a className="button button-outline" href="#nosotros">
            CONOCÉ LA MARCA
          </a>
        </div>

        <div className="hero-note">
          <span className="gold-line" />
          <p>ESTILO PARA CADA PERSONA · MAYORISTA Y MINORISTA</p>
        </div>
      </div>

      <div className="hero-visual">
        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90"
          alt="Inspiración de moda y tendencias de indumentaria"
          loading="eager"
        />

        <div className="image-caption">
          <span>FARES FACTORY</span>
          <span>EST. 2026</span>
        </div>

        <div className="vertical-label">
          FASHION · ATTITUDE · IDENTITY
        </div>
      </div>

      <div className="hero-index" aria-hidden="true">
        01 <span>/ 03</span>
      </div>
    </section>
  )
}

export default Hero
