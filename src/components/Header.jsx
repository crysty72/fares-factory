
import { useState } from 'react'
import './Header.css'
import logo from '../assets/ale-logo-indumentaria.jpg'

function Header({ cartCount = 0, onOpenCart }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  function goToInicio(event) {
    event.preventDefault()
    closeMenu()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="announcement">
        INDUMENTARIA Y CALZADO · MAYORISTA Y MINORISTA
      </div>

      <header className="header" id="inicio">
        <a
          className="brand"
          href="#inicio"
          onClick={goToInicio}
          aria-label="Fares Factory, ir al inicio"
        >
          <img
            className="brand-logo"
            src={logo}
            alt="Logo Fares Factory"
          />

          <span className="brand-description">
            INDUMENTARIA Y CALZADO
            <small>MAYORISTA Y MINORISTA</small>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav
          className={`navigation ${menuOpen ? 'navigation-open' : ''}`}
          id="main-navigation"
          aria-label="Navegación principal"
        >
          <a href="#inicio" onClick={goToInicio}>
            INICIO
          </a>

          <a href="#categorias" onClick={closeMenu}>
            CATEGORÍAS
          </a>

          <a href="#catalogo" onClick={closeMenu}>
            CATÁLOGO
          </a>

          <a href="#nosotros" onClick={closeMenu}>
            NOSOTROS
          </a>

          <a
            className="admin-link"
            href="/admin"
            onClick={closeMenu}
          >
            ADMINISTRACIÓN
          </a>
        </nav>

        <button
          className="header-link cart-trigger"
          type="button"
          onClick={() => {
            closeMenu()
            onOpenCart?.()
          }}
          aria-label={`Abrir carrito. ${cartCount} productos`}
        >
          MI CARRITO ({cartCount}) <span>↗</span>
        </button>
      </header>
    </>
  )
}

export default Header
