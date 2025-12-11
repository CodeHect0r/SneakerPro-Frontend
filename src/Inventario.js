import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config/api';
import Swal from 'sweetalert2';
import './Inventario.css';

const Inventario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [inventario, setInventario] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [sinStock, setSinStock] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [filtros, setFiltros] = useState({
    marca: '',
    stock_bajo: false
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [invRes, alertasRes, sinStockRes, statsRes, marcasRes] = await Promise.all([
        axios.get(`${API_URL}/api/inventario`, config),
        axios.get(`${API_URL}/api/inventario/alertas`, config),
        axios.get(`${API_URL}/api/inventario/sin-stock`, config),
        axios.get(`${API_URL}/api/inventario/estadisticas`, config),
        axios.get(`${API_URL}/api/inventario/marcas`, config)
      ]);

      setInventario(invRes.data);
      setAlertas(alertasRes.data);
      setSinStock(sinStockRes.data);
      setEstadisticas(statsRes.data);
      setMarcas(marcasRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el inventario',
        confirmButtonColor: '#6366f1'
      });
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filtros.marca) params.append('marca', filtros.marca);
      if (filtros.stock_bajo) params.append('stock_bajo', 'true');

      const res = await axios.get(`${API_URL}/api/inventario?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setInventario(res.data);
    } catch (error) {
      console.error('Error al filtrar:', error);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ marca: '', stock_bajo: false });
    cargarDatos();
  };

  const getNivelStockClass = (nivel) => {
    const classes = {
      'SIN_STOCK': 'badge-sin-stock',
      'STOCK_BAJO': 'badge-stock-bajo',
      'STOCK_MEDIO': 'badge-stock-medio',
      'STOCK_BUENO': 'badge-stock-bueno'
    };
    return classes[nivel] || '';
  };

  const getNivelStockLabel = (nivel) => {
    const labels = {
      'SIN_STOCK': '🚫 Sin Stock',
      'STOCK_BAJO': '⚠️ Stock Bajo',
      'STOCK_MEDIO': '📊 Stock Medio',
      'STOCK_BUENO': '✅ Stock Bueno'
    };
    return labels[nivel] || nivel;
  };

  if (loading) {
    return (
      <div className="loading-inventario">
        <div className="spinner-inventario"></div>
        <p>Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="inventario-wrapper">
      <div className="container-inventario">
        {/* Header */}
        <div className="inventario-header">
          <button className="btn-volver" onClick={() => navigate('/admin-panel')}>
            ← Volver
          </button>
          <div className="header-title">
            <h1>📊 Control de Inventario</h1>
            <p>Monitoreo de stock y alertas en tiempo real</p>
          </div>
        </div>

        {/* Estadísticas Cards */}
{estadisticas && (
  <div className="stats-container">
    <div className="stat-card card-primary">
      <div className="stat-content">
        <div className="stat-icon-wrapper">
          <span className="stat-icon">📦</span>
        </div>
        <div className="stat-details">
          <h3>{estadisticas.totalProductos?.total || 0}</h3>
          <p>Productos Totales</p>
        </div>
      </div>
    </div>

    <div className="stat-card card-info">
      <div className="stat-content">
        <div className="stat-icon-wrapper">
          <span className="stat-icon">👟</span>
        </div>
        <div className="stat-details">
          <h3>{estadisticas.totalVariantes?.total || 0}</h3>
          <p>Variantes (Tallas)</p>
        </div>
      </div>
    </div>

    <div className="stat-card card-success">
      <div className="stat-content">
        <div className="stat-icon-wrapper">
          <span className="stat-icon">📈</span>
        </div>
        <div className="stat-details">
          <h3>{estadisticas.stockTotal?.total || 0}</h3>
          <p>Unidades en Stock</p>
        </div>
      </div>
    </div>

    <div className="stat-card card-warning">
      <div className="stat-content">
        <div className="stat-icon-wrapper">
          <span className="stat-icon">⚠️</span>
        </div>
        <div className="stat-details">
          <h3>{estadisticas.stockBajo?.total || 0}</h3>
          <p>Alertas Stock Bajo</p>
        </div>
      </div>
    </div>

    <div className="stat-card card-danger">
      <div className="stat-content">
        <div className="stat-icon-wrapper">
          <span className="stat-icon">🚫</span>
        </div>
        <div className="stat-details">
          <h3>{estadisticas.sinStock?.total || 0}</h3>
          <p>Productos Agotados</p>
        </div>
      </div>
    </div>
  </div>
)}
        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span className="tab-icon">📋</span>
            Inventario General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'alertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertas')}
          >
            <span className="tab-icon">⚠️</span>
            Alertas <span className="tab-badge">{alertas.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sin-stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('sin-stock')}
          >
            <span className="tab-icon">🚫</span>
            Sin Stock <span className="tab-badge">{sinStock.length}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'general' && (
            <>
              {/* Filtros */}
              <div className="filtros-panel">
                <div className="filtros-row">
                  <div className="filtro-item">
                    <label>🏷️ Filtrar por Marca:</label>
                    <select 
                      value={filtros.marca}
                      onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
                      className="filtro-select"
                    >
                      <option value="">Todas las marcas</option>
                      {marcas.map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filtro-item checkbox-item">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox"
                        checked={filtros.stock_bajo}
                        onChange={(e) => setFiltros({...filtros, stock_bajo: e.target.checked})}
                      />
                      <span className="checkbox-label">⚠️ Solo stock bajo (menos de 5)</span>
                    </label>
                  </div>

                  <div className="filtro-actions">
                    <button className="btn-primary" onClick={aplicarFiltros}>
                      🔍 Aplicar Filtros
                    </button>
                    <button className="btn-secondary" onClick={limpiarFiltros}>
                      ↻ Limpiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="table-container">
                <table className="inventario-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Marca</th>
                      <th>Talla</th>
                      <th>Existencias</th>
                      <th>Precio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-state">
                          <div className="empty-content">
                            <span className="empty-icon">📦</span>
                            <p>No se encontraron productos</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      inventario.map((item) => (
                        <tr key={item.variante_id}>
                          <td>
                            <img 
                              src={item.imagen_principal_url || 'https://via.placeholder.com/60'} 
                              alt={item.producto_nombre}
                              className="table-img"
                            />
                          </td>
                          <td className="producto-cell">{item.producto_nombre}</td>
                          <td>
                            <span className="badge-marca">{item.marca}</span>
                          </td>
                          <td>
                            <span className="badge-talla">{item.talla}</span>
                          </td>
                          <td className="stock-cell">
                            <strong>{item.stock}</strong> unidades
                          </td>
                          <td className="precio-cell">
                            S/ {parseFloat(item.precio_base).toFixed(2)}
                          </td>
                          <td>
                            <span className={`badge-estado ${getNivelStockClass(item.nivel_stock)}`}>
                              {getNivelStockLabel(item.nivel_stock)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'alertas' && (
            <div className="alertas-container">
              {alertas.length === 0 ? (
                <div className="empty-state-full">
                  <span className="empty-icon-big">✅</span>
                  <h3>¡Todo bajo control!</h3>
                  <p>No hay alertas de stock bajo en este momento</p>
                </div>
              ) : (
                <div className="alertas-grid">
                  {alertas.map((item) => (
                    <div key={item.variante_id} className="alert-card">
                      <div className="alert-img-container">
                        <img 
                          src={item.imagen_principal_url || 'https://via.placeholder.com/120'} 
                          alt={item.producto_nombre}
                        />
                        <div className="alert-badge">⚠️</div>
                      </div>
                      <div className="alert-content">
                        <h4>{item.producto_nombre}</h4>
                        <div className="alert-details">
                          <span className="alert-detail-item">
                            <strong>Marca:</strong> {item.marca}
                          </span>
                          <span className="alert-detail-item">
                            <strong>Talla:</strong> {item.talla}
                          </span>
                        </div>
                        <div className="alert-stock-warning">
                          ⚠️ Solo quedan <strong>{item.stock}</strong> unidades
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sin-stock' && (
            <div className="sin-stock-container">
              {sinStock.length === 0 ? (
                <div className="empty-state-full">
                  <span className="empty-icon-big">✅</span>
                  <h3>¡Excelente!</h3>
                  <p>No hay productos agotados</p>
                </div>
              ) : (
                <div className="sin-stock-grid">
                  {sinStock.map((item) => (
                    <div key={item.variante_id} className="agotado-card">
                      <div className="agotado-img-container">
                        <img 
                          src={item.imagen_principal_url || 'https://via.placeholder.com/120'} 
                          alt={item.producto_nombre}
                        />
                        <div className="agotado-badge">🚫</div>
                      </div>
                      <div className="agotado-content">
                        <h4>{item.producto_nombre}</h4>
                        <div className="agotado-details">
                          <span className="agotado-detail-item">
                            <strong>Marca:</strong> {item.marca}
                          </span>
                          <span className="agotado-detail-item">
                            <strong>Talla:</strong> {item.talla}
                          </span>
                        </div>
                        <div className="agotado-status">
                          🚫 PRODUCTO AGOTADO
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventario;