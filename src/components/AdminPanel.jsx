
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import './AdminPanel.css'

const initialForm = {
  name: '',
  description: '',
  category: 'Damas',
  priceRetail: '',
  priceWholesale: '',
  sizes: '',
  colors: '',
  stock: '0',
}

const categories = ['Damas', 'Hombres', 'Niños', 'Calzados']
const orderStatuses = [
  { value: 'received', label: 'Recibido' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

function formatPrice(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 'Precio a confirmar'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(number)
}

function formatDate(value) {
  if (!value) return 'Fecha no disponible'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function paymentLabel(status) {
  return status === 'paid' ? 'Pago confirmado' : 'Pago pendiente'
}

// eslint-disable-next-line no-unused-vars
function orderStatusLabel(status) {
  return orderStatuses.find((item) => item.value === status)?.label || status || 'Recibido'
}

function AdminPanel() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState(initialForm)
  const [photo, setPhoto] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let alive = true

    async function checkSession(currentSession) {
      if (!alive) return

      setSession(currentSession)
      setIsAdmin(false)

      if (!currentSession) {
        setProducts([])
        setOrders([])
        setChecking(false)
        return
      }

      setChecking(true)

      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', currentSession.user.id)
        .maybeSingle()

      if (!alive) return

      if (error) {
        setMessage(
          'No pudimos comprobar los permisos de administrador. Revisá las políticas de admin_users.',
        )
        setChecking(false)
        return
      }

      if (!data) {
        setMessage('Este usuario no está autorizado para administrar la tienda.')
        setChecking(false)
        return
      }

      setIsAdmin(true)
      setMessage('')
      await Promise.all([loadProducts(), loadOrders()])

      if (alive) setChecking(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      checkSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      checkSession(newSession)
    })

    return () => {
      alive = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(`No pudimos cargar los productos: ${error.message}`)
      return
    }

    setProducts(data || [])
  }

  async function loadOrders() {
    setLoadingOrders(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al cargar pedidos:', error)
      setMessage(
        `No pudimos cargar los pedidos: ${error.message}. Revisá las políticas de la tabla orders.`,
      )
      setOrders([])
      setLoadingOrders(false)
      return
    }

    setOrders(data || [])
    setLoadingOrders(false)
  }

  async function updateOrder(orderId, updates) {
    setUpdatingOrderId(orderId)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select('*')

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('No se actualizó el pedido. Revisá los permisos de Supabase.')
      }

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, ...updates } : order)),
      )
      setMessage('Pedido actualizado correctamente.')
    } catch (error) {
      console.error('Error al actualizar pedido:', error)
      setMessage(`No se pudo actualizar el pedido: ${error.message || 'error desconocido'}`)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function signIn(event) {
    event.preventDefault()
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage('No se pudo iniciar sesión. Revisá el correo y la contraseña.')
    }
  }

  async function signOut() {
    setMessage('')
    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage('No se pudo cerrar la sesión. Intentá nuevamente.')
      return
    }

    setSession(null)
    setIsAdmin(false)
    setProducts([])
    setOrders([])
    setForm(initialForm)
    setPhoto(null)
    setEditingId(null)
    window.location.assign('/')
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'Damas',
      
priceRetail: product.price_retail ?? '',
priceWholesale: product.price_wholesale ?? '',

      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      stock: String(product.stock ?? 0),
    })
    setPhoto(null)
    setMessage('')
    document.getElementById('admin-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(initialForm)
    setPhoto(null)
    setMessage('')
  }

  async function saveProduct(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      let imageUrl = ''

      if (editingId) {
        const existing = products.find((item) => item.id === editingId)
        imageUrl = existing?.image_url || ''
      }

      if (photo) {
        const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filePath = `${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, photo, {
            contentType: photo.type,
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        imageUrl = publicData.publicUrl
      }

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
       
price_retail: form.priceRetail === '' ? null : Number(form.priceRetail),
price_wholesale: form.priceWholesale === '' ? null : Number(form.priceWholesale),

        image_url: imageUrl,
        sizes: form.sizes.split(',').map((value) => value.trim()).filter(Boolean),
        colors: form.colors.split(',').map((value) => value.trim()).filter(Boolean),
        stock: Number(form.stock),
        active: true,
      }

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)
        if (error) throw error
        setMessage('Producto actualizado correctamente.')
      } else {
        const { error } = await supabase.from('products').insert(productData)
        if (error) throw error
        setMessage('Producto publicado correctamente.')
      }

      setForm(initialForm)
      setPhoto(null)
      setEditingId(null)
      await loadProducts()
    } catch (error) {
      console.error('Error al guardar producto:', error)
      setMessage(`No pudimos guardar el producto: ${error.message || 'error desconocido'}`)
    } finally {
      setSaving(false)
    }
  }

  async function deactivateProduct(product) {
    const confirmed = window.confirm(
      `¿Querés desactivar "${product.name}"? Dejará de mostrarse en la tienda.`,
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', product.id)

    if (error) {
      setMessage(`No se pudo desactivar el producto: ${error.message}`)
      return
    }

    setMessage('Producto desactivado.')
    await loadProducts()
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `¿Querés ELIMINAR "${product.name}"?\n\nEsta acción borra el registro del producto y no se puede deshacer.`,
    )
    if (!confirmed) return

    setDeletingId(product.id)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .select('id')

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('No se eliminó ningún producto. Revisá los permisos de Supabase.')
      }

      if (editingId === product.id) {
        setEditingId(null)
        setForm(initialForm)
        setPhoto(null)
      }

      setProducts((current) => current.filter((item) => item.id !== product.id))
      setMessage(`Producto "${product.name}" eliminado.`)

      if (product.image_url) {
        const marker = '/storage/v1/object/public/product-images/'
        const imagePath = product.image_url.split(marker)[1]

        if (imagePath) {
          const decodedPath = decodeURIComponent(imagePath.split('?')[0])
          const { error: imageError } = await supabase.storage
            .from('product-images')
            .remove([decodedPath])

          if (imageError) {
            console.warn(
              'El producto se eliminó, pero no se pudo borrar la foto:',
              imageError.message,
            )
            setMessage('El producto se eliminó, pero no se pudo borrar su foto del almacenamiento.')
          }
        }
      }

      await loadProducts()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      setMessage(`No se pudo eliminar el producto: ${error.message || 'error desconocido'}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (checking) {
    return (
      <main className="admin-page">
        <p>Comprobando acceso...</p>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={signIn}>
          <p className="admin-eyebrow">FARES FACTORY</p>
          <h1>Administración</h1>
          <p>Ingresá con tu usuario autorizado para gestionar el catálogo.</p>

          <label htmlFor="admin-email">Correo electrónico</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">Iniciar sesión</button>
          {message && <p className="admin-message" role="status">{message}</p>}
          <a className="admin-home-button" href="/">← Volver al inicio de la tienda</a>
        </form>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <section className="admin-login">
          <h1>Acceso no autorizado</h1>
          <p>{message || 'Este usuario no puede administrar los productos.'}</p>
          <button type="button" onClick={signOut}>Cerrar sesión</button>
          <a className="admin-home-button" href="/">← Volver al inicio de la tienda</a>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">FARES FACTORY</p>
          <h1>Administración de la tienda</h1>
          <a className="admin-home-button" href="/">← Volver al inicio de la tienda</a>
        </div>
        <button type="button" className="admin-secondary" onClick={signOut}>Cerrar sesión</button>
      </header>

      <nav className="admin-navigation" aria-label="Navegación del administrador">
        <a href="/">← Inicio de la tienda</a>
        <a href="#admin-form">+ Agregar producto</a>
        <a href="#admin-products">Productos cargados</a>
        <a href="#admin-orders">Pedidos recibidos ({orders.length})</a>
      </nav>

      {message && <p className="admin-message admin-global-message" role="status">{message}</p>}

      <form id="admin-form" className="admin-form" onSubmit={saveProduct}>
        <h2>{editingId ? 'Editar producto' : 'Agregar producto'}</h2>

        <label htmlFor="product-name">Nombre del producto *</label>
        <input
          id="product-name"
          name="name"
          value={form.name}
          onChange={updateField}
          required
          maxLength={150}
        />

        <label htmlFor="product-description">Descripción</label>
        <textarea
          id="product-description"
          name="description"
          value={form.description}
          onChange={updateField}
          rows={3}
        />

        <label htmlFor="product-category">Categoría *</label>
        <select
          id="product-category"
          name="category"
          value={form.category}
          onChange={updateField}
          required
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <label htmlFor="product-photo">Foto del producto</label>
      
<input
  id="product-photo"
  type="file"
  accept="image/*"
  onChange={(event) => setPhoto(event.target.files?.[0] || null)}
/>

        <small>Podés sacar una foto o elegir una de la galería.</small>
        {photo && <p className="admin-hint">Foto seleccionada: {photo.name}</p>}
        {editingId && (
          <p className="admin-hint">Si no seleccionás otra foto, se conserva la imagen actual.</p>
        )}

        <div className="admin-two-columns">
          <div>
            <label htmlFor="price-retail">Precio minorista ($)</label>
            <input
              id="price-retail"
              name="priceRetail"
              type="number"
              min="0"
              step="0.01"
              value={form.priceRetail}
              onChange={updateField}
            />
          </div>
          <div>
            <label htmlFor="price-wholesale">Precio mayorista ($)</label>
            <input
              id="price-wholesale"
              name="priceWholesale"
              type="number"
              min="0"
              step="0.01"
              value={form.priceWholesale}
              onChange={updateField}
            />
          </div>
        </div>

        <label htmlFor="product-sizes">Talles</label>
        <input
          id="product-sizes"
          name="sizes"
          value={form.sizes}
          onChange={updateField}
          placeholder="Ej.: S, M, L, XL"
        />

        <label htmlFor="product-colors">Colores</label>
        <input
          id="product-colors"
          name="colors"
          value={form.colors}
          onChange={updateField}
          placeholder="Ej.: Negro, Blanco, Beige"
        />

        <label htmlFor="product-stock">Stock disponible</label>
        <input
          id="product-stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={updateField}
          required
        />

        <button type="submit" disabled={saving || deletingId !== null}>
          {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Publicar producto'}
        </button>
        {editingId && (
          <button type="button" className="admin-secondary admin-cancel-edit" onClick={cancelEdit}>
            Cancelar edición
          </button>
        )}
      </form>

      <section id="admin-products" className="admin-products">
        <h2>Productos cargados</h2>
        {products.length === 0 ? (
          <p>Todavía no hay productos para administrar.</p>
        ) : (
          products.map((product) => (
            <article className="admin-product" key={product.id}>
              {product.image_url && <img src={product.image_url} alt={product.name} />}
              <div className="admin-product-info">
                <strong>{product.name}</strong>
                <span>{product.category}</span>
                <span>Stock: {product.stock ?? 0}</span>
                <span>{product.active ? 'Activo' : 'Desactivado'}</span>
                <span>Minorista: {formatPrice(product.price_retail)}</span>
                <span>Mayorista: {formatPrice(product.price_wholesale)}</span>
                <div className="admin-product-actions">
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    disabled={deletingId !== null}
                  >
                    Editar
                  </button>
                  {product.active && (
                    <button
                      type="button"
                      className="admin-secondary"
                      onClick={() => deactivateProduct(product)}
                      disabled={deletingId !== null}
                    >
                      Desactivar
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() => deleteProduct(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <section id="admin-orders" className="admin-orders">
        <div className="admin-orders-heading">
          <div>
            <p className="admin-eyebrow">VENTAS</p>
            <h2>Pedidos recibidos</h2>
            <p className="admin-hint">
              Confirmá el pago únicamente después de verificar que el dinero ingresó a tu cuenta.
            </p>
          </div>
          <button
            type="button"
            className="admin-secondary"
            onClick={loadOrders}
            disabled={loadingOrders}
          >
            {loadingOrders ? 'Actualizando...' : 'Actualizar pedidos'}
          </button>
        </div>

        {loadingOrders && orders.length === 0 ? (
          <p>Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <p>Todavía no hay pedidos registrados.</p>
        ) : (
          <div className="admin-order-list">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : []
              const isUpdating = updatingOrderId === order.id

              return (
                <article className="admin-order" key={order.id}>
                  <div className="admin-order-header">
                    <div>
                      <p className="admin-eyebrow">PEDIDO</p>
                      <h3>#{String(order.id).slice(0, 8).toUpperCase()}</h3>
                      <span className="admin-order-date">{formatDate(order.created_at)}</span>
                    </div>
                    <strong className="admin-order-total">{formatPrice(order.total)}</strong>
                  </div>

                  <div className="admin-order-customer">
                    <p><strong>Cliente:</strong> {order.customer_name || 'Sin nombre'}</p>
                    <p><strong>Celular:</strong> {order.customer_phone || 'No informado'}</p>
                  </div>

                  <div className="admin-order-items">
                    <strong>Productos del pedido</strong>
                    {items.length === 0 ? (
                      <p>No hay detalle de productos disponible.</p>
                    ) : (
                      <ul>
                        {items.map((item, index) => (
                          <li key={`${item.product_id || item.name || 'item'}-${index}`}>
                            <span>{item.name || 'Producto'} × {Number(item.quantity || 0)}</span>
                            <span>
                              {item.subtotal == null
                                ? 'Precio a confirmar'
                                : formatPrice(item.subtotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="admin-order-statuses">
                    <div>
                      <span className={`admin-status ${order.payment_status === 'paid' ? 'is-paid' : 'is-pending'}`}>
                        {paymentLabel(order.payment_status)}
                      </span>
                    </div>
                    <label htmlFor={`order-status-${order.id}`}>Estado del pedido</label>
                    <select
                      id={`order-status-${order.id}`}
                      value={order.order_status || 'received'}
                      onChange={(event) => updateOrder(order.id, { order_status: event.target.value })}
                      disabled={isUpdating}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-order-actions">
                    {order.payment_status === 'paid' ? (
                      <button
                        type="button"
                        className="admin-secondary"
                        onClick={() => {
                          const confirmed = window.confirm(
                            '¿Querés volver a marcar este pago como pendiente?',
                          )
                          if (confirmed) updateOrder(order.id, { payment_status: 'pending' })
                        }}
                        disabled={isUpdating}
                      >
                        Volver a pendiente
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const confirmed = window.confirm(
                            'Confirmá esta acción solo si verificaste el ingreso del dinero. ¿El pago fue recibido?',
                          )
                          if (confirmed) updateOrder(order.id, { payment_status: 'paid' })
                        }}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Guardando...' : 'Confirmar pago recibido'}
                      </button>
                    )}
                    {isUpdating && <span className="admin-hint">Guardando cambios...</span>}
                  </div>
                  <p className="admin-order-note">
                    El estado del pago es manual; este panel no consulta automáticamente Mercado Pago.
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminPanel
