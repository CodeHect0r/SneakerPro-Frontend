import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config/api';
import './Confirmacion.css';

const Confirmacion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const numeroPedido = searchParams.get('pedido');
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!numeroPedido) {
      navigate('/productos');
      return;
    }

    cargarDetallePedido();
  }, [numeroPedido, navigate]);

  const cargarDetallePedido = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/pedidos/mis-pedidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const pedidoEncontrado = response.data.find(p => p.numero_pedido === numeroPedido);
      setPedido(pedidoEncontrado);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="confirmacion-container">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="confirmacion-container">
      <div className="confirmacion-card">
        <div className="success-icon">✅</div>
        
        <h1 className="confirmacion-title">¡Pedido Confirmado!</h1>
        
        <div className="pedido-numero">
          <p>Tu número de pedido es:</p>
          <h2>#{numeroPedido}</h2>
        </div>

        <div className="confirmacion-info">
          <div className="info-item">
            <span className="icon">📧</span>
            <div>
              <strong>Email enviado</strong>
              <p>Recibirás la boleta y detalles del envío en tu correo</p>
            </div>
          </div>

          <div className="info-item">
            <span className="icon">🚚</span>
            <div>
              <strong>Envío en proceso</strong>
              <p>Tu pedido será procesado en 24-48 horas</p>
            </div>
          </div>

          <div className="info-item">
            <span className="icon">📦</span>
            <div>
              <strong>Seguimiento</strong>
              <p>Puedes ver el estado de tu pedido en "Mis Pedidos"</p>
            </div>
          </div>
        </div>

        {pedido && (
          <div className="pedido-resumen">
            <h3>Resumen del Pedido</h3>
            <div className="resumen-row">
              <span>Total pagado:</span>
              <strong>S/ {pedido.total}</strong>
            </div>
            <div className="resumen-row">
              <span>Estado:</span>
              <span className="badge badge-pendiente">{pedido.estado}</span>
            </div>
          </div>
        )}

        <div className="confirmacion-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/mis-pedidos')}
          >
            Ver Mis Pedidos
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/products')}
          >
            Seguir Comprando
          </button>
        </div>

        <div className="contacto-info">
          <p>¿Necesitas ayuda? Contáctanos:</p>
          <p>📧 sneakerpro2025@gmail.com | 📱 987 654 321</p>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;