import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import './RegistroGuiaRemision.css';

const RegistroGuiaRemision = () => {
  // Estados para registro
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [guiaData, setGuiaData] = useState(null);
  const [resumen, setResumen] = useState(null);

  // Estados para historial
  const [tabActiva, setTabActiva] = useState('registro'); // 'registro' o 'historial'
  const [guias, setGuias] = useState([]);
  const [guiaSeleccionada, setGuiaSeleccionada] = useState(null);
  const [detalles, setDetalles] = useState([]);

  // Cargar historial al cambiar a esa tab
  useEffect(() => {
    if (tabActiva === 'historial') {
      cargarHistorial();
    }
  }, [tabActiva]);

  // ========== FUNCIONES DE REGISTRO ==========
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(null);
      setResumen(null);
    }
  };

  const handleUpload = async () => {
    if (!archivo) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await axios.post(`${API_URL}/api/guias/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setGuiaData(response.data.guia);
      setPreview(response.data.productos);

    } catch (error) {
      console.error('Error al procesar guía:', error);
      alert(error.response?.data?.message || 'Error al procesar la guía');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProducto = async (index, campo, valor) => {
    const nuevosProductos = [...preview];
    nuevosProductos[index][campo] = valor;
    
    if (campo === 'marca' || campo === 'modelo' || campo === 'talla') {
      const prod = nuevosProductos[index];
      
      if (prod.marca && prod.modelo && prod.talla) {
        try {
          const response = await axios.post(
            `${API_URL}/api/guias/validar-producto`,
            {
              marca: prod.marca,
              modelo: prod.modelo,
              talla: prod.talla
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          nuevosProductos[index].existe_en_bd = response.data.existe_producto;
          nuevosProductos[index].producto_id = response.data.producto_id;
          nuevosProductos[index].variante_existe = response.data.variante_existe;
          nuevosProductos[index].variante_id = response.data.variante_id;
          nuevosProductos[index].stock_actual = response.data.stock_actual || 0;
          
          if (response.data.variante_existe) {
            nuevosProductos[index].stock_nuevo = response.data.stock_actual + prod.cantidad;
            nuevosProductos[index].accion = `ACTUALIZAR STOCK (+${prod.cantidad})`;
          } else if (response.data.existe_producto) {
            nuevosProductos[index].stock_nuevo = prod.cantidad;
            nuevosProductos[index].accion = 'AGREGAR NUEVA TALLA AL PRODUCTO EXISTENTE';
          } else {
            nuevosProductos[index].stock_nuevo = prod.cantidad;
            nuevosProductos[index].accion = 'CREAR NUEVO PRODUCTO + VARIANTE';
          }
        } catch (error) {
          console.error('❌ Error al re-validar producto:', error);
        }
      }
    }
    
    setPreview(nuevosProductos);
  };

  const handleEditGuia = (campo, valor) => {
    setGuiaData({ ...guiaData, [campo]: valor });
  };

  const handleConfirmar = async () => {
    // Validar campos obligatorios
    const incompletos = preview.filter(p => !p.marca || !p.modelo || !p.talla);
    
    if (incompletos.length > 0) {
      alert(`Hay ${incompletos.length} producto(s) sin marca, modelo o talla. Por favor completar antes de confirmar.`);
      return;
    }

    // 👇 NUEVA VALIDACIÓN: Verificar que todos tengan precio
    const sinPrecio = preview.filter(p => !p.costo_unitario || p.costo_unitario <= 0);
    
    if (sinPrecio.length > 0) {
      const confirmar = window.confirm(
        `⚠️ Hay ${sinPrecio.length} producto(s) sin precio unitario.\n\n` +
        `¿Deseas continuar de todos modos? (No recomendado para análisis de compras/ventas)`
      );
      if (!confirmar) return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/guias/confirmar`, {
        guia: guiaData,
        productos: preview
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setResumen(response.data.resumen);
      alert('¡Guía procesada exitosamente!');
      
      setArchivo(null);
      setPreview(null);
      setGuiaData(null);

    } catch (error) {
      console.error('Error al confirmar guía:', error);
      alert(error.response?.data?.message || 'Error al guardar la guía');
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES DE HISTORIAL ==========

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/guias/historial`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setGuias(response.data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      alert('Error al cargar el historial de guías');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (guiaId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/guias/${guiaId}/detalle`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setGuiaSeleccionada(response.data.guia);
      setDetalles(response.data.detalles);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar el detalle de la guía');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularTotalGuia = () => {
    return detalles.reduce((sum, d) => 
      sum + ((d.cantidad || 0) * (d.costo_unitario || 0)), 0
    ).toFixed(2);
  };

  // ========== RENDER ==========

  return (
    <div className="registro-guia-container">
      {/* Tabs */}
      <div className="tabs-header">
        <button 
          className={`tab ${tabActiva === 'registro' ? 'active' : ''}`}
          onClick={() => setTabActiva('registro')}
        >
          📋 Registrar Guía
        </button>
        <button 
          className={`tab ${tabActiva === 'historial' ? 'active' : ''}`}
          onClick={() => setTabActiva('historial')}
        >
          📚 Historial de Guías
        </button>
      </div>

      {/* TAB: REGISTRO */}
      {tabActiva === 'registro' && (
        <>
          <h2>📋 Registro de Guía de Remisión</h2>

          {!preview && (
            <div className="upload-section">
              <div className="upload-box">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  id="file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-input" className="upload-label">
                  {archivo ? `📄 ${archivo.name}` : '📁 Seleccionar archivo PDF'}
                </label>
              </div>

              {archivo && (
                <button 
                  onClick={handleUpload} 
                  disabled={loading}
                  className="btn-procesar"
                >
                  {loading ? '⏳ Procesando...' : '🚀 Procesar Guía'}
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Extrayendo datos de la guía...</p>
            </div>
          )}

          {preview && !resumen && (
            <div className="preview-section">
              <h3>✅ Vista previa - Verificar y editar</h3>

              <div className="guia-cabecera">
                <div className="form-group">
                  <label>Número de Guía:</label>
                  <input 
                    type="text" 
                    value={guiaData.numero_guia || ''}
                    onChange={(e) => handleEditGuia('numero_guia', e.target.value)}
                    placeholder="Ej: 001-00123"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Emisión:</label>
                  <input 
                    type="date" 
                    value={guiaData.fecha_emision || ''}
                    onChange={(e) => handleEditGuia('fecha_emision', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Proveedor:</label>
                  <input 
                    type="text" 
                    value={guiaData.proveedor || ''}
                    onChange={(e) => handleEditGuia('proveedor', e.target.value)}
                    placeholder="Nombre del proveedor"
                  />
                </div>
              </div>

              <div className="tabla-preview">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cantidad</th>
                      <th>Descripción Original</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Talla</th>
                      <th>Precio Unit. (S/)</th>
                      <th>Acción</th>
                      <th>Stock Nuevo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((prod, index) => (
                      <tr key={index} className={prod.error ? 'row-error' : ''}>
                        <td>{prod.linea_numero}</td>
                        <td>{prod.cantidad}</td>
                        <td className="descripcion-original">{prod.descripcion_original}</td>
                        <td>
                          <input 
                            type="text" 
                            value={prod.marca || ''}
                            onChange={(e) => handleEditProducto(index, 'marca', e.target.value)}
                            placeholder="Marca"
                            className={!prod.marca ? 'campo-vacio' : ''}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={prod.modelo || ''}
                            onChange={(e) => handleEditProducto(index, 'modelo', e.target.value)}
                            placeholder="Modelo"
                            className={!prod.modelo ? 'campo-vacio' : ''}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={prod.talla || ''}
                            onChange={(e) => handleEditProducto(index, 'talla', e.target.value)}
                            placeholder="Talla"
                            className={!prod.talla ? 'campo-vacio' : ''}
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            value={prod.costo_unitario || ''}
                            onChange={(e) => handleEditProducto(index, 'costo_unitario', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className={!prod.costo_unitario || prod.costo_unitario <= 0 ? 'campo-vacio' : ''}
                            style={{ width: '90px', textAlign: 'right' }}
                          />
                        </td>
                        <td>
                          <span className={`badge ${prod.existe_en_bd ? 'badge-update' : 'badge-new'}`}>
                            {prod.accion}
                          </span>
                          {prod.error && (
                            <div className="error-mensaje">⚠️ {prod.error}</div>
                          )}
                        </td>
                        <td className="stock-nuevo">
                          {prod.stock_actual > 0 && (
                            <span className="stock-actual">{prod.stock_actual} → </span>
                          )}
                          <span className="stock-final">{prod.stock_nuevo}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="botones-accion">
                <button 
                  onClick={() => {
                    setPreview(null);
                    setGuiaData(null);
                    setArchivo(null);
                  }}
                  className="btn-cancelar"
                >
                  ❌ Cancelar
                </button>
                <button 
                  onClick={handleConfirmar}
                  disabled={loading}
                  className="btn-confirmar"
                >
                  {loading ? '⏳ Guardando...' : '✅ Confirmar y Guardar'}
                </button>
              </div>
            </div>
          )}

          {resumen && (
            <div className="resumen-section">
              <h3>✅ Guía Procesada Exitosamente</h3>
              
              <div className="resumen-cards">
                <div className="card-resumen productos-creados">
                  <div className="card-icon">🆕</div>
                  <div className="card-info">
                    <h4>Productos Nuevos</h4>
                    <p className="numero">{resumen.productos_creados}</p>
                  </div>
                </div>

                <div className="card-resumen variantes-creadas">
                  <div className="card-icon">👟</div>
                  <div className="card-info">
                    <h4>Tallas Nuevas</h4>
                    <p className="numero">{resumen.variantes_creadas}</p>
                  </div>
                </div>

                <div className="card-resumen variantes-actualizadas">
                  <div className="card-icon">📦</div>
                  <div className="card-info">
                    <h4>Stock Actualizado</h4>
                    <p className="numero">{resumen.variantes_actualizadas}</p>
                  </div>
                </div>

                {resumen.errores.length > 0 && (
                  <div className="card-resumen errores">
                    <div className="card-icon">⚠️</div>
                    <div className="card-info">
                      <h4>Errores</h4>
                      <p className="numero">{resumen.errores.length}</p>
                    </div>
                  </div>
                )}
              </div>

              {resumen.errores.length > 0 && (
                <div className="errores-detalle">
                  <h4>⚠️ Errores durante el procesamiento:</h4>
                  <ul>
                    {resumen.errores.map((err, index) => (
                      <li key={index}>
                        <strong>Línea {err.linea}:</strong> {err.descripcion} - {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                onClick={() => {
                  setResumen(null);
                  setArchivo(null);
                  setPreview(null);
                  setGuiaData(null);
                }}
                className="btn-nueva-guia"
              >
                📋 Registrar Nueva Guía
              </button>
            </div>
          )}
        </>
      )}

      {/* TAB: HISTORIAL */}
      {tabActiva === 'historial' && (
        <div className="historial-section">
          <h2>📚 Historial de Guías de Remisión</h2>

          {loading && <div className="loading">Cargando historial...</div>}

          <div className="historial-content">
            {/* Lista de guías */}
            <div className="guias-list">
              <h3>Guías Registradas ({guias.length})</h3>
              {guias.length === 0 && !loading && (
                <div className="empty-state">
                  <p>📦 No hay guías registradas aún</p>
                </div>
              )}
              {guias.map((guia) => (
                <div 
                  key={guia.id} 
                  className={`guia-card ${guiaSeleccionada?.id === guia.id ? 'active' : ''}`}
                  onClick={() => verDetalle(guia.id)}
                >
                  <div className="guia-header">
                    <span className="guia-numero">📄 {guia.numero_guia}</span>
                    <span className="guia-fecha">{formatearFecha(guia.creado_en)}</span>
                  </div>
                  <div className="guia-info">
                    <p><strong>Proveedor:</strong> {guia.proveedor}</p>
                    <p><strong>Productos:</strong> {guia.total_lineas} líneas</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detalle de guía seleccionada */}
            {guiaSeleccionada && (
              <div className="guia-detalle">
                <div className="detalle-header">
                  <h3>Detalle de Guía: {guiaSeleccionada.numero_guia}</h3>
                  <button 
                    className="btn-cerrar"
                    onClick={() => {
                      setGuiaSeleccionada(null);
                      setDetalles([]);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="detalle-info">
                  <div className="info-row">
                    <label>Número de Guía:</label>
                    <span>{guiaSeleccionada.numero_guia}</span>
                  </div>
                  <div className="info-row">
                    <label>Fecha de Emisión:</label>
                    <span>{formatearFecha(guiaSeleccionada.fecha_emision)}</span>
                  </div>
                  <div className="info-row">
                    <label>Proveedor:</label>
                    <span>{guiaSeleccionada.proveedor}</span>
                  </div>
                  <div className="info-row">
                    <label>Total de Líneas:</label>
                    <span>{guiaSeleccionada.total_lineas}</span>
                  </div>
                  <div className="info-row">
                    <label>Registrada el:</label>
                    <span>{formatearFecha(guiaSeleccionada.creado_en)}</span>
                  </div>
                </div>

                <h4>Productos:</h4>
                <div className="tabla-detalle">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cantidad</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Talla</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                        <th>Stock Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((detalle) => (
                        <tr key={detalle.linea_numero}>
                          <td>{detalle.linea_numero}</td>
                          <td>{detalle.cantidad}</td>
                          <td>{detalle.marca}</td>
                          <td>{detalle.modelo}</td>
                          <td>{detalle.talla}</td>
                          <td className="precio">S/ {detalle.costo_unitario?.toFixed(2) || '0.00'}</td>
                          <td className="subtotal">
                            S/ {((detalle.cantidad || 0) * (detalle.costo_unitario || 0)).toFixed(2)}
                          </td>
                          <td className="stock">{detalle.stock_actual || 0}</td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '10px' }}>
                          TOTAL:
                        </td>
                        <td style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                          S/ {calcularTotalGuia()}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroGuiaRemision;