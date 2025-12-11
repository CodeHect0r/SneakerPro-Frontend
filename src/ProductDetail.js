import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config/api';
import Swal from 'sweetalert2'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/productos/${id}`)
      .then(response => {
        setProducto(response.data.product);
        setVariantes(response.data.variants);
        setLoading(false);
      })
      .catch(error => {
        setError('Error al cargar el producto');
        setLoading(false);
      });
  }, [id]);

  const handleAgregarCarrito = () => {
  if (!tallaSeleccionada) {
    alert('Por favor selecciona una talla');
    return;
  }
  
  // Almacenamos el producto en el carrito (en localStorage)
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.push({
    productoId: producto.id,
    varianteId: tallaSeleccionada.id,  // ← AGREGAR ESTA LÍNEA
    nombre: producto.nombre,
    marca: producto.marca,              // ← AGREGAR ESTA LÍNEA
    talla: tallaSeleccionada.talla,
    cantidad: cantidad,
    precio: producto.precio_base,
    imagen: producto.imagen_principal_url,
    stock: tallaSeleccionada.stock      // ← AGREGAR ESTA LÍNEA
  });
  localStorage.setItem('carrito', JSON.stringify(carrito));

  // Muestra una alerta con SweetAlert2
  Swal.fire({
    title: 'Producto agregado al carrito',
    text: `${producto.nombre} - Talla: ${tallaSeleccionada.talla} - Cantidad: ${cantidad}`,
    icon: 'success',
    confirmButtonText: 'Ir al carrito',
  }).then(() => {
    // Redirigir a la página del carrito después de que se cierre la alerta
    navigate('/carrito');
  });
};

  const stockDisponible = tallaSeleccionada ? tallaSeleccionada.stock : 0;
  
  // Usar useMemo para asegurar que el cálculo se actualice correctamente
  const precioTotal = useMemo(() => {
    if (!producto) return '0.00';
    const precioBase = parseFloat(producto.precio_base);
    const cantidadNum = parseInt(cantidad);
    const total = precioBase * cantidadNum;
    console.log('Calculando precio:', { precioBase, cantidadNum, total: total.toFixed(2) });
    return total.toFixed(2);
  }, [producto, cantidad]);

  if (loading) {
    return (
      <div className="loading-wrapper-detail">
        <div className="loading-content-detail">
          <div className="spinner-modern-detail"></div>
          <h3 className="loading-title-detail">Cargando detalles...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-wrapper-detail">
        <div className="container">
          <div className="error-card-detail">
            <div className="error-icon-detail">⚠️</div>
            <h3 className="error-title-detail">Producto no encontrado</h3>
            <p className="error-message-detail">{error}</p>
            <button 
              className="btn-back-products"
              onClick={() => navigate('/productos')}
            >
              ← Volver a productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return null;
  }

  return (
    <div className="product-detail-wrapper">
      <div className="container py-5">
        <div className="row g-5">
          {/* Imagen del Producto */}
          <div className="col-lg-6">
            <div className="single-image-section">
              <div className="main-image-container">
                <img 
                  src={producto.imagen_principal_url} 
                  alt={producto.nombre}
                  className="main-product-image"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/600x600?text=Sin+Imagen'}
                />
                <div className="image-badge">{producto.marca}</div>
              </div>
              
            
              {/* Información decorativa debajo de la imagen */}
              <div className="image-info-cards">
                <div className="info-card-small">
                  <span className="info-card-icon">✓</span>
                  <span className="info-card-text">Producto Original</span>
                </div>
                <div className="info-card-small">
                  <span className="info-card-icon">🏷️</span>
                  <span className="info-card-text">Garantizado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Producto */}
          <div className="col-lg-6">
            <div className="product-info-section">
              {/* Header */}
              <div className="product-header">
                <h1 className="product-title-detail">{producto.nombre}</h1>
                <div className="product-meta">
                  <span className="meta-badge">✓ En Stock</span>
                  <span className="meta-badge-marca">{producto.marca}</span>
                </div>
              </div>

              {/* Precio */}
              <div className="price-section">
                <div className="price-main">
                  <span className="currency">S/</span>
                  <span className="price">{parseFloat(producto.precio_base).toFixed(2)}</span>
                  <span className="price-per-unit">por unidad</span>
                </div>
                <div className="price-total" key={`total-${cantidad}-${precioTotal}`}>
                  <div className="total-label">Total a pagar:</div>
                  <div className="total-value">S/ {precioTotal}</div>
                </div>
              </div>

              {/* Descripción */}
              <div className="description-section">
                <h3 className="section-title">Descripción</h3>
                <p className="product-description-detail">{producto.descripcion}</p>
              </div>

              {/* Selector de Talla */}
              <div className="size-section">
                <h3 className="section-title">
                  Selecciona tu talla
                
                </h3>
                <div className="sizes-grid">
                  {variantes.map((variant) => (
                    <button
                      key={variant.id}
                      className={`size-button ${tallaSeleccionada?.id === variant.id ? 'active' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                      onClick={() => variant.stock > 0 && setTallaSeleccionada(variant)}
                      disabled={variant.stock === 0}
                    >
                      <span className="size-label">{variant.talla}</span>
                      {variant.stock === 0 && <span className="size-status">Agotado</span>}
                      {variant.stock > 0 && variant.stock <= 5 && (
                        <span className="size-status low-stock">Solo {variant.stock}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cantidad */}
              {tallaSeleccionada && (
                <div className="quantity-section">
                  <h3 className="section-title">Cantidad</h3>
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      disabled={cantidad <= 1}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      className="qty-input"
                      value={cantidad}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= stockDisponible) {
                          setCantidad(val);
                        } else if (e.target.value === '') {
                          setCantidad(1);
                        }
                      }}
                      min="1"
                      max={stockDisponible}
                    />
                    <button 
                      className="qty-btn"
                      onClick={() => setCantidad(Math.min(stockDisponible, cantidad + 1))}
                      disabled={cantidad >= stockDisponible}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="actions-section">
                <button 
                  className={`btn-add-to-cart ${!tallaSeleccionada ? 'disabled' : ''}`}
                  onClick={handleAgregarCarrito}
                  disabled={!tallaSeleccionada}
                >
                  <span className="btn-icon-cart">🛒</span>
                  {tallaSeleccionada ? 'Agregar al carrito' : 'Agregar al carrito'}
                </button>
                <button className="btn-favorite">
                  <span>♡</span>
                </button>
              </div>

              {/* Información Adicional */}
              <div className="additional-info">
                <div className="info-item-detail">
                  <span className="info-icon">🚚</span>
                  <div className="info-text">
                    <strong>Envío gratis</strong>
                    <span>En compras mayores a S/ 150</span>
                  </div>
                </div>
                <div className="info-item-detail">
                  <span className="info-icon">↩️</span>
                  <div className="info-text">
                    <strong>Devoluciones fáciles</strong>
                    <span>30 días para cambios</span>
                  </div>
                </div>
                <div className="info-item-detail">
                  <span className="info-icon">✓</span>
                  <div className="info-text">
                    <strong>Garantía de calidad</strong>
                    <span>Productos 100% originales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
