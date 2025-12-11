import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ReportesGenerales.css';

const ReportesGenerales = () => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [graficoDatos, setGraficoDatos] = useState([]);
  const [rentabilidad, setRentabilidad] = useState([]);
  const [comparativa, setComparativa] = useState(null);
  const [vistaActual, setVistaActual] = useState('dashboard'); 

  // Filtros para dashboard y rentabilidad
  const [filtrosDashboard, setFiltrosDashboard] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  });

  const [filtrosRentabilidad, setFiltrosRentabilidad] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    ordenar: 'ganancia_total',
    limite: 50
  });

  // Filtros para comparativa
  const [filtrosComparativa, setFiltrosComparativa] = useState({
    periodo1_inicio: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    periodo1_fin: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0],
    periodo2_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    periodo2_fin: new Date().toISOString().split('T')[0]
  });

  // ========== CARGAR DATOS ==========

  const cargarDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reportes/dashboard`, {
        params: filtrosDashboard,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDashboard(response.data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      alert('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [filtrosDashboard]);

  const cargarGrafico = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reportes/compras-vs-ventas`, {
        params: { meses: 12 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGraficoDatos(response.data);
    } catch (error) {
      console.error('Error al cargar gráfico:', error);
      alert('Error al cargar datos del gráfico');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarRentabilidad = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reportes/rentabilidad-productos`, {
        params: filtrosRentabilidad,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRentabilidad(response.data);
    } catch (error) {
      console.error('Error al cargar rentabilidad:', error);
      alert('Error al cargar rentabilidad de productos');
    } finally {
      setLoading(false);
    }
  }, [filtrosRentabilidad]);

  const cargarComparativa = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reportes/comparativa-periodos`, {
        params: filtrosComparativa,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComparativa(response.data);
    } catch (error) {
      console.error('Error al cargar comparativa:', error);
      alert('Error al cargar comparativa de períodos');
    } finally {
      setLoading(false);
    }
  }, [filtrosComparativa]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDashboard();
    cargarGrafico();
  }, [cargarDashboard, cargarGrafico]);

  useEffect(() => {
    if (vistaActual === 'rentabilidad') {
      cargarRentabilidad();
    }
  }, [vistaActual, cargarRentabilidad]);

  useEffect(() => {
    if (vistaActual === 'comparativa') {
      cargarComparativa();
    }
  }, [vistaActual, cargarComparativa]);

  // ========== UTILIDADES ==========

  const formatearMoneda = (valor) => {
    return `S/ ${parseFloat(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatearPorcentaje = (valor) => {
    const num = parseFloat(valor);
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getColorCambio = (valor) => {
    return parseFloat(valor) >= 0 ? '#059669' : '#ef4444';
  };

  const formatearMes = (mes) => {
    const [año, mesNum] = mes.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[parseInt(mesNum) - 1]} ${año}`;
  };

  // ========== RENDERIZADO ==========

  return (
    <div className="reportes-container">
      {/* Header */}
      <div className="page-header">
        <h1>📊 Reportes Generales</h1>
        <p>Análisis completo de compras, ventas y rentabilidad</p>
      </div>

      {/* Navegación de Tabs */}
      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${vistaActual === 'dashboard' ? 'active' : ''}`}
          onClick={() => setVistaActual('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${vistaActual === 'grafico' ? 'active' : ''}`}
          onClick={() => setVistaActual('grafico')}
        >
          📈 Compras vs Ventas
        </button>
        <button 
          className={`tab-btn ${vistaActual === 'rentabilidad' ? 'active' : ''}`}
          onClick={() => setVistaActual('rentabilidad')}
        >
          💰 Rentabilidad
        </button>
        <button 
          className={`tab-btn ${vistaActual === 'comparativa' ? 'active' : ''}`}
          onClick={() => setVistaActual('comparativa')}
        >
          🔄 Comparativa
        </button>
      </div>

      {loading && <div className="loading-overlay">Cargando...</div>}

      {/* ========== VISTA: DASHBOARD ========== */}
      {vistaActual === 'dashboard' && dashboard && (
        <div className="vista-dashboard">
          {/* Filtros de Período */}
          <div className="filtros-section">
            <div className="filtros-grid">
              <div className="filtro-grupo">
                <label>Fecha Inicio</label>
                <input 
                  type="date"
                  value={filtrosDashboard.fecha_inicio}
                  onChange={(e) => setFiltrosDashboard({...filtrosDashboard, fecha_inicio: e.target.value})}
                />
              </div>
              <div className="filtro-grupo">
                <label>Fecha Fin</label>
                <input 
                  type="date"
                  value={filtrosDashboard.fecha_fin}
                  onChange={(e) => setFiltrosDashboard({...filtrosDashboard, fecha_fin: e.target.value})}
                />
              </div>
              <div className="filtro-grupo">
                <button className="btn-aplicar" onClick={cargarDashboard}>
                  🔍 Aplicar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Métricas Principales */}
          <div className="metricas-grid">
            <div className="metrica-card compras">
              <div className="metrica-icon">📦</div>
              <div className="metrica-info">
                <h3>Compras del Período</h3>
                <p className="metrica-valor">{formatearMoneda(dashboard.compras.total)}</p>
                <span className="metrica-detalle">
                  {dashboard.compras.unidades} unidades • {dashboard.compras.num_guias} guías
                </span>
              </div>
            </div>

            <div className="metrica-card ventas">
              <div className="metrica-icon">💵</div>
              <div className="metrica-info">
                <h3>Ventas del Período</h3>
                <p className="metrica-valor">{formatearMoneda(dashboard.ventas.total)}</p>
                <span className="metrica-detalle">
                  {dashboard.ventas.unidades} unidades • {dashboard.ventas.num_pedidos} pedidos
                </span>
              </div>
            </div>

            <div className="metrica-card ganancia">
              <div className="metrica-icon">✅</div>
              <div className="metrica-info">
                <h3>Ganancia Bruta</h3>
                <p className="metrica-valor">{formatearMoneda(dashboard.rentabilidad.ganancia_bruta)}</p>
                <span className="metrica-detalle">
                  Margen: {dashboard.rentabilidad.margen_porcentaje.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="metrica-card roi">
              <div className="metrica-icon">🚀</div>
              <div className="metrica-info">
                <h3>ROI</h3>
                <p className="metrica-valor">{dashboard.rentabilidad.roi.toFixed(1)}%</p>
                <span className="metrica-detalle">
                  Retorno de Inversión
                </span>
              </div>
            </div>

            <div className="metrica-card inventario">
              <div className="metrica-icon">📊</div>
              <div className="metrica-info">
                <h3>Inventario Actual</h3>
                <p className="metrica-valor">{formatearMoneda(dashboard.inventario.valor_actual)}</p>
                <span className="metrica-detalle">
                  {dashboard.inventario.unidades} unidades en stock
                </span>
              </div>
            </div>

            <div className="metrica-card comparativa">
              <div className="metrica-icon">📈</div>
              <div className="metrica-info">
                <h3>vs Período Anterior</h3>
                <p 
                  className="metrica-valor" 
                  style={{ color: getColorCambio(dashboard.comparativa.cambio_ventas_porcentaje) }}
                >
                  {formatearPorcentaje(dashboard.comparativa.cambio_ventas_porcentaje)}
                </p>
                <span className="metrica-detalle">
                  Cambio en ventas
                </span>
              </div>
            </div>
          </div>

          {/* Top 5 Productos */}
          <div className="top-productos-section">
            <h2>🏆 Top 5 Productos Más Vendidos</h2>
            <div className="tabla-responsive">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Unidades Vendidas</th>
                    <th>Ingresos Totales</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.topProductos.map((prod, index) => (
                    <tr key={index}>
                      <td className="rank">{index + 1}</td>
                      <td>{prod.nombre_producto}</td>
                      <td>{prod.marca}</td>
                      <td className="text-center">{prod.total_vendido}</td>
                      <td className="precio">{formatearMoneda(prod.ingresos_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========== VISTA: GRÁFICO COMPRAS VS VENTAS ========== */}
      {vistaActual === 'grafico' && (
        <div className="vista-grafico">
          <h2>📈 Evolución de Compras vs Ventas (Últimos 12 Meses)</h2>
          
          {graficoDatos.length > 0 ? (
            <>
              {/* Gráfico de Líneas */}
              <div className="grafico-container">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={graficoDatos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      tickFormatter={formatearMes}
                    />
                    <YAxis 
                      tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => formatearMoneda(value)}
                      labelFormatter={formatearMes}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="compras" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Compras"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="#059669" 
                      strokeWidth={2}
                      name="Ventas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ganancia" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Ganancia"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Barras */}
              <div className="grafico-container">
                <h3>Unidades Compradas vs Vendidas</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={graficoDatos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      tickFormatter={formatearMes}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatearMes}
                    />
                    <Legend />
                    <Bar dataKey="unidades_compradas" fill="#ef4444" name="Compradas" />
                    <Bar dataKey="unidades_vendidas" fill="#059669" name="Vendidas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>📊 No hay datos disponibles para mostrar el gráfico</p>
            </div>
          )}
        </div>
      )}

      {/* ========== VISTA: RENTABILIDAD POR PRODUCTO ========== */}
      {vistaActual === 'rentabilidad' && (
        <div className="vista-rentabilidad">
          <h2>💰 Rentabilidad por Producto</h2>

          {/* Filtros */}
          <div className="filtros-section">
            <div className="filtros-grid">
              <div className="filtro-grupo">
                <label>Fecha Inicio</label>
                <input 
                  type="date"
                  value={filtrosRentabilidad.fecha_inicio}
                  onChange={(e) => setFiltrosRentabilidad({...filtrosRentabilidad, fecha_inicio: e.target.value})}
                />
              </div>
              <div className="filtro-grupo">
                <label>Fecha Fin</label>
                <input 
                  type="date"
                  value={filtrosRentabilidad.fecha_fin}
                  onChange={(e) => setFiltrosRentabilidad({...filtrosRentabilidad, fecha_fin: e.target.value})}
                />
              </div>
              <div className="filtro-grupo">
                <label>Ordenar Por</label>
                <select 
                  value={filtrosRentabilidad.ordenar}
                  onChange={(e) => setFiltrosRentabilidad({...filtrosRentabilidad, ordenar: e.target.value})}
                >
                  <option value="ganancia_total">Mayor Ganancia Total</option>
                  <option value="margen">Mejor Margen %</option>
                  <option value="ventas">Más Vendidos</option>
                </select>
              </div>
              <div className="filtro-grupo">
                <button className="btn-aplicar" onClick={cargarRentabilidad}>
                  🔍 Aplicar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Rentabilidad */}
          {rentabilidad.length > 0 ? (
            <div className="tabla-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th className="text-center">Vendidos</th>
                    <th className="text-right">Costo Prom.</th>
                    <th className="text-right">Precio Prom.</th>
                    <th className="text-right">Ganancia/U</th>
                    <th className="text-right">Margen %</th>
                    <th className="text-right">Ganancia Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rentabilidad.map((prod, index) => (
                    <tr key={index}>
                      <td>{prod.nombre_producto}</td>
                      <td>{prod.marca}</td>
                      <td className="text-center">{prod.unidades_vendidas}</td>
                      <td className="text-right">{formatearMoneda(prod.costo_promedio)}</td>
                      <td className="text-right">{formatearMoneda(prod.precio_venta_promedio)}</td>
                      <td className="text-right ganancia">{formatearMoneda(prod.ganancia_por_unidad)}</td>
                      <td className="text-right">
                        <span className={`badge-margen ${prod.margen_porcentaje >= 40 ? 'alto' : prod.margen_porcentaje >= 25 ? 'medio' : 'bajo'}`}>
                          {prod.margen_porcentaje.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right ganancia-total">{formatearMoneda(prod.ganancia_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>📦 No hay datos de rentabilidad disponibles</p>
            </div>
          )}
        </div>
      )}

      {/* ========== VISTA: COMPARATIVA DE PERÍODOS ========== */}
      {vistaActual === 'comparativa' && (
        <div className="vista-comparativa">
          <h2>🔄 Comparativa de Períodos</h2>

          {/* Filtros */}
          <div className="filtros-section">
            <div className="periodos-grid">
              <div className="periodo-grupo">
                <h3>📅 Período 1</h3>
                <div className="filtros-grid">
                  <div className="filtro-grupo">
                    <label>Inicio</label>
                    <input 
                      type="date"
                      value={filtrosComparativa.periodo1_inicio}
                      onChange={(e) => setFiltrosComparativa({...filtrosComparativa, periodo1_inicio: e.target.value})}
                    />
                  </div>
                  <div className="filtro-grupo">
                    <label>Fin</label>
                    <input 
                      type="date"
                      value={filtrosComparativa.periodo1_fin}
                      onChange={(e) => setFiltrosComparativa({...filtrosComparativa, periodo1_fin: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="periodo-grupo">
                <h3>📅 Período 2</h3>
                <div className="filtros-grid">
                  <div className="filtro-grupo">
                    <label>Inicio</label>
                    <input 
                      type="date"
                      value={filtrosComparativa.periodo2_inicio}
                      onChange={(e) => setFiltrosComparativa({...filtrosComparativa, periodo2_inicio: e.target.value})}
                    />
                  </div>
                  <div className="filtro-grupo">
                    <label>Fin</label>
                    <input 
                      type="date"
                      value={filtrosComparativa.periodo2_fin}
                      onChange={(e) => setFiltrosComparativa({...filtrosComparativa, periodo2_fin: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-aplicar" onClick={cargarComparativa}>
              🔍 Comparar Períodos
            </button>
          </div>

          {/* Resultados de Comparativa */}
          {comparativa && (
            <div className="comparativa-resultados">
              <div className="comparativa-grid">
                {/* Período 1 */}
                <div className="periodo-card">
                  <h3>📅 Período 1</h3>
                  <p className="periodo-fechas">
                    {new Date(comparativa.periodo1.fechas.inicio).toLocaleDateString('es-PE')} - {new Date(comparativa.periodo1.fechas.fin).toLocaleDateString('es-PE')}
                  </p>
                  <div className="periodo-stats">
                    <div className="stat-row">
                      <span>Compras:</span>
                      <span>{formatearMoneda(comparativa.periodo1.compras)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Ventas:</span>
                      <span>{formatearMoneda(comparativa.periodo1.ventas)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Ganancia:</span>
                      <span className="ganancia">{formatearMoneda(comparativa.periodo1.ganancia)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Pedidos:</span>
                      <span>{comparativa.periodo1.num_pedidos}</span>
                    </div>
                    <div className="stat-row">
                      <span>Margen:</span>
                      <span>{comparativa.periodo1.margen.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Flechas de Cambio */}
                <div className="cambios-card">
                  <h3>📊 Cambios</h3>
                  <div className="cambios-stats">
                    <div className="cambio-row">
                      <span>Compras:</span>
                      <span style={{ color: getColorCambio(comparativa.cambios.compras_porcentaje) }}>
                        {formatearPorcentaje(comparativa.cambios.compras_porcentaje)}
                      </span>
                    </div>
                    <div className="cambio-row">
                      <span>Ventas:</span>
                      <span style={{ color: getColorCambio(comparativa.cambios.ventas_porcentaje) }}>
                        {formatearPorcentaje(comparativa.cambios.ventas_porcentaje)}
                      </span>
                    </div>
                    <div className="cambio-row">
                      <span>Ganancia:</span>
                      <span style={{ color: getColorCambio(comparativa.cambios.ganancia_porcentaje) }}>
                        {formatearPorcentaje(comparativa.cambios.ganancia_porcentaje)}
                      </span>
                    </div>
                    <div className="cambio-row">
                      <span>Pedidos:</span>
                      <span style={{ color: getColorCambio(comparativa.cambios.pedidos_porcentaje) }}>
                        {formatearPorcentaje(comparativa.cambios.pedidos_porcentaje)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Período 2 */}
                <div className="periodo-card">
                  <h3>📅 Período 2</h3>
                  <p className="periodo-fechas">
                    {new Date(comparativa.periodo2.fechas.inicio).toLocaleDateString('es-PE')} - {new Date(comparativa.periodo2.fechas.fin).toLocaleDateString('es-PE')}
                  </p>
                  <div className="periodo-stats">
                    <div className="stat-row">
                      <span>Compras:</span>
                      <span>{formatearMoneda(comparativa.periodo2.compras)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Ventas:</span>
                      <span>{formatearMoneda(comparativa.periodo2.ventas)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Ganancia:</span>
                      <span className="ganancia">{formatearMoneda(comparativa.periodo2.ganancia)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Pedidos:</span>
                      <span>{comparativa.periodo2.num_pedidos}</span>
                    </div>
                    <div className="stat-row">
                      <span>Margen:</span>
                      <span>{comparativa.periodo2.margen.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportesGenerales;