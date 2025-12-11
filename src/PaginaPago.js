import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config/api';
import Swal from 'sweetalert2';
import './Checkout.css';

function PaginaPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const [datosCompra, setDatosCompra] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const stripeInstanceRef = useRef(null);

  useEffect(() => {
    const datos = location.state?.datosCompra || JSON.parse(localStorage.getItem('datosCompra') || 'null');
    
    if (!datos?.clientSecret) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Por favor vuelve a iniciar el proceso de compra',
        confirmButtonColor: '#5b21b6'
      }).then(() => navigate('/checkout'));
      return;
    }

    setDatosCompra(datos);
  }, [navigate, location]);

  useEffect(() => {
    if (!datosCompra || !containerRef.current) return;

    let mounted = true;

    const initStripe = async () => {
      try {
        // Limpiar contenedor
        containerRef.current.innerHTML = '';

        // Crear elementos del DOM directamente
        const formHTML = `
          <div class="stripe-form">
            <div class="payment-info">
              <p class="payment-amount">
                Total a pagar: <strong>S/ ${datosCompra.total.toFixed(2)}</strong>
              </p>
            </div>
            <div id="payment-element"></div>
            <div id="error-message" style="display: none; color: #e74c3c; margin: 10px 0;"></div>
            <button id="submit-button" class="btn-pagar">
              🔒 Pagar S/ ${datosCompra.total.toFixed(2)}
            </button>
            <div class="test-card-info">
              <p><strong>💳 Para pruebas, usa:</strong></p>
              <p>Tarjeta: 4242 4242 4242 4242</p>
              <p>Fecha: Cualquier fecha futura</p>
              <p>CVC: Cualquier 3 dígitos</p>
            </div>
          </div>
        `;

        containerRef.current.innerHTML = formHTML;

        // Cargar Stripe dinámicamente
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

        if (!mounted) return;

        const elements = stripe.elements({
          clientSecret: datosCompra.clientSecret,
          appearance: { theme: 'stripe' }
        });

        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

        stripeInstanceRef.current = { stripe, elements };

        // Manejar submit
        const submitButton = containerRef.current.querySelector('#submit-button');
        const errorDiv = containerRef.current.querySelector('#error-message');

        submitButton.addEventListener('click', async (e) => {
          e.preventDefault();

          if (loading) return;

          setLoading(true);
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="spinner"></span> Procesando pago...';
          errorDiv.style.display = 'none';

          try {
            const { error, paymentIntent } = await stripe.confirmPayment({
              elements,
              redirect: 'if_required',
            });

            if (error) {
              errorDiv.textContent = '⚠️ ' + error.message;
              errorDiv.style.display = 'block';
              Swal.fire({
                icon: 'error',
                title: 'Error en el pago',
                text: error.message,
                confirmButtonColor: '#5b21b6'
              });
              submitButton.disabled = false;
              submitButton.innerHTML = `🔒 Pagar S/ ${datosCompra.total.toFixed(2)}`;
              setLoading(false);
              return;
            }

            if (paymentIntent?.status === 'succeeded') {
              await crearPedido(paymentIntent.id);
            }
          } catch (error) {
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.innerHTML = `🔒 Pagar S/ ${datosCompra.total.toFixed(2)}`;
            setLoading(false);
          }
        });

      } catch (error) {
        console.error('Error inicializando Stripe:', error);
      }
    };

    initStripe();

    return () => {
      mounted = false;
      if (stripeInstanceRef.current?.elements) {
        try {
          // Limpiar Stripe Elements
          const paymentElement = stripeInstanceRef.current.elements.getElement('payment');
          if (paymentElement) {
            paymentElement.unmount();
          }
        } catch (e) {
          console.log('Error al limpiar:', e);
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [datosCompra]);

const crearPedido = async (paymentIntentId) => {
  try {
    const token = localStorage.getItem('token');
    let direccionCompleta = `${datosCompra.formData.direccion}, ${datosCompra.formData.distrito}, ${datosCompra.formData.provincia}, ${datosCompra.formData.departamento}`;
    
    if (datosCompra.formData.referencia) {
      direccionCompleta += ` (Ref: ${datosCompra.formData.referencia})`;
    }

    const pedidoData = {
      items: datosCompra.carrito.map(item => ({
        productoId: item.productoId,
        varianteId: item.varianteId,
        nombre: item.nombre,
        marca: item.marca, // ✅ AGREGAR
        talla: item.talla,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      subtotal: datosCompra.total - 15,
      descuento: 0,
      envio: 15,
      total: datosCompra.total,
      direccionEnvio: direccionCompleta,
      paymentIntentId,
      // ✅ AGREGAR ESTOS CAMPOS
      nombreCompleto: `${datosCompra.formData.nombres} ${datosCompra.formData.apellidos}`,
      telefono: datosCompra.formData.telefono
    };

    const response = await axios.post(`${API_URL}/api/pedidos/crear`, pedidoData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    localStorage.removeItem('carrito');
    localStorage.removeItem('datosCompra');

    // ✅ Usar numero_pedido con guion bajo
    const numeroPedido = response.data.numero_pedido || response.data.numeroPedido || 'CONFIRMADO';

    await Swal.fire({
      icon: 'success',
      title: '¡Pedido Confirmado!',
      html: `
        <p>Tu pedido <strong>#${numeroPedido}</strong> ha sido procesado correctamente.</p>
        <p>Recibirás un email con la boleta y detalles del envío.</p>
      `,
      confirmButtonColor: '#5b21b6',
      allowOutsideClick: false
    });

    navigate(`/confirmacion?pedido=${numeroPedido}`, { replace: true });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El pago fue exitoso pero hubo un error al crear el pedido.',
      confirmButtonColor: '#5b21b6'
    });
    setLoading(false);
  }
};

  if (!datosCompra) {
    return (
      <div className="checkout-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">💳 Procesar Pago</h2>
        <div ref={containerRef}></div>
      </div>
    </div>
  );
}

export default PaginaPago;