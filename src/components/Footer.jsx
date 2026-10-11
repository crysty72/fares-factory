

function Footer() {
  const currentYear = new Date().getFullYear()

  function goToSection(event, sectionId) {
    event.preventDefault()

    // Si estamos en otra página, primero volvemos a la tienda.
    if (window.location.pathname !== '/') {
      window.location.assign(
        sectionId ? `/#${sectionId}` : '/'
      )
      return
    }

    // Si estamos en la tienda, buscamos la sección.
    if (!sectionId) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }

    const section = document.getElementById(sectionId)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <a
            href="/"
            className="footer-logo"
            aria-label="Fares Factory, volver al inicio"
            onClick={(event) => goToSection(event, null)}
          >
            FARES <span>FACTORY</span>
          </a>

          <p>
            Tu estilo, tus reglas.
            <br />
            Indumentaria y calzado
            <br />
            mayorista y minorista.
          </p>
        </div>

        <div className="footer-links">
          <h3>NAVEGACIÓN</h3>

          <a
            href="/"
            onClick={(event) => goToSection(event, null)}
          >
            Inicio
          </a>

          <a
            href="/#categorias"
            onClick={(event) => goToSection(event, 'categorias')}
          >
            Categorías
          </a>

          <a
            href="/#catalogo"
            onClick={(event) => goToSection(event, 'catalogo')}
          >
            Catálogo
          </a>

          <a
            href="/#nosotros"
            onClick={(event) => goToSection(event, 'nosotros')}
          >
            Nosotros
          </a>
        </div>

        <div className="footer-contact">
          <h3>CONTACTO</h3>

          <p>¿Tenés alguna consulta?</p>

          <a
            href="https://wa.me/?text=Hola%2C%20Fares%20Factory.%20Quisiera%20hacer%20una%20consulta."
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactanos por WhatsApp ↗
          </a>

          <a className="footer-admin-link" href="/admin">
            Acceso a administración ↗
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} Fares Factory. Todos los derechos reservados.
        </p>

        <a
          href="/"
          onClick={(event) => goToSection(event, null)}
        >
          VOLVER ARRIBA ↑
        </a>
      </div>
    </footer>
  )
}

export default Footer
