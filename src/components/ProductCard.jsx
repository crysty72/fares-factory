
function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        <span className="product-tag">FARES FACTORY</span>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-price">{product.price}</p>

        <button
          className="add-button"
          type="button"
          onClick={() => onAddToCart(product)}
        >
          AGREGAR AL CARRITO <span>+</span>
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
