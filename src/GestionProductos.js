import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from './config/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GestionProductos.css';

// Normaliza URLs de imagen (garantiza placeholder absoluto)
const safeImageUrl = (url) => {
  const placeholder = 'https://via.placeholder.com/300x300.png?text=' + encodeURIComponent('Sin Imagen');
  if (!url) return placeholder;
  if (/^https?:\/\//i.test(url)) return url;
  // Cualquier cosa rara la convertimos a placeholder
  return placeholder;
};

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [productoEditando, setProductoEditando] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    precio_base: '',
    imagen_principal_url: '',
    success: false,
    error: false
  });
  const [loading, setLoading] = useState(false);

  // guard para evitar setState en componentes desmontados
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Cargar inicial
  useEffect(() => {
    fetchProductos();
    fetchMarcas();
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [productos, filtroMarca, busqueda]);

  const fetchProductos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!isMountedRef.current) return;
      setProductos(res.data);
    } catch (err) {
      console.error('Error cargar productos:', err);
      // No bloquear la UI, solo notificar
    }
  };

  const fetchMarcas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/marcas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!isMountedRef.current) return;
      setMarcas(res.data);
    } catch (err) {
      console.error('Error cargar marcas:', err);
    }
  };

  const filtrarProductos = () => {
    let resultados = [...productos];
    if (filtroMarca) resultados = resultados.filter(p => p.marca === filtroMarca);
    if (busqueda) {
      const b = busqueda.toLowerCase();
      resultados = resultados.filter(p => (p.nombre || '').toLowerCase().includes(b) || (p.marca || '').toLowerCase().includes(b));
    }
    setProductosFiltrados(resultados);
  };

  // CLONAR producto al editar (evita referencias compartidas)
  const handleEditarProducto = (producto) => {
    const copia = { ...producto };
    console.log('Abrir modal editar id=', copia.id);
    setProductoEditando(copia);
    setFormData({
      descripcion: copia.descripcion || '',
      precio_base: copia.precio_base || '',
      imagen_principal_url: copia.imagen_principal_url || '',
      success: false,
      error: false
    });
  };

  // Submit: actualiza backend y estado localmente; NO recargar lista
  const handleSubmitEdicion = async (e) => {
    e.preventDefault();
    if (!productoEditando) return;
    console.log('Submit edit id=', productoEditando.id);
    setLoading(true);

    const payload = {
      descripcion: formData.descripcion,
      precio_base: formData.precio_base,
      imagen_principal_url: formData.imagen_principal_url
    };

    try {
      await axios.put(`${API_URL}/api/admin/products/${productoEditando.id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // actualizar localmente, con requestAnimationFrame para evitar race con el DOM
      requestAnimationFrame(() => {
        setProductos(prev => prev.map(p => p.id === productoEditando.id ? { ...p, ...payload } : p));
      });

      if (!isMountedRef.current) return;
      setFormData(f => ({ ...f, success: true, error: false }));
      setLoading(false);

      // NO cerramos inmediatamente el modal; el usuario cierra manualmente
    } catch (err) {
      console.error('Error actualizar producto:', err);
      if (!isMountedRef.current) return;
      setFormData(f => ({ ...f, error: true, success: false }));
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    console.log('Cerrar modal id=', productoEditando?.id);
    setProductoEditando(null);
    setFormData({
      descripcion: '',
      precio_base: '',
      imagen_principal_url: '',
      success: false,
      error: false
    });
  };

  const limpiarFiltros = () => {
    setFiltroMarca('');
    setBusqueda('');
  };

  return (
    <div className="gestion-productos-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">📦 Gestión de Productos</h1>
          <p className="page-subtitle">Completa la información de tus productos del catálogo</p>
        </div>
      </div>

      <div className="filtros-section">
        <div className="filtros-container">
          <div className="filtro-item">
            <label className="filtro-label">🔍 Buscar</label>
            <input className="filtro-input" placeholder="Buscar por nombre o marca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>

          <div className="filtro-item">
            <label className="filtro-label">🏷️ Filtrar por Marca</label>
            <select className="filtro-select" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)}>
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={typeof m === 'string' ? m : m.id} value={typeof m === 'string' ? m : (m.nombre || m.value || m.id)}>
                  {typeof m === 'string' ? m : (m.nombre || m.value || m.id)}
                </option>
              ))}
            </select>
          </div>

          {(filtroMarca || busqueda) && <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>✕ Limpiar filtros</button>}
        </div>

        <div className="filtros-info">
          <span className="badge-count">{productosFiltrados.length} de {productos.length} productos</span>
        </div>
      </div>

      <div className="productos-section">
        <div className="productos-grid">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="producto-card">
              <div className="producto-image-container">
                <img src={safeImageUrl(producto.imagen_principal_url)} alt={producto.nombre} className="producto-image"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x300.png?text=' + encodeURIComponent('Error al cargar'); }} />
                <div className="producto-badge">{producto.marca}</div>

                <div className="producto-status">
                  {!producto.descripcion && <span className="status-warning" title="Falta descripción">📝</span>}
                  {!producto.precio_base && <span className="status-warning" title="Falta precio">💰</span>}
                  {!producto.imagen_principal_url && <span className="status-warning" title="Falta imagen">🖼️</span>}
                </div>
              </div>

              <div className="producto-content">
                <h5 className="producto-title">{producto.nombre}</h5>
                <p className="producto-description">{producto.descripcion || <em>Sin descripción</em>}</p>

                <div className="producto-info-grid">
                  <div className="info-item"><span className="info-label">Precio:</span><span className="info-value">{producto.precio_base ? `S/ ${parseFloat(producto.precio_base).toFixed(2)}` : <em>Sin precio</em>}</span></div>
                  <div className="info-item"><span className="info-label">Stock:</span><span className="info-value">{producto.stock_total}</span></div>
                  <div className="info-item"><span className="info-label">Tallas:</span><span className="info-value">{producto.tallas_disponibles || 'N/A'}</span></div>
                </div>

                <button className="btn-editar" onClick={() => handleEditarProducto(producto)}><span className="btn-icon-sm">✏️</span>Editar Información</button>
              </div>
            </div>
          ))}

          {productosFiltrados.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No se encontraron productos</h4>
              <p>{filtroMarca || busqueda ? 'Intenta ajustar los filtros de búsqueda' : 'No hay productos registrados.'}</p>
              {(filtroMarca || busqueda) && <button className="btn-limpiar" onClick={limpiarFiltros}>Limpiar filtros</button>}
            </div>
          )}
        </div>
      </div>

      {/* Modal: NOTA - overlay sin auto-close para evitar races */}
      {productoEditando && (
        <div className="modal-overlay">
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div>
                <h4>✏️ Editar Producto</h4>
                <p className="modal-subtitle">{productoEditando.nombre} - {productoEditando.marca}</p>
              </div>
              <button className="btn-close-modal" onClick={cerrarModal}>✕</button>
            </div>

            <form onSubmit={handleSubmitEdicion} className="modal-body-custom">
              <div className="form-grid">
                <div className="form-group-full">
                  <label>📝 Descripción</label>
                  <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows="4" className="form-control-custom" />
                </div>

                <div className="form-group">
                  <label>💰 Precio (S/)</label>
                  <div className="input-group-custom">
                    <span className="input-prefix">S/</span>
                    <input type="number" step="0.01" min="0" value={formData.precio_base} onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })} className="form-control-custom with-prefix" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>🖼️ URL de Imagen</label>
                  <input type="url" value={formData.imagen_principal_url} onChange={(e) => setFormData({ ...formData, imagen_principal_url: e.target.value })} className="form-control-custom" placeholder="https://ejemplo.com/imagen.jpg" required />
                </div>

                {formData.imagen_principal_url && (
                  <div className="form-group-full">
                    <label>Vista previa</label>
                    <div className="image-preview">
                      <img src={safeImageUrl(formData.imagen_principal_url)} alt="Preview" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x300.png?text=' + encodeURIComponent('Error al cargar'); }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                {formData.success && <div className="alert-success">✅ Producto actualizado correctamente</div>}
                {formData.error && <div className="alert-error">❌ Error al actualizar el producto</div>}

                <button type="button" className="btn-cancel" onClick={cerrarModal} disabled={loading}>{formData.success ? 'Cerrar' : 'Cancelar'}</button>
                {!formData.success && <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProductos;
