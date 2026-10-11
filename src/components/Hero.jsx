
function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">
        <p className="eyebrow">
          <span /> NUEVA IDENTIDAD · NUEVA TEMPORADA
        </p>

        <h1>
          TU ESTILO.
          <br />
          <span>TUS REGLAS.</span>
        </h1>

        <p className="hero-description">
          Descubrí una nueva forma de vestir. Tendencias, actitud y
          estilo para todos los días.
        </p>

        <div className="hero-actions">
          <a className="button button-gold" href="#catalogo">
            EXPLORAR COLECCIÓN <span>↗</span>
          </a>

          <a className="button button-outline" href="#nosotros">
            CONOCÉ LA MARCA
          </a>
        </div>

        <div className="hero-note">
          <span className="gold-line" />
          <p>VENTA MINORISTA Y MAYORISTA</p>
        </div>
      </div>

      <div className="hero-visual">
        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90"
          alt="Inspiración de moda y estilo"
        />

        <div className="image-caption">
          <span>FARES FACTORY</span>
          <span>EST. 2026</span>
        </div>

        <div className="vertical-label">
          FASHION · ATTITUDE · IDENTITY
        </div>
      </div>

      <div className="hero-index">
        01 <span>/ 03</span>
      </div>
    </section>
  )
}

export default Hero
