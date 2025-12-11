import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';  
import './Carrito.css';

const Carrito = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [codigoDescuento, setCodigoDescuento] = useState('');
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);

  // Cargar el carrito desde el localStorage (solo la primera vez)
  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(carritoGuardado);
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }, [carrito]);

  // Función para eliminar un producto del carrito
  const eliminarProducto = (productoId, talla) => {
  if (window.confirm('¿Estás seguro de eliminar este producto?')) {
    const nuevoCarrito = carrito.filter(
      item => !(item.productoId === productoId && item.talla === talla)
    );
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito)); // AGREGAR
  }
};
  // Función para actualizar la cantidad de un producto
  const actualizarCantidad = (productoId, talla, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const nuevoCarrito = carrito.map(item => {
      if (item.productoId === productoId && item.talla === talla) {
        // Verificar stock si existe
        if (item.stock && nuevaCantidad > item.stock) {
          alert(`Solo hay ${item.stock} unidades disponibles`);
          return item;
        }
        return { ...item, cantidad: parseInt(nuevaCantidad) };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
  };

  // Vaciar carrito completo
 const vaciarCarrito = () => {
  if (window.confirm('¿Estás seguro de vaciar todo el carrito?')) {
    setCarrito([]);
    localStorage.setItem('carrito', JSON.stringify([])); // AGREGAR
    setDescuentoAplicado(null);
  }
};

  // Aplicar código de descuento
  const aplicarDescuento = () => {
    const codigosValidos = {
      'DESCUENTO10': 10,
      'VERANO20': 20,
      'PRIMERACOMPRA': 15
    };

    const codigo = codigoDescuento.toUpperCase().trim();
    
    if (codigosValidos[codigo]) {
      setDescuentoAplicado({
        codigo: codigo,
        porcentaje: codigosValidos[codigo]
      });
      alert(`¡Descuento del ${codigosValidos[codigo]}% aplicado!`);
      setCodigoDescuento('');
    } else {
      alert('Código de descuento inválido');
    }
  };

  const removerDescuento = () => {
    setDescuentoAplicado(null);
  };

  // Calcular totales usando useMemo para evitar problemas de renderizado
 const subtotal = useMemo(() => {
  return carrito.reduce((total, item) => {
    return total + (parseFloat(item.precio) * parseInt(item.cantidad));
  }, 0);
}, [carrito]);

const descuento = useMemo(() => {
  if (!descuentoAplicado) return 0;
  return (subtotal * descuentoAplicado.porcentaje) / 100;
}, [subtotal, descuentoAplicado]);

const envio = useMemo(() => {
  if (carrito.length === 0) return 0;
  return subtotal >= 150 ? 0 : 15.00;
}, [subtotal, carrito.length]);

// 👇 AGREGAR CÁLCULO DE IGV
const baseImponible = useMemo(() => {
  return subtotal - descuento + envio;
}, [subtotal, descuento, envio]);

const igv = useMemo(() => {
  return baseImponible * 0.18;
}, [baseImponible]);

const total = useMemo(() => {
  return baseImponible + igv;
}, [baseImponible, igv]);

  // Procesar compra
 const procesarCompra = async () => {
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agrega productos antes de finalizar la compra.',
      confirmButtonColor: '#5b21b6'
    });
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Inicia sesión',
      text: 'Debes iniciar sesión para realizar una compra.',
      confirmButtonColor: '#5b21b6',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Iniciar Sesión'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
    return;
  }

  // Redirigir a la página de checkout
  navigate('/checkout');
};


  if (loading) {
    return (
      <div className="loading-wrapper-carrito">
        <div className="loading-content-carrito">
          <div className="spinner-carrito"></div>
          <h3>Procesando...</h3>
          <p>Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-wrapper">
      <div className="container py-5">
        {/* Header del Carrito */}
        <div className="carrito-header">
          <div className="header-content-carrito">
            <h1 className="carrito-title">
              <span className="title-icon">🛒</span>
              Mi Carrito de Compras
            </h1>
            <p className="carrito-subtitle">
              {carrito.length === 0 
                ? 'No hay productos en tu carrito' 
                : `${carrito.length} ${carrito.length === 1 ? 'producto' : 'productos'} en tu carrito`
              }
            </p>
          </div>
          {carrito.length > 0 && (
            <button className="btn-vaciar-carrito" onClick={vaciarCarrito}>
              🗑️ Vaciar carrito
            </button>
          )}
        </div>

        {carrito.length === 0 ? (
          /* Carrito Vacío */
          <div className="carrito-vacio">
            <div className="vacio-icon">🛒</div>
            <h2 className="vacio-title">Tu carrito está vacío</h2>
            <p className="vacio-text">
              ¡Descubre nuestros increíbles productos y encuentra lo que buscas!
            </p>
            <button 
              className="btn-volver-productos"
              onClick={() => navigate('/products')}
            >
              <span className="btn-icon">←</span>
              Ver Productos
            </button>
          </div>
        ) : (
          /* Carrito con Productos */
          <div className="row g-4">
            {/* Lista de Productos */}
            <div className="col-lg-8">
              <div className="productos-carrito-section">
                <h3 className="section-title-carrito">Productos seleccionados</h3>
                
                <div className="productos-lista">
                  {carrito.map((item, index) => (
                    <div key={`${item.productoId}-${item.talla}-${index}`} className="producto-carrito-card">
                      {/* Imagen */}
                      <div className="producto-imagen-carrito">
                        <img 
                          src={item.imagen} 
                          alt={item.nombre}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/150x150?text=Producto'}
                        />
                      </div>

                      {/* Información */}
                      <div className="producto-info-carrito">
                        <h4 className="producto-nombre-carrito">{item.nombre}</h4>
                        <div className="producto-meta-carrito">
                          {item.marca && (
                            <span className="meta-badge-carrito">
                              <strong>Marca:</strong> {item.marca}
                            </span>
                          )}
                          <span className="meta-badge-carrito">
                            <strong>Talla:</strong> {item.talla}
                          </span>
                        </div>
                        <div className="producto-precio-carrito">
                          <span className="precio-unitario">S/ {parseFloat(item.precio).toFixed(2)}</span>
                          <span className="precio-label">por unidad</span>
                        </div>
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="producto-controles-carrito">
                        <div className="cantidad-wrapper">
                          <label className="cantidad-label">Cantidad</label>
                          <div className="cantidad-control-carrito">
                            <button 
                              className="qty-btn-carrito"
                              onClick={() => actualizarCantidad(item.productoId, item.talla, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                            >
                              −
                            </button>
                            <input 
                              type="number" 
                              className="qty-input-carrito"
                              value={item.cantidad}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1) {
                                  actualizarCantidad(item.productoId, item.talla, val);
                                }
                              }}
                              min="1"
                              max={item.stock || 999}
                            />
                            <button 
                              className="qty-btn-carrito"
                              onClick={() => actualizarCantidad(item.productoId, item.talla, item.cantidad + 1)}
                              disabled={item.stock && item.cantidad >= item.stock}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Subtotal del producto */}
                        <div className="producto-subtotal" key={`subtotal-${item.productoId}-${item.talla}-${item.cantidad}`}>
                          <span className="subtotal-label">Subtotal</span>
                          <span className="subtotal-value">
                            S/ {(parseFloat(item.precio) * parseInt(item.cantidad)).toFixed(2)}
                          </span>
                        </div>

                        {/* Botón Eliminar */}
                        <button 
                          className="btn-eliminar-producto"
                          onClick={() => eliminarProducto(item.productoId, item.talla)}
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen del Pedido */}
            <div className="col-lg-4">
              <div className="resumen-pedido">
                <h3 className="resumen-title">Resumen del Pedido</h3>

                {/* Código de Descuento */}
                <div className="descuento-section">
                  <label className="descuento-label">¿Tienes un código de descuento?</label>
                  <div className="descuento-input-group">
                    <input 
                      type="text"
                      className="descuento-input"
                      placeholder="Ingresa tu código"
                      value={codigoDescuento}
                      onChange={(e) => setCodigoDescuento(e.target.value)}
                      disabled={descuentoAplicado !== null}
                    />
                    <button 
                      className="btn-aplicar-descuento"
                      onClick={aplicarDescuento}
                      disabled={!codigoDescuento.trim() || descuentoAplicado !== null}
                    >
                      Aplicar
                    </button>
                  </div>
                  {descuentoAplicado && (
                    <div className="descuento-aplicado">
                      <span className="descuento-badge">
                        ✓ {descuentoAplicado.codigo} ({descuentoAplicado.porcentaje}% OFF)
                      </span>
                      <button 
                        className="btn-remover-descuento"
                        onClick={removerDescuento}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Desglose de Precios */}
<div className="desglose-precios">
  <div className="precio-row">
    <span>Subtotal</span>
    <span key={`subtotal-${subtotal}`}>S/ {subtotal.toFixed(2)}</span>
  </div>
  
  {descuentoAplicado && (
    <div className="precio-row descuento-row">
      <span>Descuento ({descuentoAplicado.porcentaje}%)</span>
      <span className="descuento-amount" key={`descuento-${descuento}`}>
        -S/ {descuento.toFixed(2)}
      </span>
    </div>
  )}

  <div className="precio-row">
    <span>Envío</span>
    <span key={`envio-${envio}`}>
      {envio === 0 ? (
        <span className="envio-gratis">GRATIS</span>
      ) : (
        `S/ ${envio.toFixed(2)}`
      )}
    </span>
  </div>

  {subtotal < 150 && subtotal > 0 && (
    <div className="envio-info">
      💡 Agrega S/ {(150 - subtotal).toFixed(2)} más para envío gratis
    </div>
  )}

  {/* 👇 AGREGAR LÍNEA SEPARADORA Y DESGLOSE IGV AQUÍ */}
  <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid #e5e7eb'}} />

  <div className="precio-row" style={{fontSize: '0.9em', color: '#6b7280'}}>
    <span>Base Imponible</span>
    <span key={`base-${baseImponible}`}>S/ {baseImponible.toFixed(2)}</span>
  </div>

  <div className="precio-row" style={{fontSize: '0.9em', color: '#6b7280'}}>
    <span>IGV (18%)</span>
    <span key={`igv-${igv}`}>S/ {igv.toFixed(2)}</span>
  </div>

  {/* 👇 LÍNEA SEPARADORA ANTES DEL TOTAL */}
  <hr style={{margin: '15px 0', border: 'none', borderTop: '2px solid #000'}} />

  <div className="precio-row total-row">
    <span>Total</span>
    <span className="total-amount" key={`total-${total}`}>
      S/ {total.toFixed(2)}
    </span>
  </div>
</div>
                {/* Botones de Acción */}
                <div className="resumen-actions">
                  <button 
                    className="btn-finalizar-compra"
                    onClick={procesarCompra}
                  >
                    <span className="btn-icon">💳</span>
                    Finalizar Compra
                  </button>
                  <button 
                    className="btn-seguir-comprando"
                    onClick={() => navigate('/products')}
                  >
                    ← Seguir Comprando
                  </button>
                </div>

                {/* Información Adicional */}
                <div className="info-adicional-carrito">
                  <div className="info-item-carrito">
                    <span className="info-icon-carrito">🔒</span>
                    <span className="info-text-carrito">Pago 100% seguro</span>
                  </div>
                  <div className="info-item-carrito">
                    <span className="info-icon-carrito">📦</span>
                    <span className="info-text-carrito">Envío a todo el país</span>
                  </div>
                  <div className="info-item-carrito">
                    <span className="info-icon-carrito">↩️</span>
                    <span className="info-text-carrito">Devolución gratuita</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carrito;
