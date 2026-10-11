
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

import Header from './components/Header'
import Hero from './components/Hero'
import Categories from './components/Categories'
import ProductCatalog from './components/ProductCatalog'
import Cart from './components/Cart'
import AdminPanel from './components/AdminPanel'
import Footer from './components/Footer'

import './App.css'

const fallbackProducts = [
  {
    id: 'demo-1',
    name: 'Remera básica',
    category: 'Damas',
    preci_retail: null,
    price_whosale: null,
    price: null,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'demo-2',
    name: 'Remera urbana',
    category: 'Hombres',
    preci_retail: null,
    price_whosale: null,
    price: null,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'demo-3',
    name: 'Conjunto infantil',
    category: 'Niños',
    preci_retail: null,
    price_whosale: null,
    price: null,
    image:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'demo-4',
    name: 'Zapatillas urbanas',
    category: 'Calzados',
    preci_retail: null,
    price_whosale: null,
    price: null,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
  },
]

const categories = [
  'Todos',
  'Damas',
  'Hombres',
  'Niños',
  'Calzados',
]

function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return 'Consultar'
  }

  const number = Number(value)

  if (!Number.isFinite(number)) return 'Consultar'

  return number.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })
}

function App() {
  const [products, setProducts] = useState(fallbackProducts)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [catalogMessage, setCatalogMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setCatalogMessage('')

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (cancelled) return

        const formattedProducts = (data || []).map((product) => {
          const retailPrice =
            product.preci_retail ??
            product.price_retail ??
            product.priceRetail ??
            null

          const wholesalePrice =
            product.price_whosale ??
            product.price_wholesale ??
            product.priceWholesale ??
            null

          const simplePrice = product.price ?? null

          let displayPrice = 'Consultá el precio'

          if (retailPrice != null || wholesalePrice != null) {
            displayPrice =
              `Minorista: ${
                retailPrice != null
                  ? formatPrice(retailPrice)
                  : 'Consultar'
              } · Mayorista: ${
                wholesalePrice != null
                  ? formatPrice(wholesalePrice)
                  : 'Consultar'
              }`
          } else if (simplePrice != null) {
            displayPrice = formatPrice(simplePrice)
          }

          return {
            ...product,
            id: product.id,
            name: product.name || product.title || 'Producto sin nombre',
            category: product.category || 'Damas',
            description: product.description || '',
            preci_retail: retailPrice,
            price_retail: retailPrice,
            price_whosale: wholesalePrice,
            price_wholesale: wholesalePrice,
            price: simplePrice,
            image:
              product.image_url ||
              product.image ||
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
            displayPrice,
          }
        })

        if (formattedProducts.length > 0) {
          setProducts(formattedProducts)
        } else {
          setProducts([])
          setCatalogMessage(
            'Todavía no hay productos activos. Publicá productos desde Administración.'
          )
        }
      } catch (error) {
        console.error('Error al cargar productos:', error.message)

        if (!cancelled) {
          setProducts(fallbackProducts)
          setCatalogMessage(
            'No pudimos conectar con el catálogo. Revisá la conexión con Supabase.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  )

  const filteredProducts =
    activeCategory === 'Todos'
      ? products
      : products.filter(
          (product) =>
            (product.category || '').trim().toLowerCase() ===
            activeCategory.toLowerCase()
        )

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      )

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })

    setCartOpen(true)
  }

  function updateQuantity(productId, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: Math.max(
                  0,
                  Number(item.quantity || 0) + amount
                ),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function selectCategory(category) {
    setActiveCategory(category)

    document
      .getElementById('catalogo')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  // Acceso directo al panel de administración.
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <AdminPanel />
  }

  return (
    <>
      <Header
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main>
        <Hero />

        <Categories
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={selectCategory}
        />

        <section className="catalog" id="catalogo">
          {catalogMessage && (
            <p className="catalog-message" role="status">
              {catalogMessage}
            </p>
          )}

          {loading ? (
            <div className="empty-products">
              <p>Cargando catálogo...</p>
            </div>
          ) : (
            <ProductCatalog
              products={filteredProducts}
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={selectCategory}
              onAddToCart={addToCart}
            />
          )}
        </section>

        <section className="about-section" id="nosotros">
          <p className="eyebrow">MÁS QUE MODA</p>

          <h2>
            VESTÍ TU ACTITUD<span>.</span>
          </h2>

          <p>
            FARES FACTORY: indumentaria y calzado mayorista
            y minorista para damas, hombres y niños.
          </p>

          <a className="button button-gold" href="#catalogo">
            DESCUBRIR LA COLECCIÓN ↗
          </a>
        </section>
      </main>

      <Footer />

      {cartOpen && (
        <Cart
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </>
  )
}

export default App
