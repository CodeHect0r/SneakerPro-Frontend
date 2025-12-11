import React, { useState } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import { useNavigate } from 'react-router-dom';  
import './register.css';
import Swal from 'sweetalert2';  // Importa SweetAlert2

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null); 
  const [isRegistered, setIsRegistered] = useState(false);  // Estado para saber si el usuario se registró
  const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito después de la verificación
  const navigate = useNavigate();  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUser = { nombre, email, password };
    console.log('Datos que se van a enviar:', newUser); 

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, newUser);
      console.log('Usuario registrado:', response.data);  

      setIsRegistered(true);  // Usuario registrado, ahora puede ingresar el código
      setError(null); // Limpiar cualquier error
      setSuccessMessage('¡Te hemos enviado un código de verificación a tu correo!');
    } catch (error) {
      console.error('Error al registrar', error);
      setError('Hubo un problema al registrar el usuario. Inténtalo nuevamente.');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    const verificationData = { email, verificationCode };
    console.log('Datos de verificación:', verificationData);

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify`, verificationData);
      console.log('Verificación exitosa:', response.data);

      // Mostrar un mensaje de éxito con SweetAlert2
      Swal.fire({
        title: '¡Cuenta Verificada!',
        text: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
        icon: 'success',  // El tipo de icono (success, error, warning, info, question)
        confirmButtonText: 'Ir al Login'  // Texto del botón de confirmación
      }).then(() => {
        navigate('/login');  // Redirigir al login después de que el usuario presione el botón
      });
      
    } catch (error) {
      console.error('Error en la verificación', error);
      setError('Código incorrecto o expirado. Intenta nuevamente.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>¡Registrate con nosotros!</h1>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="verification-message">{successMessage}</div>} {/* Mensaje de éxito */}

        <form 
          onSubmit={handleSubmit} 
          className={isRegistered ? 'register-form hidden' : 'register-form'} /* Si el usuario ya se registró, oculta este formulario */
        >
          <div className="input-container">
            <input 
              type="text" 
              placeholder="Nombre" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
            />
          </div>
          
          <div className="input-container">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="input-container">
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button type="submit">Registrate ya</button>
        </form>

        {/* Formulario de verificación (visible después de registrarse) */}
        <form 
          onSubmit={handleVerificationSubmit} 
          className={isRegistered ? 'verification-form visible' : 'verification-form'} /* Solo muestra el formulario de verificación después del registro */
        >
          <div className="input-container">
            <input 
              type="text" 
              placeholder="Código de verificación" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
            />
          </div>

          <button type="submit">Verificar código</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
