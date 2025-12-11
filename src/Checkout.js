import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config/api';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';

import './Checkout.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Checkout = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [mostrarPago, setMostrarPago] = useState(false);

  const [formData, setFormData] = useState({
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

  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
const descuento = 0;
const envio = subtotal > 0 ? 15.00 : 0;

// 👇 CALCULAR IGV
const baseImponible = subtotal - descuento + envio;
const igv = baseImponible * 0.18;
const total = baseImponible + igv;

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      const items = JSON.parse(carritoGuardado);
      if (items.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Carrito vacío',
          text: 'Tu carrito está vacío. Agrega productos antes de continuar.',
          confirmButtonColor: '#5b21b6'
        }).then(() => navigate('/productos'));
        return;
      }
      setCarrito(items);
    } else {
      navigate('/productos');
    }

    cargarDatosUsuario();
  }, [navigate]);

  const cargarDatosUsuario = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/usuarios/detalle`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.datos) {
        setFormData(response.data.datos);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validarFormulario = () => {
    const camposRequeridos = ['nombres', 'apellidos', 'telefono', 'direccion', 'departamento', 'provincia', 'distrito'];
    
    for (let campo of camposRequeridos) {
      if (!formData[campo] || formData[campo].trim() === '') {
        Swal.fire({
          icon: 'error',
          title: 'Campos incompletos',
          text: `Por favor completa el campo: ${campo.replace('_', ' ')}`,
          confirmButtonColor: '#5b21b6'
        });
        return false;
      }
    }

    if (!/^\d{9}$/.test(formData.telefono)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        text: 'El teléfono debe tener 9 dígitos',
        confirmButtonColor: '#5b21b6'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validarFormulario()) return;

  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'No autenticado',
        text: 'Por favor inicia sesión para continuar',
        confirmButtonColor: '#5b21b6'
      }).then(() => navigate('/login'));
      return;
    }

    await axios.post(`${API_URL}/api/usuarios/detalle`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const totalEnCentavos = Math.round(total * 100);
    
    const paymentResponse = await axios.post(`${API_URL}/api/stripe/create-payment-intent`, {
      amount: totalEnCentavos,
      currency: 'pen',
      metadata: {
        usuario: formData.nombres + ' ' + formData.apellidos,
        productos: carrito.length
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ✅ Guardar datos y navegar
    const datosCompra = {
      clientSecret: paymentResponse.data.clientSecret,
      formData,
      carrito,
      total
    };

    localStorage.setItem('datosCompra', JSON.stringify(datosCompra));
    navigate('/pago', { state: { datosCompra } });

  } catch (error) {
    console.error('Error al procesar checkout:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.error || 'Error al procesar la solicitud',
      confirmButtonColor: '#5b21b6'
    });
  } finally {
    setLoading(false);
  }
};

 

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="checkout-form-section">
          <h2 className="checkout-title">📋 Información de Envío</h2>
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombres *</label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellidos *</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: Pérez García"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="987654321"
                  maxLength="9"
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono Secundario</label>
                <input
                  type="tel"
                  name="telefono_secundario"
                  value={formData.telefono_secundario}
                  onChange={handleChange}
                  placeholder="123456789 (opcional)"
                  maxLength="9"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dirección *</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Lima 123, Dpto. 402"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Departamento *</label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  placeholder="Lima"
                  required
                />
              </div>
              <div className="form-group">
                <label>Provincia *</label>
                <input
                  type="text"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  placeholder="Lima"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Distrito *</label>
              <input
                type="text"
                name="distrito"
                value={formData.distrito}
                onChange={handleChange}
                placeholder="Miraflores"
                required
              />
            </div>

            <div className="form-group">
              <label>Referencia</label>
              <textarea
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                placeholder="Ej: Al frente del parque, casa color blanca"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Género (opcional)</label>
              <select name="genero" value={formData.genero} onChange={handleChange}>
                <option value="">Prefiero no decir</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-continuar-pago"
              disabled={loading}
            >
              {loading ? 'Procesando...' : '💳 Continuar al Pago'}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h3 className="summary-title">🛍️ Resumen del Pedido</h3>
          
          <div className="summary-items">
            {carrito.map((item, index) => (
              <div key={index} className="summary-item">
                <img src={item.imagen} alt={item.nombre} />
                <div className="item-details">
                  <p className="item-name">{item.nombre}</p>
                  <p className="item-info">Talla: {item.talla} | Cant: {item.cantidad}</p>
                </div>
                <p className="item-price">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
              </div>
            ))}
          </div>

         <div className="summary-totals">
  <div className="total-row">
    <span>Subtotal</span>
    <span>S/ {subtotal.toFixed(2)}</span>
  </div>
  {descuento > 0 && (
    <div className="total-row discount">
      <span>Descuento</span>
      <span>- S/ {descuento.toFixed(2)}</span>
    </div>
  )}
  <div className="total-row">
    <span>Envío</span>
    <span>S/ {envio.toFixed(2)}</span>
  </div>
  
  <hr style={{margin: '10px 0', border: 'none', borderTop: '1px solid #e5e7eb'}} />
  
  {/* 👇 AGREGAR DESGLOSE IGV */}
  <div className="total-row" style={{fontSize: '0.9em', color: '#6b7280'}}>
    <span>Base Imponible</span>
    <span>S/ {baseImponible.toFixed(2)}</span>
  </div>
  <div className="total-row" style={{fontSize: '0.9em', color: '#6b7280'}}>
    <span>IGV (18%)</span>
    <span>S/ {igv.toFixed(2)}</span>
  </div>
  
  <hr style={{margin: '10px 0', border: 'none', borderTop: '2px solid #000'}} />
  
  <div className="total-row total-final">
    <span>TOTAL</span>
    <span>S/ {total.toFixed(2)}</span>
  </div>
</div>

          <div className="security-badge">
            🔒 Pago seguro con Stripe
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;