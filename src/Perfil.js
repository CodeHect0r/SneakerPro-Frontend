import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import API_URL from './config/api';
import Swal from 'sweetalert2';
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const [usuarioInfo, setUsuarioInfo] = useState({
    nombre: '',
    email: ''
  });

  const [detalleUsuario, setDetalleUsuario] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    telefono_secundario: '',
    direccion: '',
    departamento: '',
    provincia: '',
    distrito: '',
    referencia: '',
    genero: ''
  });

  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener datos del usuario desde localStorage
      const storedNombre = localStorage.getItem('nombre');
      const storedEmail = localStorage.getItem('email');
      
      console.log('Nombre almacenado:', storedNombre);
      console.log('Email almacenado:', storedEmail);
      
      setUsuarioInfo({ 
        nombre: storedNombre || 'Usuario', 
        email: storedEmail || 'No disponible' 
      });

      // Cargar detalle del usuario
      const resDetalle = await axios.get(`${API_URL}/api/usuarios/detalle`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (resDetalle.data.datos) {
        setDetalleUsuario(resDetalle.data.datos);
      }

      // Cargar historial de pedidos
      const resPedidos = await axios.get(`${API_URL}/api/pedidos/mis-pedidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPedidos(resPedidos.data.pedidos || []);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setDetalleUsuario({
      ...detalleUsuario,
      [e.target.name]: e.target.value
    });
  };

  const guardarCambios = async () => {
    if (!detalleUsuario.nombres || !detalleUsuario.apellidos || !detalleUsuario.telefono || 
        !detalleUsuario.direccion || !detalleUsuario.departamento || !detalleUsuario.provincia || 
        !detalleUsuario.distrito) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios (marcados con *)',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    setGuardando(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/usuarios/detalle`, detalleUsuario, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Datos guardados!',
        text: 'Tu información se actualizó correctamente',
        confirmButtonColor: '#667eea',
        timer: 2000
      });
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la información',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  const verDetallePedido = async (pedidoId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/pedidos/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { pedido, items } = res.data;

      const itemsHTML = items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #e2e8f0; align-items: center;">
          <div style="text-align: left;">
            <strong style="color: #1a202c;">${item.nombre_producto}</strong>
            <br>
            <small style="color: #718096;">Talla: ${item.talla} | Cantidad: ${item.cantidad}</small>
          </div>
          <span style="font-weight: 700; color: #667eea;">S/ ${parseFloat(item.subtotal).toFixed(2)}</span>
        </div>
      `).join('');

      Swal.fire({
        title: `📦 Pedido ${pedido.numero_pedido}`,
        html: `
          <div style="text-align: left; max-height: 450px; overflow-y: auto;">
            <div style="background: #f7fafc; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong style="color: #2d3748;">Estado:</strong> 
                <span style="background: ${pedido.estado === 'PENDIENTE' ? '#fef3c7' : pedido.estado === 'ENVIADO' ? '#dbeafe' : '#d1fae5'}; 
                            color: ${pedido.estado === 'PENDIENTE' ? '#78350f' : pedido.estado === 'ENVIADO' ? '#1e3a8a' : '#065f46'}; 
                            padding: 4px 12px; border-radius: 15px; font-weight: 700;">${pedido.estado}</span>
              </p>
              <p style="margin: 5px 0;"><strong style="color: #2d3748;">Fecha:</strong> ${new Date(pedido.creado_en).toLocaleDateString('es-PE')}</p>
            </div>
            
            <h4 style="color: #1a202c; margin-bottom: 15px;">Productos:</h4>
            <div style="background: white; border: 2px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
              ${itemsHTML}
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px; margin-top: 20px; color: white;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal:</span>
                <span style="font-weight: 700;">S/ ${parseFloat(pedido.subtotal).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Descuento:</span>
                <span style="font-weight: 700;">- S/ ${parseFloat(pedido.descuento).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span>Envío:</span>
                <span style="font-weight: 700;">${parseFloat(pedido.envio) === 0 ? 'GRATIS' : 'S/ ' + parseFloat(pedido.envio).toFixed(2)}</span>
              </div>
              <hr style="border: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 1.3em;">
                <span style="font-weight: 700;">TOTAL:</span>
                <span style="font-weight: 900;">S/ ${parseFloat(pedido.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        `,
        width: '650px',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Cerrar'
      });
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el detalle del pedido',
        confirmButtonColor: '#667eea'
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-perfil">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-wrapper">
      <div className="container py-5">
        <div className="perfil-header">
          <h1>Mi Perfil</h1>
          <button className="btn-cerrar-sesion" onClick={cerrarSesion}>
            🚪 Cerrar Sesión
          </button>
        </div>

        <div className="perfil-info-basica">
          <div className="avatar">
            <FaUser size={40} />
          </div>
          <div className="user-info-text">
            <h3>{usuarioInfo.nombre}</h3>
            <p><FaEnvelope style={{ marginRight: '8px' }} />{usuarioInfo.email}</p>
          </div>
        </div>

        <div className="perfil-tabs">
          <button 
            className={activeTab === 'info' ? 'tab-active' : ''}
            onClick={() => setActiveTab('info')}
          >
            <FaUser style={{ marginRight: '8px' }} />
            Mi Información
          </button>
          <button 
            className={activeTab === 'pedidos' ? 'tab-active' : ''}
            onClick={() => setActiveTab('pedidos')}
          >
            <FaBox style={{ marginRight: '8px' }} />
            Mis Pedidos ({pedidos.length})
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="perfil-content">
            <h3><FaUser style={{ marginRight: '10px' }} />Información Personal</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombres *</label>
                <input 
                  type="text" 
                  name="nombres"
                  value={detalleUsuario.nombres}
                  onChange={handleInputChange}
                  placeholder="Ingresa tus nombres"
                />
              </div>
              <div className="form-group">
                <label>Apellidos *</label>
                <input 
                  type="text" 
                  name="apellidos"
                  value={detalleUsuario.apellidos}
                  onChange={handleInputChange}
                  placeholder="Ingresa tus apellidos"
                />
              </div>
              <div className="form-group">
                <label><FaPhone style={{ marginRight: '5px' }} />Teléfono *</label>
                <input 
                  type="text" 
                  name="telefono"
                  value={detalleUsuario.telefono}
                  onChange={handleInputChange}
                  placeholder="999 999 999"
                />
              </div>
              <div className="form-group">
                <label><FaPhone style={{ marginRight: '5px' }} />Teléfono Secundario</label>
                <input 
                  type="text" 
                  name="telefono_secundario"
                  value={detalleUsuario.telefono_secundario}
                  onChange={handleInputChange}
                  placeholder="999 999 999 (opcional)"
                />
              </div>
              <div className="form-group">
                <label>Género</label>
                <select 
                  name="genero"
                  value={detalleUsuario.genero}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                  <option value="PREFIERO_NO_DECIR">Prefiero no decir</option>
                </select>
              </div>
            </div>

            <h3 className="mt-4"><FaMapMarkerAlt style={{ marginRight: '10px' }} />Dirección de Envío</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Dirección Completa *</label>
                <input 
                  type="text" 
                  name="direccion"
                  value={detalleUsuario.direccion}
                  onChange={handleInputChange}
                  placeholder="Calle, número, urbanización..."
                />
              </div>
              <div className="form-group">
                <label>Departamento *</label>
                <input 
                  type="text" 
                  name="departamento"
                  value={detalleUsuario.departamento}
                  onChange={handleInputChange}
                  placeholder="Ej: Lima"
                />
              </div>
              <div className="form-group">
                <label>Provincia *</label>
                <input 
                  type="text" 
                  name="provincia"
                  value={detalleUsuario.provincia}
                  onChange={handleInputChange}
                  placeholder="Ej: Lima"
                />
              </div>
              <div className="form-group">
                <label>Distrito *</label>
                <input 
                  type="text" 
                  name="distrito"
                  value={detalleUsuario.distrito}
                  onChange={handleInputChange}
                  placeholder="Ej: San Miguel"
                />
              </div>
              <div className="form-group full-width">
                <label>Referencia</label>
                <input 
                  type="text" 
                  name="referencia"
                  value={detalleUsuario.referencia}
                  onChange={handleInputChange}
                  placeholder="Ej: Al costado del parque principal"
                />
              </div>
            </div>

            <button 
              className="btn-guardar-perfil"
              onClick={guardarCambios}
              disabled={guardando}
            >
              {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div className="perfil-content">
            <h3><FaBox style={{ marginRight: '10px' }} />Historial de Compras</h3>
            {pedidos.length === 0 ? (
              <div className="no-pedidos">
                <div className="no-pedidos-icon">📦</div>
                <p>Aún no has realizado ningún pedido</p>
                <button onClick={() => navigate('/products')} className="btn-ver-productos">
                  Ver Productos
                </button>
              </div>
            ) : (
              <div className="pedidos-lista">
                {pedidos.map(pedido => (
                  <div 
                    key={pedido.id} 
                    className="pedido-card"
                    onClick={() => verDetallePedido(pedido.id)}
                  >
                    <div className="pedido-header">
                      <div>
                        <h4>🧾 Pedido #{pedido.numero_pedido}</h4>
                        <p className="pedido-fecha">
                          <FaCalendar style={{ marginRight: '5px' }} />
                          {new Date(pedido.creado_en).toLocaleDateString('es-PE', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <span className={`estado-badge ${pedido.estado.toLowerCase()}`}>
                        {pedido.estado}
                      </span>
                    </div>
                    <div className="pedido-info">
                      <div className="pedido-detalle-row">
                        <span className="pedido-label">💰 Total:</span>
                        <span className="pedido-valor-total">S/ {parseFloat(pedido.total).toFixed(2)}</span>
                      </div>
                      <div className="pedido-detalle-row">
                        <span className="pedido-label">📦 Productos:</span>
                        <span className="pedido-valor">{pedido.total_items} {pedido.total_items === 1 ? 'producto' : 'productos'}</span>
                      </div>
                      {pedido.fecha_entrega_estimada && (
                        <div className="pedido-detalle-row">
                          <span className="pedido-label">🚚 Entrega estimada:</span>
                          <span className="pedido-valor">{new Date(pedido.fecha_entrega_estimada).toLocaleDateString('es-PE')}</span>
                        </div>
                      )}
                    </div>
                    <div className="pedido-footer">
                      <span className="ver-detalle-text">👁️ Click para ver detalles</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;