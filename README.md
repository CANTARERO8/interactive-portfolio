<div align="center">

  # ⚡ Interactive Portfolio

  <p align="center">
    <strong>Portafolio Web Inmersivo 3D // Desarrollador Fullstack & Ingeniero de Sistemas</strong>
  </p>

  <p align="center">
    <a href="https://vitejs.dev/" target="_blank">
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    </a>
    <a href="https://threejs.org/" target="_blank">
      <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
    </a>
    <a href="https://greensock.com/gsap/" target="_blank">
      <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
    </a>
    <a href="https://lenis.darkroom.engineering/" target="_blank">
      <img src="https://img.shields.io/badge/Lenis_Scroll-000000?style=for-the-badge&logo=scroll&logoColor=white" alt="Lenis" />
    </a>
    <a href="https://developer.mozilla.org/es/docs/Web/JavaScript" target="_blank">
      <img src="https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Status-Active_&_Maintained-00f2fe?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/License-MIT-a855f7?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
    <img src="https://img.shields.io/badge/Responsive-100%25-blueviolet?style=flat-square" alt="Responsive" />
  </p>

  ---

  <p align="center">
    <i>Una experiencia digital inmersiva de alto rendimiento que fusiona gráficos 3D en tiempo real (WebGL), micro-interacciones fluidas y arquitectura de software de nivel empresarial.</i>
  </p>

</div>

<br />

## 🌟 Visión General

Este repositorio alberga el **Interactive Portfolio** de **Eduardo Cordova**. Diseñado desde cero para romper los esquemas convencionales de la web estática, combinando:

- 🎮 **Renderizado 3D en Tiempo Real**: Escenas WebGL alimentadas por Three.js y shaders personalizados.
- ⚡ **Animaciones Cinemáticas**: Orquestación milimétrica con GSAP y ScrollTrigger.
- 🌊 **Smooth Scrolling**: Desplazamiento ultra suave desacoplado mediante Lenis.
- 🌐 **Soporte Multiidioma (i18n)**: Conmutación dinámica e instantánea entre Español e Inglés.
- 🏛️ **Showcase Tecnológico Detallado**: Módulos especializados para Vue, Laravel, PostgreSQL, WordPress y Proyectos Fullstack.

---

## 🚀 Tecnologías y Herramientas

| Categoría | Tecnologías |
| :--- | :--- |
| **Core & Tooling** | `Vite 8`, `JavaScript (ES6+)`, `HTML5 Semántico`, `CSS3 Moderno` |
| **3D & Shaders** | `Three.js`, `WebGL Canvas`, `Custom Particle Systems` |
| **Animación & Motion** | `GSAP 3`, `ScrollTrigger`, `Custom Cursor Physics` |
| **Experiencia de Usuario** | `Lenis Smooth Scroll`, `i18n Engine`, `Cinematic Terminal Loader` |
| **Especialidades Destacadas** | `Vue.js`, `Laravel`, `PostgreSQL`, `WordPress / Headless`, `REST APIs` |

---

## ✨ Características Destacadas

```
├── 🔮 Monolito 3D & Efectos de Partículas
│   └── Entorno WebGL reactivo al cursor y al scroll de usuario.
│
├── ⏳ Loader Cinemático con Métricas de Sistema
│   └── Secuencia de inicio estilo terminal con feedback de carga en tiempo real.
│
├── 🧭 Navegación Inteligente & Menú Interactivo
│   └── Header flotante con blur dinámico, tracking de secciones activas y audio effects.
│
├── 🌐 Internacionalización (ES / EN)
│   └── Motor de traducción integrado para alcance global sin recargas de página.
│
├── 🛠️ Módulos de Especialidad en Profundidad
│   ├── Núcleo Frontend (Vue / SPA / State Management)
│   ├── Núcleo Backend (Laravel / Arquitectura Limpia / Microservicios)
│   ├── Arquitectura de Datos (PostgreSQL / Modelado Relacional / Índices)
│   └── Ecosistema CMS (WordPress Avanzado / Custom Plugins / ACF)
│
└── 📱 100% Adaptable y Optimizado
    └── Experiencia fluida garantizada en móviles, tablets y monitores ultrawide.
```

---

## 📂 Estructura del Proyecto

```bash
interactive-portfolio/
├── public/                 # Recursos estáticos (imágenes, iconos, audios)
├── src/
│   ├── animations/         # Timelines y controladores GSAP / ScrollTrigger
│   ├── assets/             # Estilos modulares, SVGs y media interna
│   ├── core/               # Motores de inicialización, loader, cursor y utilidades
│   ├── data/
│   │   ├── projects.js     # Colección de proyectos y detalles técnicos
│   │   └── translations.js # Diccionario i18n (Español / Inglés)
│   ├── styles/             # Hojas de estilo organizadas (reset, layout, components)
│   ├── three/              # Escenas, cámaras, luces, mallas y partículas Three.js
│   └── main.js             # Punto de entrada principal de la aplicación
├── index.html              # Estructura semántica principal y marcado SEO
├── package.json            # Scripts y dependencias del ecosistema
└── vite.config.js          # Configuración del entorno de desarrollo y compilación
```

---

## 🛠️ Instalación y Ejecución Local

Sigue estos sencillos pasos para clonar y levantar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/CANTARERO8/interactive-portfolio.git
cd interactive-portfolio
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
> La aplicación estará disponible en `http://localhost:5188/` (o el puerto asignado por Vite).

### 4. Compilar para producción
```bash
npm run build
```
> Genera el bundle optimizado y minificado en la carpeta `/dist`.

### 5. Previsualizar la versión de producción
```bash
npm run preview
```

---

## 👨‍💻 Acerca de Eduardo Cordova

Desarrollador Fullstack apasionado por la convergencia entre la ingeniería de software de alto impacto y el diseño interactivo de vanguardia.

- 💼 **LinkedIn**: [Eduardo Cordova](https://www.linkedin.com/)
- 🐙 **GitHub**: [@CANTARERO8](https://github.com/CANTARERO8)
- ✉️ **Contacto**: [Enviar Correo](mailto:cantarero.eduardo@gmail.com)

---

<div align="center">
  <sub>Diseñado y programado con pasión por Eduardo Cordova. © 2026. Todos los derechos reservados.</sub>
</div>
