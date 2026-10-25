
import { useState } from 'react'
import { supabase } from '../supabase'

function Cart({ cart = [], onClose, onUpdateQuantity }) {
  const [copied, setCopied] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const mercadoPagoAlias = 'logros.26'
  const whatsappNumber = '5491125031559'

  function getPrice(item) {
    const value =
      item.price_retail ??
      item.price_wholesale ??
      item.priceRetail ??
      item.price

    if (value === null || value === undefined || value === '') {
      return null
    }

    const price =
      typeof value === 'number'
        ? value
        : Number(String(value).trim().replace(',', '.'))

    return Number.isFinite(price) && price >= 0 ? price : null
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(value)
  }

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  )

  const cartTotal = cart.reduce((total, item) => {
    const price = getPrice(item)
    const quantity = Number(item.quantity || 0)

    return total + (price === null ? 0 : price * quantity)
  }, 0)

  const productsWithoutPrice = cart.filter(
    (item) => getPrice(item) === null
  ).length

  const pedido = cart.map((item) => {
    const price = getPrice(item)
    const quantity = Number(item.quantity || 0)

    const subtotal =
      price === null
        ? 'Precio a consultar'
        : formatPrice(price * quantity)

    return `${item.name} x ${quantity} — ${subtotal}`
  }).join('\n')

  async function copyAlias() {
    try {
      await navigator.clipboard.writeText(mercadoPagoAlias)
      setCopied(true)
    } catch {
      window.prompt('Copiá el alias de Mercado Pago:', mercadoPagoAlias)
    }
  }

  async function submitOrder(event) {
    event.preventDefault()

    if (submitting || cart.length === 0) return

    setSubmitting(true)
    setMessage('')

    // Abrimos una pestaña durante la acción del usuario para evitar
    // que el navegador bloquee WhatsApp después de guardar el pedido.
    const whatsappWindow = window.open('about:blank', '_blank')

    try {
      const orderItems = cart.map((item) => {
        const price = getPrice(item)
        const quantity = Number(item.quantity || 0)

        return {
          product_id: String(item.id),
          name: item.name || 'Producto',
          category: item.category || '',
          quantity,
          unit_price: price,
          subtotal: price === null ? null : price * quantity,
        }
      })

      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        items: orderItems,
        total: cartTotal,
        payment_status: 'pending',
        order_status: 'received',
      }

      const { error } = await supabase
        .from('orders')
        .insert(orderData)

      if (error) throw error

      const whatsappMessage =
        `Hola, quiero realizar un pedido en FARES FACTORY.\n\n` +
        `Cliente: ${customerName.trim()}\n` +
        `Celular: ${customerPhone.trim()}\n\n` +
        `${pedido}\n\n` +
        `Total minorista estimado: ${formatPrice(cartTotal)}\n` +
        (productsWithoutPrice > 0
          ? `Hay ${productsWithoutPrice} producto(s) con precio a confirmar.\n`
          : '') +
        `Alias de Mercado Pago: ${mercadoPagoAlias}\n\n` +
        `Pedido registrado. Pendiente de confirmar el pago.`

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}?text=` +
        encodeURIComponent(whatsappMessage)

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl
      } else {
        window.location.assign(whatsappUrl)
      }
    } catch (error) {
      console.error('Error al registrar el pedido:', error)

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close()
      }

      setMessage(
        `No pudimos registrar el pedido: ${
          error.message || 'Error desconocido'
        }. Revisá tu conexión e intentá nuevamente.`
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside
        className="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Mi carrito"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-header">
          <h2>MI CARRITO ({cartCount})</h2>

          <button
            type="button"
            className="cart-close"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Tu carrito está vacío.</p>
            <span>¡Encontrá tus favoritos en FARES FACTORY!</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const price = getPrice(item)
                const quantity = Number(item.quantity || 0)

                return (
                  <article className="cart-item" key={item.id}>
                    <img
                      src={item.image || item.image_url}
                      alt={item.name}
                    />

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>

                      <p>
                        {price === null
                          ? 'Precio a consultar'
                          : `Precio unitario: ${formatPrice(price)}`}
                      </p>

                      {price !== null && (
                        <p>
                          Subtotal: {formatPrice(price * quantity)}
                        </p>
                      )}

                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label={`Quitar una unidad de ${item.name}`}
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label={`Agregar una unidad de ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="cart-total">
              <span>Total minorista estimado</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            {productsWithoutPrice > 0 && (
              <p className="cart-note" role="status">
                Hay {productsWithoutPrice} producto(s) sin precio.
                El total mostrado es parcial y deberá confirmarse.
              </p>
            )}

            <div className="transfer-box">
              <h3>💛 PAGÁ POR TRANSFERENCIA</h3>

              <p>
                El pedido quedará pendiente de pago hasta verificar
                que la transferencia se haya acreditado.
              </p>

              <div className="transfer-alias">
                <span>Alias de Mercado Pago</span>
                <strong>{mercadoPagoAlias}</strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={copyAlias}
              >
                {copied ? 'ALIAS COPIADO ✓' : 'COPIAR ALIAS'}
              </button>
            </div>

            <form onSubmit={submitOrder} className="order-form">
              <h3>DATOS PARA TU PEDIDO</h3>

              <label htmlFor="customer-name">Nombre y apellido *</label>
              <input
                id="customer-name"
                type="text"
                autoComplete="name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                minLength={2}
                maxLength={120}
                required
              />

              <label htmlFor="customer-phone">Celular de contacto *</label>
              <input
                id="customer-phone"
                type="tel"
                autoComplete="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Ej.: 11 1234 5678"
                maxLength={30}
                required
              />

              {message && (
                <p className="cart-note" role="alert">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="checkout-button"
                disabled={submitting}
              >
                {submitting
                  ? 'REGISTRANDO PEDIDO...'
                  : 'CONFIRMAR PEDIDO Y ABRIR WHATSAPP'}
              </button>
            </form>

            <p className="cart-note">
              Confirmaremos el pago una vez verificado el ingreso
              en Mercado Pago. Guardar el pedido no significa que
              el pago esté acreditado.
            </p>
          </>
        )}
      </aside>
    </div>
  )
}

export default Cart
