import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaShoppingCart, FaFacebookF, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import './home.css';

import { Truck, RotateCcw, Shield, Award, Users, Heart } from 'lucide-react';

import homesection1 from './assets/homesection2.png';
import homesection2 from './assets/homesection3.png';
import homesection3 from './assets/homesection1.png';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
      setRole(userRole);
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }
 
  const settings = {
    dots: true, 
    infinite: true, 
    speed: 500, 
    slidesToShow: 1, 
    slidesToScroll: 1, 
    autoplay: true, 
    autoplaySpeed: 4000, 
  };

  const benefits = [
    {
      icon: Truck,
      title: "Envío gratuito",
      description: "Recibe tus productos sin costo adicional en cualquier parte del país",
      color: "primary"
    },
    {
      icon: RotateCcw,
      title: "Devoluciones fáciles",
      description: "Si no estás satisfecho, puedes devolverlo sin problemas en 30 días",
      color: "success"
    },
    {
      icon: Shield,
      title: "Garantía de calidad",
      description: "Te aseguramos productos de la mejor calidad y durabilidad comprobada",
      color: "info"
    }
  ];

  const aboutFeatures = [
    {
      icon: Award,
      title: "Calidad Premium",
      description: "Seleccionamos cuidadosamente cada modelo"
    },
    {
      icon: Users,
      title: "1000+ Clientes",
      description: "Satisfechos en todo el Perú"
    },
    {
      icon: Heart,
      title: "Pasión por el estilo",
      description: "Nos encanta lo que hacemos"
    }
  ];

  const handleBuyNow = () => {
    navigate('/products');  
  }

  const handleCartClick = () => {
    navigate('/carrito');
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div>
      {/* Navbar funcional */}
      <nav className="navbar navbar-expand-lg navbar-dark py-3">
        <div className="container-fluid">
          <a className="navbar-brand" href="#home" onClick={() => scrollToSection('home')}>
            SneakerPro
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="navbar-nav mx-auto">
              <a className="nav-link" href="#home" onClick={() => scrollToSection('home')}>Inicio</a>
              <a className="nav-link" href="#productos" onClick={() => navigate('/products')}>Productos</a>
              <a className="nav-link" href="#nosotros" onClick={() => scrollToSection('nosotros')}>Nosotros</a>
              <a className="nav-link" href="#testimonios" onClick={() => scrollToSection('testimonios')}>Testimonios</a>
              <a className="nav-link" href="#contactanos" onClick={() => scrollToSection('contactanos')}>Contáctanos</a>
            </div>
             
             <div className="user-profile-icon" onClick={() => navigate('/perfil')} style={{ cursor: 'pointer', marginRight: '20px' }}>
             <FaUser size={22} />
             <span className="ms-2">Perfil</span>
             </div> 

            <div className="cart-container" onClick={handleCartClick}>
              <FaShoppingCart size={22} />
              <span className="ms-2">Carrito</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero position-relative">
        <Slider {...settings}>
          <div className="carousel-item-custom position-relative">
            <img src={homesection1} className="d-block w-100" alt="Imagen 1" />
            <div className="carousel-caption-custom">
              <h1 className="hero-title">Da el primer paso hacia la comodidad y el estilo</h1>
              <p className="hero-subtitle">Descubre las mejores zapatillas del mercado</p>
              <button className="btn-hero" onClick={handleBuyNow}>
                Explorar Colección
              </button>
            </div>
          </div>
          <div className="carousel-item-custom">
            <img src={homesection2} className="d-block w-100" alt="Imagen 2" />
            <div className="carousel-caption-custom">
              <h1 className="hero-title">Estilo que te define</h1>
              <p className="hero-subtitle">Encuentra tu par perfecto</p>
              <button className="btn-hero" onClick={handleBuyNow}>
                Ver Ofertas
              </button>
            </div>
          </div>
          <div className="carousel-item-custom">
            <img src={homesection3} className="d-block w-100" alt="Imagen 3" />
            <div className="carousel-caption-custom">
              <h1 className="hero-title">Comodidad sin límites</h1>
              <p className="hero-subtitle">Calidad garantizada en cada paso</p>
              <button className="btn-hero" onClick={handleBuyNow}>
                Comprar Ahora
              </button>
            </div>
          </div>
        </Slider>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">
              ¿Por qué elegir <span className="gradient-text">SneakerPro?</span>
            </h2>
            <p className="section-subtitle">
              Ofrecemos la mejor experiencia de compra con beneficios exclusivos
            </p>
          </div>

          <div className="row g-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="col-md-4">
                  <div className={`benefit-card-new benefit-${benefit.color}`}>
                    <div className="benefit-icon-wrapper">
                      <Icon className="benefit-icon-new" strokeWidth={1.5} />
                    </div>
                    <h3 className="benefit-title-new">{benefit.title}</h3>
                    <p className="benefit-text-new">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="stats-row mt-5 pt-5">
            <div className="stat-item">
              <p className="stat-number">1000+</p>
              <p className="stat-label">Clientes Satisfechos</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">4.9★</p>
              <p className="stat-label">Calificación promedio</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">24/7</p>
              <p className="stat-label">Soporte disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="about-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="about-content">
                <h2 className="section-title mb-4">
                  Sobre <span className="gradient-text">Nosotros</span>
                </h2>
                <p className="about-text">
                  En <strong>SneakerPro</strong>, somos apasionados por el calzado deportivo y urbano. 
                  Desde hace 1 año, nos dedicamos a ofrecer las mejores zapatillas del mercado, 
                  combinando estilo, comodidad y calidad en cada par que vendemos.
                </p>
                <p className="about-text">
                  Nuestra misión es simple: hacer que cada cliente encuentre el calzado perfecto 
                  que se adapte a su estilo de vida, ya sea para entrenar, caminar por la ciudad 
                  o simplemente lucir increíble.
                </p>
                <p className="about-text">
                  Trabajamos con las mejores marcas y nos aseguramos de que cada producto cumpla 
                  con nuestros altos estándares de calidad. Tu satisfacción es nuestra prioridad.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-features">
                {aboutFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="about-feature-item">
                      <div className="about-feature-icon">
                        <Icon size={32} strokeWidth={1.5} />
                      </div>
                      <div className="about-feature-content">
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section id="testimonios" className="testimonials-section py-5">
        <div className="container">
          <h2 className="text-center section-title mb-5">
            Lo que dicen nuestros <span className="gradient-text">clientes</span>
          </h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">
                  Excelente calidad y servicio. ¡Mis zapatillas llegaron súper rápido y son muy cómodas!
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">JP</div>
                  <div>
                    <h6 className="author-name">Juan Pérez</h6>
                    <p className="author-role">Comprador frecuente</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">
                  Me encantó el diseño y la atención al cliente. Definitivamente volveré a comprar.
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">MG</div>
                  <div>
                    <h6 className="author-name">María Gómez</h6>
                    <p className="author-role">Cliente nueva</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">
                  El proceso de devolución fue muy fácil cuando necesitaba cambiar de talla. Gran experiencia.
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">CR</div>
                  <div>
                    <h6 className="author-name">Carlos Ruiz</h6>
                    <p className="author-role">Cliente satisfecho</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contactanos" className="contact-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">
              <span className="gradient-text">Contáctanos</span>
            </h2>
            <p className="section-subtitle">
              Estamos aquí para ayudarte. Escríbenos y te responderemos pronto
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="contact-card">
                <div className="contact-icon">
                  <FaMapMarkerAlt size={28} />
                </div>
                <h4>Ubicación</h4>
                <p>Av. La Marina 2355, San Miguel<br/>Lima, Perú</p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="contact-card">
                <div className="contact-icon">
                  <FaPhone size={28} />
                </div>
                <h4>Teléfono</h4>
                <p>+51 936000914<br/>Lun - Vie: 9am - 6pm</p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="contact-card">
                <div className="contact-icon">
                  <FaEnvelope size={28} />
                </div>
                <h4>Email</h4>
                <p>atencionalcliente@sneakerpro.com<br/>Respuesta en 24hrs</p>
              </div>
            </div>
          </div>

          <div className="social-media-section mt-5">
            <h3 className="text-center mb-4">Síguenos en redes sociales</h3>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
                <FaFacebookF size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                <FaInstagram size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter">
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h5 className="footer-title">SneakerPro</h5>
              <p className="footer-text">
                Tu tienda confiable para calzado deportivo y urbano. Calidad, estilo y comodidad en un solo lugar.
              </p>
            </div>

            <div className="col-md-4 mb-4">
              <h5 className="footer-title">Enlaces rápidos</h5>
              <ul className="footer-links">
                <li><a href="#home" onClick={() => scrollToSection('home')}>Inicio</a></li>
                <li><a href="#productos" onClick={() => navigate('/products')}>Productos</a></li>
                <li><a href="#nosotros" onClick={() => scrollToSection('nosotros')}>Nosotros</a></li>
                <li><a href="#contactanos" onClick={() => scrollToSection('contactanos')}>Contáctanos</a></li>
              </ul>
            </div>

            <div className="col-md-4 mb-4">
              <h5 className="footer-title">Contacto</h5>
              <ul className="footer-links">
                <li>Email: atencionalcliente@sneakerpro.com</li>
                <li>Tel: +51 936000914</li>
                <li>Horario: Lunes a Viernes, 9am - 6pm</li>
              </ul>
            </div>
          </div>

          <hr className="footer-divider" />
          <div className="text-center footer-copyright">
            &copy; {new Date().getFullYear()} SneakerPro. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;