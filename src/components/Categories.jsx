import './Categories.css'
function Categories({ onSelectCategory }) {
  const categories = [
    {
      name: 'Damas',
      number: '01',
      description: 'MODA FEMENINA',
      image:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
      alt: 'Colección de indumentaria para damas',
      className: 'category-fashion',
    },
    {
      name: 'Hombres',
      number: '02',
      description: 'ESTILO MASCULINO',
      image:
        'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85',
      alt: 'Colección de indumentaria para hombres',
      className: 'category-men',
    },
    {
      name: 'Niños',
      number: '03',
      description: 'MODA INFANTIL',
      image:
        'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=900&q=85',
      alt: 'Colección de ropa infantil',
      className: 'category-kids',
    },
    {
      name: 'Calzados',
      number: '04',
      description: 'COMPLETÁ TU ESTILO',
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
      alt: 'Colección de calzados',
      className: 'category-shoes',
    },
  ]

  return (
    <section className="categories-section" id="categorias">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EXPLORÁ FARES FACTORY</p>
          <h2>
            ENCONTRÁ TU <span>ESTILO.</span>
          </h2>
        </div>

        <p className="section-description">
          Indumentaria y calzados para todos. Elegí tu categoría y
          descubrí nuestra colección mayorista y minorista.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`category-card ${category.className}`}
            type="button"
            onClick={() => onSelectCategory(category.name)}
          >
            <img
              src={category.image}
              alt={category.alt}
              loading="lazy"
            />

            <span className="category-overlay" />

            <span className="category-content">
              <small>
                {category.number} / {category.description}
              </small>

              <strong>{category.name.toUpperCase()}</strong>

              <span>EXPLORAR ↗</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default Categories