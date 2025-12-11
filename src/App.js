import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import Register from './register';
import Home from './home';
import Products from './products';
import AdminPanel from './AdminPanel'; 
import GestionProductos from './GestionProductos'; 
import PrivateRoute from './PrivateRoute';
import ProductDetail from './ProductDetail';
import Carrito from './Carrito';
import RegistroGuiaRemision from './RegistroGuiaRemision';
import Checkout from './Checkout';
import Confirmacion from './Confirmacion';
import PaginaPago from './PaginaPago';
import Perfil from './Perfil';
import Inventario from './Inventario';
import AnalisisVentas from './AnalisisVentas';
import ReportesGenerales from './ReportesGenerales';
import GestionUsuarios from './GestionUsuarios';


import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta para login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta para registro */}
          <Route path="/register" element={<Register />} />

          {/* Ruta protegida para Home (solo cliente) */}
          <Route element={<PrivateRoute role="CLIENTE" />}>
            <Route path="/home" element={<Home />} />
          </Route>
           <Route path="/perfil" element={<Perfil />} />
           <Route path="/checkout" element={<Checkout />} />
           <Route path="/confirmacion" element={<Confirmacion />} />

           <Route path="/pago" element={<PaginaPago />} />


          {/* Ruta protegida para el panel de administración (solo admin) */}
          <Route element={<PrivateRoute role="ADMIN" />}>
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/registro-guia-remision" element={<RegistroGuiaRemision />} />
            <Route path="/gestion-productos" element={<GestionProductos />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/analisis-ventas" element={<AnalisisVentas />} />
            <Route path="/reportes-generales" element={<ReportesGenerales />} />
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
            
          </Route>

          {/* Ruta para productos */}
          <Route path="/products" element={<Products />} />


           <Route path="/products/:id" element={<ProductDetail />} /> 

          <Route path="/carrito" element={<Carrito />} />  

              
       

          {/* Redirección por defecto al login */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
