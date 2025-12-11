import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './products.css';
import { useNavigate } from 'react-router-dom'; // Importamos el hook para redirección

const Products = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMarca, setFiltroMarca] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState('default');
  const [busqueda, setBusqueda] = useState('');

  // Cargar productos desde el backend
  useEffect(() => {
    axios
      .get(`${API_URL}/api/productos`)
      .then(response => {
        setProductos(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error al cargar los productos. Intenta más tarde.');
        setLoading(false);
      });
  }, []);

  // Función para redirigir al detalle del producto
  const handleQuickView = (id) => {
    navigate(`/products/${id}`);  // Redirige a la ruta de detalle del producto con el ID
  };

  // Obtener marcas únicas
  const marcasUnicas = ['todas', ...new Set(productos.map(p => p.marca))];

  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter(p => {
      const cumpleBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleMarca = filtroMarca === 'todas' || p.marca === filtroMarca;
      return cumpleBusqueda && cumpleMarca;
    })
    .sort((a, b) => {
      if (ordenPrecio === 'asc') return parseFloat(a.precio_base) - parseFloat(b.precio_base);
      if (ordenPrecio === 'desc') return parseFloat(b.precio_base) - parseFloat(a.precio_base);
      return 0;
    });

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-content">
          <div className="spinner-modern"></div>
          <h3 className="loading-title">Cargando productos...</h3>
          <p className="loading-text">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-wrapper">
        <div className="container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Oops! Algo salió mal</h3>
            <p className="error-message">{error}</p>
            <button 
              className="btn-retry"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-wrapper" id="productos">
   {/* Hero Section */}
<div className="products-hero">
  <div className="container">
    <button 
      className="btn-volver-home"
      onClick={() => navigate('/home')}
    >
      ← Volver al Inicio
    </button>
    <div className="hero-content">
      <h1 className="hero-title">Descubre Nuestras Zapatillas</h1>
      <p className="hero-subtitle">Las mejores marcas y estilos para ti</p>
    </div>
  </div>
</div>

      <div className="container-lg py-5">
        {/* Filtros y Búsqueda */}
        <div className="filters-section">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filters-group">
            <div className="filter-item">
              <label className="filter-label">Marca</label>
              <select
                className="filter-select"
                value={filtroMarca}
                onChange={(e) => setFiltroMarca(e.target.value)}
              >
                {marcasUnicas.map(marca => (
                  <option key={marca} value={marca}>
                    {marca === 'todas' ? 'Todas las marcas' : marca}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Ordenar por</label>
              <select
                className="filter-select"
                value={ordenPrecio}
                onChange={(e) => setOrdenPrecio(e.target.value)}
              >
                <option value="default">Predeterminado</option>
                <option value="asc">Precio: Menor a Mayor</option>
                <option value="desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="results-info">
          <p className="results-text">
            Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> productos
          </p>
        </div>

        {/* Productos Grid */}
        {productosFiltrados.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">No se encontraron productos</h3>
            <p className="empty-text">
              {busqueda || filtroMarca !== 'todas'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'En este momento no contamos con productos en inventario'}
            </p>
            {(busqueda || filtroMarca !== 'todas') && (
              <button
                className="btn-clear-filters"
                onClick={() => {
                  setBusqueda('');
                  setFiltroMarca('todas');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="col-lg-4 col-md-6 col-sm-12">
                <div className="product-card-modern">
                  {/* Imagen */}
                  <div className="product-image-wrapper">
                    <img
                      src={producto.imagen_principal_url}
                      className="product-img"
                      alt={producto.nombre}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x400?text=Sin+Imagen'}
                    />
                    <div className="product-badges">
                      <span className="badge-marca">{producto.marca}</span>
                    </div>
                    <div className="product-overlay">
                      <button className="btn-quick-view" onClick={() => handleQuickView(producto.id)}>
                        👁️ Vista Rápida
                      </button>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="product-content">
                    <h5 className="product-name">{producto.nombre}</h5>
                    <p className="product-desc">{producto.descripcion}</p>

                    {/* Precio y acción */}
                    <div className="product-bottom">
                      <div className="price-container">
                        <span className="currency-symbol">S/</span>
                        <span className="price-value">{parseFloat(producto.precio_base).toFixed(2)}</span>
                      </div>
                      <button className="btn-add-cart">
                        <span className="cart-icon">🛒</span>
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
