import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import Swal from 'sweetalert2';
import './GestionUsuarios.css';

const GestionUsuarios = () => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  
  // Modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalCambiarRol, setModalCambiarRol] = useState(false);
  const [modalTopClientes, setModalTopClientes] = useState(false);
  
  // Datos seleccionados
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [detalleUsuario, setDetalleUsuario] = useState(null);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    buscar: '',
    fecha_inicio: '',
    fecha_fin: '',
    rol: 'TODOS'
  });

  // Formulario de edición
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    email: '',
    nombres: '',
    apellidos: '',
    genero: '',
    fecha_nacimiento: '',
    telefono: '',
    telefono_secundario: '',
    direccion: '',
    departamento: '',
    provincia: '',
    distrito: '',
    codigo_postal: '',
    referencia: ''
  });

  // ========== CARGAR DATOS ==========

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin-usuarios/estadisticas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.buscar) params.buscar = filtros.buscar;
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      if (filtros.rol !== 'TODOS') params.rol = filtros.rol;

      const response = await axios.get(`${API_URL}/api/admin-usuarios/listar`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire('Error', 'Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const cargarTopClientes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin-usuarios/top-clientes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTopClientes(response.data);
      setModalTopClientes(true);
    } catch (error) {
      console.error('Error al cargar top clientes:', error);
      Swal.fire('Error', 'Error al cargar top clientes', 'error');
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarEstadisticas();
    cargarUsuarios();
  }, [cargarEstadisticas, cargarUsuarios]);

  // ========== VER DETALLE ==========

  const verDetalleUsuario = async (usuarioId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin-usuarios/${usuarioId}/detalle`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDetalleUsuario(response.data);
      setUsuarioSeleccionado(usuarioId);
      setModalDetalle(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      Swal.fire('Error', 'Error al cargar detalle del usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== EDITAR USUARIO ==========

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario.id);
    setFormEditar({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      genero: usuario.genero || '',
      fecha_nacimiento: usuario.fecha_nacimiento || '',
      telefono: usuario.telefono || '',
      telefono_secundario: usuario.telefono_secundario || '',
      direccion: usuario.direccion || '',
      departamento: usuario.departamento || '',
      provincia: usuario.provincia || '',
      distrito: usuario.distrito || '',
      codigo_postal: usuario.codigo_postal || '',
      referencia: usuario.referencia || ''
    });
    setModalEditar(true);
  };

  const guardarEdicion = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/admin-usuarios/${usuarioSeleccionado}/editar`,
        formEditar,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      Swal.fire('¡Éxito!', 'Usuario actualizado correctamente', 'success');
      setModalEditar(false);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al editar usuario:', error);
      Swal.fire('Error', error.response?.data?.message || 'Error al editar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== CAMBIAR ROL ==========

  const abrirModalCambiarRol = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalCambiarRol(true);
  };

  const cambiarRol = async (nuevoRol) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Cambiar el rol de <strong>${usuarioSeleccionado.nombre}</strong> a <strong>${nuevoRol}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.put(
          `${API_URL}/api/admin-usuarios/${usuarioSeleccionado.id}/cambiar-rol`,
          { nuevo_rol: nuevoRol },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        Swal.fire('¡Éxito!', `Rol cambiado a ${nuevoRol}`, 'success');
        setModalCambiarRol(false);
        cargarUsuarios();
      } catch (error) {
        console.error('Error al cambiar rol:', error);
        Swal.fire('Error', error.response?.data?.message || 'Error al cambiar rol', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // ========== UTILIDADES ==========

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMoneda = (valor) => {
    return `S/ ${parseFloat(valor).toFixed(2)}`;
  };

  const getRolBadge = (rol) => {
    const estilos = {
      'ADMIN': { bg: '#6366f1', icon: '👨‍💼' },
      'CLIENTE': { bg: '#10b981', icon: '🛍️' }
    };
    const estilo = estilos[rol] || estilos['CLIENTE'];
    return (
      <span style={{
        backgroundColor: estilo.bg,
        color: 'white',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.85em',
        fontWeight: '600'
      }}>
        {estilo.icon} {rol}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const estilos = {
      'verified': { bg: '#10b981', text: '✅ Verificado', color: 'white' },
      'pending': { bg: '#f59e0b', text: '⏳ Pendiente', color: 'white' }
    };
    const estilo = estilos[status] || estilos['pending'];
    return (
      <span style={{
        backgroundColor: estilo.bg,
        color: estilo.color,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.85em',
        fontWeight: '600'
      }}>
        {estilo.text}
      </span>
    );
  };

  // ========== RENDER ==========

  return (
    <div className="gestion-usuarios-container">
      {/* Header */}
      <div className="page-header">
        <h1>👥 Gestión de Usuarios</h1>
        <p>Administrar usuarios y permisos del sistema</p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Usuarios</h3>
              <p className="stat-valor">{estadisticas.total}</p>
            </div>
          </div>

          <div className="stat-card nuevos">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Nuevos Este Mes</h3>
              <p className="stat-valor">{estadisticas.nuevos_mes}</p>
            </div>
          </div>

          <div className="stat-card admins">
            <div className="stat-icon">👨‍💼</div>
            <div className="stat-info">
              <h3>Administradores</h3>
              <p className="stat-valor">
                {estadisticas.por_rol.find(r => r.rol === 'ADMIN')?.cantidad || 0}
              </p>
            </div>
          </div>

          <div className="stat-card clientes">
            <div className="stat-icon">🛍️</div>
            <div className="stat-info">
              <h3>Clientes</h3>
              <p className="stat-valor">
                {estadisticas.por_rol.find(r => r.rol === 'CLIENTE')?.cantidad || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón Top Clientes */}
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button className="btn-top-clientes" onClick={cargarTopClientes}>
          🏆 Ver Top Clientes
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label>🔍 Buscar</label>
            <input
              type="text"
              placeholder="Nombre o email..."
              value={filtros.buscar}
              onChange={(e) => setFiltros({...filtros, buscar: e.target.value})}
            />
          </div>

          <div className="filtro-grupo">
            <label>📅 Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})}
            />
          </div>

          <div className="filtro-grupo">
            <label>📅 Fecha Fin</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})}
            />
          </div>

          <div className="filtro-grupo">
            <label>🎭 Rol</label>
            <select
              value={filtros.rol}
              onChange={(e) => setFiltros({...filtros, rol: e.target.value})}
            >
              <option value="TODOS">Todos</option>
              <option value="ADMIN">Administradores</option>
              <option value="CLIENTE">Clientes</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <button className="btn-filtrar" onClick={cargarUsuarios}>
              🔍 Buscar
            </button>
            <button 
              className="btn-limpiar" 
              onClick={() => setFiltros({ buscar: '', fecha_inicio: '', fecha_fin: '', rol: 'TODOS' })}
            >
              🔄 Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {loading && <div className="loading-overlay">Cargando...</div>}

      <div className="usuarios-section">
        <h2>📋 Lista de Usuarios ({usuarios.length})</h2>
        
        <div className="tabla-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.nombre?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <strong>{usuario.nombre_completo || usuario.nombre}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{usuario.email}</td>
                  <td>{usuario.telefono || 'N/A'}</td>
                  <td>{getRolBadge(usuario.rol)}</td>
                  <td>{getStatusBadge(usuario.status)}</td>
                  <td>{formatearFecha(usuario.creado_en)}</td>
                  <td className="acciones-cell">
                    <button
                      className="btn-accion ver"
                      onClick={() => verDetalleUsuario(usuario.id)}
                      title="Ver detalle"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-accion editar"
                      onClick={() => abrirModalEditar(usuario)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-accion rol"
                      onClick={() => abrirModalCambiarRol(usuario)}
                      title="Cambiar rol"
                    >
                      🔄
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usuarios.length === 0 && (
            <div className="empty-state">
              <p>📭 No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: DETALLE DE USUARIO */}
      {modalDetalle && detalleUsuario && (
        <div className="modal-overlay" onClick={() => setModalDetalle(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Detalle de Usuario</h2>
              <button className="btn-cerrar" onClick={() => setModalDetalle(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Info Personal */}
              <div className="detalle-section">
                <h3>📋 Información Personal</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nombre:</label>
                    <span>{detalleUsuario.usuario.nombre}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{detalleUsuario.usuario.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Nombres Completos:</label>
                    <span>{detalleUsuario.usuario.nombres} {detalleUsuario.usuario.apellidos}</span>
                  </div>
                  <div className="info-item">
                    <label>Teléfono:</label>
                    <span>{detalleUsuario.usuario.telefono || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Rol:</label>
                    <span>{getRolBadge(detalleUsuario.usuario.rol)}</span>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <span>{getStatusBadge(detalleUsuario.usuario.status)}</span>
                  </div>
                  <div className="info-item">
                    <label>Registro:</label>
                    <span>{formatearFecha(detalleUsuario.usuario.creado_en)}</span>
                  </div>
                  <div className="info-item">
                    <label>Dirección:</label>
                    <span>{detalleUsuario.usuario.direccion || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Compras */}
              <div className="detalle-section">
                <h3>📊 Estadísticas de Compras</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">Total Pedidos</span>
                    <span className="stat-value">{detalleUsuario.estadisticas.total_pedidos}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Total Gastado</span>
                    <span className="stat-value">{formatearMoneda(detalleUsuario.estadisticas.total_gastado)}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Ticket Promedio</span>
                    <span className="stat-value">{formatearMoneda(detalleUsuario.estadisticas.ticket_promedio)}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Último Pedido</span>
                    <span className="stat-value">{formatearFecha(detalleUsuario.estadisticas.ultimo_pedido)}</span>
                  </div>
                </div>
              </div>

              {/* Productos Favoritos */}
              {detalleUsuario.productos_favoritos.length > 0 && (
                <div className="detalle-section">
                  <h3>⭐ Productos Favoritos</h3>
                  <ul className="favoritos-list">
                    {detalleUsuario.productos_favoritos.map((prod, index) => (
                      <li key={index}>
                        <strong>{prod.nombre_producto}</strong> ({prod.marca}) - 
                        Comprado {prod.veces_comprado} {prod.veces_comprado === 1 ? 'vez' : 'veces'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Historial de Pedidos */}
              <div className="detalle-section">
                <h3>📦 Últimos 10 Pedidos</h3>
                {detalleUsuario.pedidos.length > 0 ? (
                  <table className="tabla-pedidos">
                    <thead>
                      <tr>
                        <th>N° Pedido</th>
                        <th>Fecha</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleUsuario.pedidos.map((pedido) => (
                        <tr key={pedido.id}>
                          <td>{pedido.numero_pedido}</td>
                          <td>{formatearFecha(pedido.creado_en)}</td>
                          <td>{pedido.total_items}</td>
                          <td>{formatearMoneda(pedido.total)}</td>
                          <td><span className={`badge-estado ${pedido.estado.toLowerCase()}`}>{pedido.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-message">No ha realizado pedidos</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secundario" onClick={() => setModalDetalle(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR USUARIO */}
      {modalEditar && (
        <div className="modal-overlay" onClick={() => setModalEditar(false)}>
          <div className="modal-content modal-editar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Usuario</h2>
              <button className="btn-cerrar" onClick={() => setModalEditar(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-grupo">
                  <label>Nombre Usuario</label>
                  <input
                    type="text"
                    value={formEditar.nombre}
                    onChange={(e) => setFormEditar({...formEditar, nombre: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formEditar.email}
                    onChange={(e) => setFormEditar({...formEditar, email: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Nombres</label>
                  <input
                    type="text"
                    value={formEditar.nombres}
                    onChange={(e) => setFormEditar({...formEditar, nombres: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    value={formEditar.apellidos}
                    onChange={(e) => setFormEditar({...formEditar, apellidos: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formEditar.telefono}
                    onChange={(e) => setFormEditar({...formEditar, telefono: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Teléfono Secundario</label>
                  <input
                    type="text"
                    value={formEditar.telefono_secundario}
                    onChange={(e) => setFormEditar({...formEditar, telefono_secundario: e.target.value})}
                  />
                </div>

                <div className="form-grupo full-width">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formEditar.direccion}
                    onChange={(e) => setFormEditar({...formEditar, direccion: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Departamento</label>
                  <input
                    type="text"
                    value={formEditar.departamento}
                    onChange={(e) => setFormEditar({...formEditar, departamento: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Provincia</label>
                  <input
                    type="text"
                    value={formEditar.provincia}
                    onChange={(e) => setFormEditar({...formEditar, provincia: e.target.value})}
                  />
                </div>

                <div className="form-grupo">
                  <label>Distrito</label>
                  <input
                    type="text"
                    value={formEditar.distrito}
                    onChange={(e) => setFormEditar({...formEditar, distrito: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secundario" onClick={() => setModalEditar(false)}>
                Cancelar
              </button>
              <button className="btn-primario" onClick={guardarEdicion}>
                💾 Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CAMBIAR ROL */}
      {modalCambiarRol && usuarioSeleccionado && (
        <div className="modal-overlay" onClick={() => setModalCambiarRol(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔄 Cambiar Rol de Usuario</h2>
              <button className="btn-cerrar" onClick={() => setModalCambiarRol(false)}>✕</button>
            </div>

            <div className="modal-body">
              <p><strong>Usuario:</strong> {usuarioSeleccionado.nombre}</p>
              <p><strong>Email:</strong> {usuarioSeleccionado.email}</p>
              <p><strong>Rol Actual:</strong> {getRolBadge(usuarioSeleccionado.rol)}</p>

              <div className="cambiar-rol-opciones">
                <button
                  className={`btn-rol-opcion ${usuarioSeleccionado.rol === 'CLIENTE' ? 'disabled' : ''}`}
                  onClick={() => cambiarRol('CLIENTE')}
                  disabled={usuarioSeleccionado.rol === 'CLIENTE'}
                >
                  🛍️ Cambiar a CLIENTE
                </button>
                <button
                  className={`btn-rol-opcion ${usuarioSeleccionado.rol === 'ADMIN' ? 'disabled' : ''}`}
                  onClick={() => cambiarRol('ADMIN')}
                  disabled={usuarioSeleccionado.rol === 'ADMIN'}
                >
                  👨‍💼 Cambiar a ADMIN
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secundario" onClick={() => setModalCambiarRol(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOP CLIENTES */}
      {modalTopClientes && (
        <div className="modal-overlay" onClick={() => setModalTopClientes(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏆 Top 10 Clientes</h2>
              <button className="btn-cerrar" onClick={() => setModalTopClientes(false)}>✕</button>
            </div>

            <div className="modal-body">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Pedidos</th>
                    <th>Total Gastado</th>
                    <th>Ticket Prom.</th>
                    <th>Último Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientes.map((cliente, index) => (
                    <tr key={cliente.id}>
                      <td className="rank">{index + 1}</td>
                      <td>{cliente.nombres} {cliente.apellidos || cliente.nombre}</td>
                      <td>{cliente.email}</td>
                      <td className="text-center">{cliente.total_pedidos}</td>
                      <td className="precio">{formatearMoneda(cliente.total_gastado)}</td>
                      <td>{formatearMoneda(cliente.ticket_promedio)}</td>
                      <td>{formatearFecha(cliente.ultimo_pedido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn-secundario" onClick={() => setModalTopClientes(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;