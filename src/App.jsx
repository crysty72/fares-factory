
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
    description: 'Un básico imprescindible para tu guardarropa.',
    price_retail: 12000,
    price_wholesale: 9000,
    price: 12000,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    active: true,
  },
  {
    id: 'demo-2',
    name: 'Remera urbana',
    category: 'Hombres',
    description: 'Comodidad y estilo para todos los días.',
    price_retail: 15000,
    price_wholesale: 11500,
    price: 15000,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85',
    active: true,
  },
  {
    id: 'demo-3',
    name: 'Look mini',
    category: 'Niños',
    description: 'Prendas cómodas para acompañar cada aventura.',
    price_retail: 10000,
    price_wholesale: 7500,
    price: 10000,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85',
    active: true,
  },
  {
    id: 'demo-4',
    name: 'Calzado urbano',
    category: 'Calzados',
    description: 'Un toque de estilo para completar tu outfit.',
    price_retail: 28000,
    price_wholesale: 22000,
    price: 28000,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    active: true,
  },
]

const categories = ['Todos', 'Damas', 'Hombres', 'Niños', 'Calzados']

function normalizeProduct(product) {
  const retailPrice = product.price_retail
  const wholesalePrice = product.price_wholesale
  const simplePrice = retailPrice ?? wholesalePrice ?? null
  const numericStock = Number(product.stock ?? 0)

  return {
    ...product,
    id: product.id,
    name: product.name || 'Producto sin nombre',
    category: product.category || 'Damas',
    description: product.description || '',
    price_retail: retailPrice,
    price_wholesale: wholesalePrice,
    price: simplePrice,
    stock: Number.isFinite(numericStock) ? Math.max(0, numericStock) : 0,
    image: product.image_url || product.image || '',
    displayPrice:
      simplePrice === null || simplePrice === ''
        ? 'Consultá el precio'
        : new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2,
          }).format(Number(simplePrice)),
  }
}

function App() {
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cartItems, setCartItems] = useState([])
  const [catalogMessage, setCatalogMessage] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const isAdminRoute = window.location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdminRoute) return

    let cancelled = false

    async function loadProducts() {
      setLoadingProducts(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        console.error('No se pudieron cargar los productos desde Supabase:', error)
        setProducts(fallbackProducts.map(normalizeProduct))
        setCatalogMessage(
          'Estamos mostrando productos de demostración porque no se pudo conectar con el catálogo.',
        )
        setLoadingProducts(false)
        return
      }

      const normalizedProducts = (data || []).map(normalizeProduct)
      setProducts(normalizedProducts)

      setCartItems((currentItems) =>
        currentItems
          .map((item) => {
            const currentProduct = normalizedProducts.find(
              (product) => product.id === item.id,
            )

            if (!currentProduct || currentProduct.stock <= 0) return null

            return {
              ...currentProduct,
              quantity: Math.min(
                Math.max(1, Number(item.quantity) || 1),
                currentProduct.stock,
              ),
            }
          })
          .filter(Boolean),
      )

      setLoadingProducts(false)
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [isAdminRoute])

  const visibleProducts =
    activeCategory === 'Todos'
      ? products
      : products.filter((product) => product.category === activeCategory)

  function addToCart(product) {
    const currentProduct = products.find((item) => item.id === product.id)

    if (!currentProduct) {
      setCatalogMessage('No encontramos este producto. Actualizá la página e intentá nuevamente.')
      return
    }

    const stock = currentProduct.stock
    const existingItem = cartItems.find((item) => item.id === currentProduct.id)
    const currentQuantity = existingItem?.quantity || 0

    if (stock <= 0) {
      setCatalogMessage(`"${currentProduct.name}" está agotado.`)
      return
    }

    if (currentQuantity >= stock) {
      setCatalogMessage(`Solo hay ${stock} unidades de "${currentProduct.name}" disponibles.`)
      return
    }

    setCartItems((currentItems) => {
      const item = currentItems.find((entry) => entry.id === currentProduct.id)

      if (item) {
        return currentItems.map((entry) =>
          entry.id === currentProduct.id
            ? { ...entry, quantity: Math.min(entry.quantity + 1, stock) }
            : entry,
        )
      }

      return [...currentItems, { ...currentProduct, quantity: 1 }]
    })

    setCatalogMessage('')
    setIsCartOpen(true)
  }

  function updateQuantity(productId, delta) {
    const product = products.find((item) => item.id === productId)

    if (!product) {
      removeFromCart(productId)
      return
    }

    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== productId) return item

          const nextQuantity = item.quantity + delta

          if (nextQuantity <= 0) return null

          return {
            ...item,
            quantity: Math.min(nextQuantity, product.stock),
          }
        })
        .filter(Boolean),
    )
    setCatalogMessage('')
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    )
    setCatalogMessage('')
  }

  if (isAdminRoute) {
    return <AdminPanel />
  }

  return (
    <>
      <Header
        cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main>
        <Hero />

        <Categories
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <section className="catalog" id="catalogo">
          {loadingProducts && (
            <p className="catalog-status" role="status">
              Cargando productos...
            </p>
          )}

          {catalogMessage && (
            <p className="catalog-status" role="status">
              {catalogMessage}
            </p>
          )}

          <ProductCatalog
            products={visibleProducts}
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onAddToCart={addToCart}
          />
        </section>

        <Cart
          cart={cartItems}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />

        <section className="about-section" id="nosotros">
          <div className="about-content">
            <p className="eyebrow">FARES FACTORY</p>
            <h2>TU ESTILO. MARCÁ LA DIFERENCIA.</h2>
            <p>
              Encontrá prendas y calzados para expresar tu estilo. Elegí tus
              favoritos y armá un look que hable de vos.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default App
