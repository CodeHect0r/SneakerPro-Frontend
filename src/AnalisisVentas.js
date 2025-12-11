import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import './AnalisisVentas.css';

const AnalisisVentas = () => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [metricas, setMetricas] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallePedido, setDetallePedido] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'TODOS',
    buscar: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarMetricas();
    cargarPedidos();
  }, []);

  // Cargar pedidos cuando cambien los filtros
  useEffect(() => {
    cargarPedidos();
  }, [filtros]);

  // ========== FUNCIONES DE CARGA ==========

  const cargarMetricas = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ventas/metricas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMetricas(response.data);
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      alert('Error al cargar métricas');
    }
  };

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      if (filtros.estado !== 'TODOS') params.estado = filtros.estado;
      if (filtros.buscar) params.buscar = filtros.buscar;

      const response = await axios.get(`${API_URL}/api/ventas/historial`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const verDetallePedido = async (pedidoId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/ventas/${pedidoId}/detalle`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDetallePedido(response.data);
      setPedidoSeleccionado(pedidoId);
      setModalDetalle(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar detalle del pedido');
    } finally {
      setLoading(false);
    }
  };

  // ========== ACCIONES ==========

  const descargarBoleta = async (pedidoId) => {
    try {
      const response = await axios.get(`${API_URL}/api/ventas/${pedidoId}/descargar-boleta`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `boleta-pedido-${pedidoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar boleta:', error);
      alert(error.response?.data?.message || 'Error al descargar la boleta');
    }
  };

  const reenviarBoleta = async (pedidoId) => {
    if (!window.confirm('¿Reenviar boleta al correo del cliente?')) return;

    try {
      await axios.post(`${API_URL}/api/ventas/${pedidoId}/reenviar-boleta`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('✅ Boleta reenviada exitosamente');
    } catch (error) {
      console.error('Error al reenviar boleta:', error);
      alert('Error al reenviar la boleta');
    }
  };

  const regenerarBoleta = async (pedidoId) => {
    if (!window.confirm('¿Regenerar la boleta de este pedido?')) return;

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/ventas/${pedidoId}/regenerar-boleta`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('✅ Boleta regenerada exitosamente');
    } catch (error) {
      console.error('Error al regenerar boleta:', error);
      alert('Error al regenerar la boleta');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

    try {
      await axios.put(`${API_URL}/api/ventas/${pedidoId}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      alert('✅ Estado actualizado');
      cargarPedidos();
      if (modalDetalle) verDetallePedido(pedidoId);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado');
    }
  };

  const cancelarPedido = async (pedidoId) => {
    if (!window.confirm('⚠️ ¿Cancelar este pedido? Se devolverá el stock al inventario.')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/ventas/${pedidoId}/cancelar`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('✅ Pedido cancelado y stock devuelto');
      cargarPedidos();
      setModalDetalle(false);
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      alert(error.response?.data?.message || 'Error al cancelar pedido');
    } finally {
      setLoading(false);
    }
  };

  // ========== UTILIDADES ==========

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      'PENDIENTE': { bg: '#fef3c7', color: '#92400e', icon: '⏳' },
      'PROCESANDO': { bg: '#dbeafe', color: '#1e40af', icon: '⚙️' },
      'ENVIADO': { bg: '#e0e7ff', color: '#3730a3', icon: '🚚' },
      'ENTREGADO': { bg: '#d1fae5', color: '#065f46', icon: '✅' },
      'CANCELADO': { bg: '#fee2e2', color: '#991b1b', icon: '❌' }
    };

    const estilo = estilos[estado] || estilos['PENDIENTE'];

    return (
      <span className="estado-badge" style={{ 
        backgroundColor: estilo.bg, 
        color: estilo.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.85em',
        fontWeight: '600'
      }}>
        {estilo.icon} {estado}
      </span>
    );
  };

  // ========== RENDER ==========

  return (
    <div className="analisis-ventas-container">
      <div className="page-header">
        <h1>📊 Análisis de Ventas</h1>
        <p>Gestión completa de pedidos y ventas</p>
      </div>

      {/* Métricas */}
      {metricas && (
        <div className="metricas-grid">
          <div className="metrica-card ventas-hoy">
            <div className="metrica-icon">💰</div>
            <div className="metrica-info">
              <h3>Ventas Hoy</h3>
              <p className="metrica-valor">S/ {parseFloat(metricas.ventasHoy.total).toFixed(2)}</p>
              <span className="metrica-detalle">{metricas.ventasHoy.cantidad} pedidos</span>
            </div>
          </div>

          <div className="metrica-card ventas-mes">
            <div className="metrica-icon">📈</div>
            <div className="metrica-info">
              <h3>Ventas Este Mes</h3>
              <p className="metrica-valor">S/ {parseFloat(metricas.ventasMes.total).toFixed(2)}</p>
              <span className="metrica-detalle">{metricas.ventasMes.cantidad} pedidos</span>
            </div>
          </div>

          <div className="metrica-card pendientes">
            <div className="metrica-icon">⏳</div>
            <div className="metrica-info">
              <h3>Pedidos Pendientes</h3>
              <p className="metrica-valor">{metricas.pedidosPendientes.cantidad}</p>
              <span className="metrica-detalle">Requieren atención</span>
            </div>
          </div>

          <div className="metrica-card top-producto">
            <div className="metrica-icon">🏆</div>
            <div className="metrica-info">
              <h3>Top Producto</h3>
              <p className="metrica-valor-small">
                {metricas.topProductos[0]?.nombre_producto || 'N/A'}
              </p>
              <span className="metrica-detalle">
                {metricas.topProductos[0]?.total_vendido || 0} unidades
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label>Fecha Inicio</label>
            <input 
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})}
            />
          </div>

          <div className="filtro-grupo">
            <label>Fecha Fin</label>
            <input 
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})}
            />
          </div>

          <div className="filtro-grupo">
            <label>Estado</label>
            <select 
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PROCESANDO">Procesando</option>
              <option value="ENVIADO">Enviado</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Buscar</label>
            <input 
              type="text"
              placeholder="N° pedido, cliente..."
              value={filtros.buscar}
              onChange={(e) => setFiltros({...filtros, buscar: e.target.value})}
            />
          </div>
        </div>

        <button 
          className="btn-limpiar-filtros"
          onClick={() => setFiltros({ fecha_inicio: '', fecha_fin: '', estado: 'TODOS', buscar: '' })}
        >
          🔄 Limpiar Filtros
        </button>
      </div>

      {/* Tabla de Pedidos */}
      <div className="tabla-section">
        <h2>📋 Historial de Pedidos ({pedidos.length})</h2>

        {loading ? (
          <div className="loading">Cargando...</div>
        ) : pedidos.length === 0 ? (
          <div className="empty-state">
            <p>📦 No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="tabla-responsive">
            <table>
              <thead>
                <tr>
                  <th>N° Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="numero-pedido">{pedido.numero_pedido}</td>
                    <td>{formatearFecha(pedido.creado_en)}</td>
                    <td>
                      <div className="cliente-info">
                        <strong>{pedido.cliente_nombre}</strong>
                        <small>{pedido.cliente_email}</small>
                      </div>
                    </td>
                    <td className="text-center">{pedido.total_productos}</td>
                    <td className="total">S/ {parseFloat(pedido.total).toFixed(2)}</td>
                    <td>{getEstadoBadge(pedido.estado)}</td>
                    <td>
                      <div className="acciones-btns">
                        <button 
                          className="btn-accion ver"
                          onClick={() => verDetallePedido(pedido.id)}
                          title="Ver detalle"
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-accion descargar"
                          onClick={() => descargarBoleta(pedido.id)}
                          title="Descargar boleta"
                        >
                          📄
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {modalDetalle && detallePedido && (
        <div className="modal-overlay" onClick={() => setModalDetalle(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle del Pedido {detallePedido.pedido.numero_pedido}</h2>
              <button className="btn-cerrar" onClick={() => setModalDetalle(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Info del Cliente */}
              <div className="detalle-section">
                <h3>👤 Cliente</h3>
                <div className="info-grid">
                  <div><strong>Nombre:</strong> {detallePedido.pedido.cliente_nombre}</div>
                  <div><strong>Email:</strong> {detallePedido.pedido.cliente_email}</div>
                  <div><strong>Teléfono:</strong> {detallePedido.pedido.telefono_cliente || 'N/A'}</div>
                  <div><strong>Dirección:</strong> {detallePedido.pedido.direccion_envio || 'N/A'}</div>
                </div>
              </div>

              {/* Productos */}
              <div className="detalle-section">
                <h3>📦 Productos</h3>
                <table className="tabla-productos-detalle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Talla</th>
                      <th>Cant.</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallePedido.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre_producto} - {item.marca}</td>
                        <td>{item.talla}</td>
                        <td>{item.cantidad}</td>
                        <td>S/ {parseFloat(item.precio_unitario).toFixed(2)}</td>
                        <td>S/ {parseFloat(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
<div className="detalle-section totales">
  <div className="total-row">
    <span>Subtotal:</span>
    <span>S/ {parseFloat(detallePedido.pedido.subtotal).toFixed(2)}</span>
  </div>
  {detallePedido.pedido.descuento > 0 && (
    <div className="total-row">
      <span>Descuento:</span>
      <span className="descuento">-S/ {parseFloat(detallePedido.pedido.descuento).toFixed(2)}</span>
    </div>
  )}
  {detallePedido.pedido.envio > 0 && (
    <div className="total-row">
      <span>Envío:</span>
      <span>S/ {parseFloat(detallePedido.pedido.envio).toFixed(2)}</span>
    </div>
  )}
  
  <hr />
  
  {/* 👇 AGREGAR IGV */}
  <div className="total-row" style={{fontSize: '0.9em', color: '#666'}}>
    <span>Base Imponible:</span>
    <span>S/ {(parseFloat(detallePedido.pedido.subtotal) - parseFloat(detallePedido.pedido.descuento || 0) + parseFloat(detallePedido.pedido.envio || 0)).toFixed(2)}</span>
  </div>
  <div className="total-row" style={{fontSize: '0.9em', color: '#666'}}>
    <span>IGV (18%):</span>
    <span>S/ {parseFloat(detallePedido.pedido.igv || 0).toFixed(2)}</span>
  </div>
  
  <hr />
  
  <div className="total-row total-final">
    <span>TOTAL:</span>
    <span>S/ {parseFloat(detallePedido.pedido.total).toFixed(2)}</span>
  </div>
</div>

              {/* Acciones */}
              <div className="detalle-acciones">
                <button 
                  className="btn-accion-modal descargar"
                  onClick={() => descargarBoleta(detallePedido.pedido.id)}
                >
                  📄 Descargar Boleta
                </button>

                <button 
                  className="btn-accion-modal reenviar"
                  onClick={() => reenviarBoleta(detallePedido.pedido.id)}
                >
                  📧 Reenviar Boleta
                </button>

                <button 
                  className="btn-accion-modal regenerar"
                  onClick={() => regenerarBoleta(detallePedido.pedido.id)}
                >
                  🔄 Regenerar Boleta
                </button>

                {/* Cambiar Estado */}
                {detallePedido.pedido.estado !== 'CANCELADO' && detallePedido.pedido.estado !== 'ENTREGADO' && (
                  <div className="cambiar-estado">
                    <label>Cambiar Estado:</label>
                    <select onChange={(e) => cambiarEstado(detallePedido.pedido.id, e.target.value)} defaultValue="">
                      <option value="" disabled>Seleccionar...</option>
                      <option value="PROCESANDO">Procesando</option>
                      <option value="ENVIADO">Enviado</option>
                      <option value="ENTREGADO">Entregado</option>
                    </select>
                  </div>
                )}

                {/* Cancelar Pedido */}
                {detallePedido.pedido.estado !== 'CANCELADO' && detallePedido.pedido.estado !== 'ENTREGADO' && (
                  <button 
                    className="btn-accion-modal cancelar"
                    onClick={() => cancelarPedido(detallePedido.pedido.id)}
                  >
                    ❌ Cancelar Pedido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalisisVentas;