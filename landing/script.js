/**
 * DULCE & ORDEN — script.js
 * Funcionalidades:
 *  1. Navbar: efecto scroll + menú hamburguesa móvil
 *  2. Animaciones de entrada con IntersectionObserver
 *  3. CTA preparado para conectar con Google Forms
 */

/* ========================
   1. NAVBAR — SCROLL & HAMBURGUESA
======================== */

const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

/**
 * Agrega la clase "scrolled" al navbar cuando el usuario
 * hace scroll hacia abajo (añade sombra y borde).
 */
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/**
 * Alterna el menú hamburguesa en móvil.
 * Al hacer clic en el botón, se muestran u ocultan los links.
 */
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

/**
 * Cierra el menú hamburguesa al hacer clic en cualquier link.
 * Mejora la experiencia en móvil para navegación de una sola página.
 */
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});


/* ========================
   2. ANIMACIONES DE ENTRADA (IntersectionObserver)
======================== */

/**
 * IntersectionObserver detecta cuando un elemento entra
 * en el viewport y le añade la clase "visible" que activa
 * la animación CSS definida en style.css.
 *
 * Elementos observados: todos los que tengan [data-reveal]
 * más los elementos de flujo y beneficios con transición.
 */

// Configuración: el elemento se activa cuando el 15% es visible
const observerOptions = {
  root: null,       // viewport del navegador
  rootMargin: '0px',
  threshold: 0.15
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Delay escalonado para tarjetas en cuadrícula (efecto cascada)
      const delay = entry.target.dataset.delay || 0;

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      // Dejar de observar el elemento una vez animado
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

/**
 * Selecciona y observa todos los elementos animables.
 * Se les asigna un delay escalonado dentro de su grupo padre.
 */
function initRevealAnimations() {
  // Tarjetas de problema
  const problemCards = document.querySelectorAll('.problema-card');
  problemCards.forEach((card, i) => {
    card.dataset.delay = i * 100; // 0ms, 100ms, 200ms, 300ms
    revealObserver.observe(card);
  });

  // Pasos del flujo de solución
  const flujoSteps = document.querySelectorAll('.flujo-paso');
  flujoSteps.forEach((step, i) => {
    step.dataset.delay = i * 120;
    revealObserver.observe(step);
  });

  // Tarjetas de beneficios
  const benefitCards = document.querySelectorAll('.beneficio-card');
  benefitCards.forEach((card, i) => {
    card.dataset.delay = i * 100;
    revealObserver.observe(card);
  });
}

// Iniciar animaciones al cargar la página
initRevealAnimations();


/* ========================
   3. CTA — CONEXIÓN CON GOOGLE FORMS
======================== */

/**
 * El CTA del hero y el CTA final están preparados para
 * conectarse con un Google Forms cuando esté disponible.
 *
 * INSTRUCCIONES PARA ACTIVAR:
 *  1. Crea tu Google Form en forms.google.com
 *  2. Obtén el link para compartir del formulario
 *  3. Pega el link en la variable GOOGLE_FORM_URL abajo
 *  4. Los botones se actualizarán automáticamente
 *
 * Mientras el link esté vacío, el botón mostrará una
 * alerta informativa en lugar de abrir el formulario.
 */

// ← Pega aquí el link de tu Google Form cuando esté listo
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScoE0Q864YQ2bS9WHnH7K54mwuSX3ss5A7s_9MB9ZSVHa8dDQ/viewform?usp=sharing&ouid=114584054455936335010';

/**
 * Configura los botones CTA con el link del formulario.
 * Si el link está vacío, muestra un mensaje de "próximamente".
 */
function setupCTAButtons() {
  const heroCTA  = document.getElementById('hero-cta');
  const finalCTA = document.getElementById('final-cta');

  // Función reutilizable para manejar el clic de un CTA
  function handleCTAClick(event) {
    if (!GOOGLE_FORM_URL) {
      // Si aún no hay link de formulario, prevenir navegación
      event.preventDefault();
      showFormNotice();
    } else {
      // Si hay link, actualizar el href para que abra el formulario
      this.setAttribute('href', GOOGLE_FORM_URL);
    }
  }

  if (heroCTA)  heroCTA.addEventListener('click', handleCTAClick);
  if (finalCTA) finalCTA.addEventListener('click', handleCTAClick);
}

/**
 * Muestra una notificación tipo toast cuando el formulario
 * aún no está disponible (link vacío).
 */
function showFormNotice() {
  // Evitar múltiples toasts al mismo tiempo
  if (document.getElementById('toast-notice')) return;

  const toast = document.createElement('div');
  toast.id = 'toast-notice';
  toast.textContent = '🚧 Formulario próximamente disponible';

  // Estilos inline para el toast (no requiere CSS adicional)
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '2rem',
    left:         '50%',
    transform:    'translateX(-50%)',
    background:   '#2C1A0E',
    color:        '#F5EDD9',
    padding:      '0.8rem 1.5rem',
    borderRadius: '999px',
    fontSize:     '0.9rem',
    fontFamily:   "'DM Sans', sans-serif",
    boxShadow:    '0 8px 24px rgba(0,0,0,0.2)',
    zIndex:       '9999',
    opacity:      '0',
    transition:   'opacity 0.3s ease',
  });

  document.body.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // Auto-remover después de 3 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// Iniciar configuración de CTAs
setupCTAButtons();


/* ========================
   4. SCROLL SUAVE PARA NAVEGACIÓN INTERNA
======================== */

/**
 * Mejora el scroll hacia secciones internas considerando
 * el alto del navbar fijo (68px) para que el título no
 * quede oculto detrás de la barra de navegación.
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');

    // Ignorar links que solo tienen "#" (sin sección destino)
    if (targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const navbarHeight = navbar.offsetHeight;
    const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  });
});