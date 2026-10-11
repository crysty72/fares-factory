
function ProductCatalog({
  products,
  categories,
  activeCategory,
  onSelectCategory,
  onAddToCart,
}) {
  function getDisplayPrice(product) {
    if (product.displayPrice) return product.displayPrice

    if (
      product.price !== null &&
      product.price !== undefined &&
      product.price !== ''
    ) {
      return typeof product.price === 'number'
        ? product.price.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2,
          })
        : product.price
    }

    return 'Consultá el precio'
  }

  return (
    <section className="catalog" id="catalogo">
      <div className="section-heading">
        <div>
          <p className="eyebrow">NUESTRA SELECCIÓN</p>
          <h2>
            EL CATÁLOGO<span>.</span>
          </h2>
        </div>

        <p className="section-description">
          Encontrá tus próximos favoritos en FARES FACTORY.
        </p>
      </div>

      <div className="catalog-filters" aria-label="Filtrar productos">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={
              activeCategory === category
                ? 'filter-button active'
                : 'filter-button'
            }
            aria-pressed={activeCategory === category}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="empty-products">
          <p>No encontramos productos en esta categoría.</p>
          <span>
            Pronto habrá nuevas opciones para descubrir.
          </span>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <img
                  src={
                    product.image ||
                    product.image_url ||
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85'
                  }
                  alt={product.name}
                  loading="lazy"
                />

                <span className="product-tag">
                  FARES FACTORY
                </span>
              </div>

              <div className="product-info">
                <p className="product-category">
                  {product.category || 'Indumentaria'}
                </p>

                <h3>{product.name}</h3>

                {product.description && (
                  <p className="product-description">
                    {product.description}
                  </p>
                )}

                <p className="product-price">
                  {getDisplayPrice(product)}
                </p>

                <button
                  className="add-button"
                  type="button"
                  onClick={() => onAddToCart(product)}
                  aria-label={`Agregar ${product.name} al carrito`}
                >
                  AGREGAR AL CARRITO <span>+</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductCatalog
