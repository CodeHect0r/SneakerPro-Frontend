import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para navegar
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate(); // Instancia de useNavigate
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', color: '#6366f1' },
    { id: 'productos', icon: '📦', label: 'Productos', color: '#8b5cf6' },
    { id: 'usuarios', icon: '👥', label: 'Usuarios', color: '#ec4899' },
    { id: 'inventario', icon: '📋', label: 'Inventario', color: '#14b8a6' },
    { id: 'ventas', icon: '💰', label: 'Ventas', color: '#f59e0b' },
    { id: 'reportes', icon: '📈', label: 'Reportes', color: '#ef4444' },
    { id: 'guías', icon: '📝', label: 'Guías', color: '#06b6d4' }
  ];

 

  const quickActions = [
    { 
      title: 'Gestión de Productos',
      description: 'Añadir, editar o eliminar productos del catálogo',
      icon: '🛍️',
      action: '#productos',
      path: '/gestion-productos', // Ruta para la gestión de productos
      color: '#6366f1'
    },
    { 
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios y permisos del sistema',
      icon: '👨‍💼',
      action: '#usuarios',
      path: '/gestion-usuarios',
      color: '#ec4899'
    },
    { 
      title: 'Control de Inventario',
      description: 'Monitorear stock y alertas de inventario',
      icon: '📊',
      action: '#inventario',
      path: '/inventario', 
      color: '#14b8a6'
    },
    { 
      title: 'Análisis de Ventas',
      description: 'Reportes detallados y métricas de desempeño',
      icon: '📈',
      action: '#ventas',
      path: '/analisis-ventas', 
      color: '#f59e0b'
    },
    { 
      title: 'Reportes Generales',
      description: 'Genera informes personalizados del negocio',
      icon: '📑',
      action: '#reportes',
      path: '/reportes-generales',
      color: '#ef4444'
    },
    { 
      title: 'Guías de Remisión',
      description: 'Registra y consulta guías de remisión',
      icon: '📋',
      action: '#guías',
      path: '/registro-guia-remision',
      color: '#06b6d4'
    }
  ];

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      
      <div className="admin-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-icon">⚡</div>
              {!sidebarCollapsed && <span className="brand-text">AdminPro</span>}
            </div>
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(item.id);
                  if (item.id === 'productos') {
                    navigate('/gestion-productos'); // Redirige al panel de productos
                  }
                }}
                style={{'--item-color': item.color}}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                {!sidebarCollapsed && activeSection === item.id && (
                  <span className="active-indicator"></span>
                )}
              </a>
            ))}
          </nav>

         <div className="sidebar-footer">
  <div className={`user-profile ${sidebarCollapsed ? 'collapsed' : ''}`}>
    <div className="user-avatar">👨‍💼</div>
    {!sidebarCollapsed && (
      <div className="user-info">
        <div className="user-name">Admin User</div>
        <div className="user-role">Administrador</div>
      </div>
    )}
  </div>
  <button 
    className={`logout-btn ${sidebarCollapsed ? 'collapsed' : ''}`}
    onClick={() => {
      if (window.confirm('¿Cerrar sesión?')) {
        localStorage.clear();
        navigate('/login');
      }
    }}
    title="Cerrar sesión"
  >
    {sidebarCollapsed ? '🚪' : '🚪 Cerrar Sesión'}
  </button>
</div>
        </aside>

        {/* Main Content */}
        <div className="main-content">
          {/* Top Bar */}
          <header className="top-bar">
            <div className="top-bar-left">
              <button 
                className="mobile-menu-btn d-lg-none"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                ☰
              </button>
              <div className="page-title">
                <h1>Panel de Administración</h1>
                <p>Bienvenido de vuelta, aquí está tu resumen de hoy</p>
              </div>
            </div>

            <div className="top-bar-right">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Buscar..." />
              </div>
              <div className="header-actions">
                <button className="action-btn">
                  <span className="icon">🔔</span>
                  <span className="badge">3</span>
                </button>
                <button className="action-btn">
                  <span className="icon">✉️</span>
                  <span className="badge">5</span>
                </button>
                <button className="action-btn">
                  <span className="icon">⚙️</span>
                </button>
              </div>
            </div>
          </header>

          {/* Quick Actions Section */}
          <section className="section section-full">
            <div className="section-header">
              <h2>Panel de Gestión</h2>
              <p className="section-subtitle">Accede rápidamente a las funciones principales del sistema</p>
            </div>
            
            <div className="actions-grid-large">
              {quickActions.map((action, index) => (
                <a key={index} href={action.action} className="action-card-large" onClick={(e) => {
                  e.preventDefault();
                  navigate(action.path); // Redirige a la ruta especificada en 'path'
                }}>
                  <div className="action-icon-large" style={{background: `${action.color}15`, color: action.color}}>
                    {action.icon}
                  </div>
                  <div className="action-content-large">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                    <div className="action-features">
                      <span className="feature-tag">• Gestión completa</span>
                      <span className="feature-tag">• Reportes en tiempo real</span>
                    </div>
                  </div>
                  <div className="action-arrow-large" style={{color: action.color}}>
                    <span className="arrow-text">Acceder</span>
                    <span className="arrow-icon">→</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
