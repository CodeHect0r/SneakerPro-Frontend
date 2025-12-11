import React, { useState } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import { useNavigate } from 'react-router-dom';  
import './login.css';  

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  

 const handleSubmit = async (e) => {
  e.preventDefault();

  const userData = { email, password };

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, userData);
    console.log('Respuesta del backend:', response.data);

    const { token, rol } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', rol);

    console.log('Login exitoso', token);
    console.log('Rol del usuario:', rol);

    if (rol === 'ADMIN') {
      navigate('/admin-panel');
    } else {
      navigate('/home');
    }
  } catch (error) {
    console.error('Error al hacer login', error);
  }
};

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Bienvenido</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="input-container">
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>
        <div className="divider">o</div>
        <button onClick={goToRegister} className="register-button">
          Crear cuenta nueva
        </button>
      </div>
    </div>
  );
};

export default Login;