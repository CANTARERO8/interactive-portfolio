---
name: anti-generic-design
description: >-
  Mandatory creative rules for anti-generic, editorial, cinematic, high-end motorsport
  web experiences. Enforces scene-based design, eliminates AI clichés (no generic cards,
  no generic icon lists, no purple gradients, no fake HUDs), one hero element per scene,
  and meaningful GSAP motion.
---

# DESIGN CONTEXT — CATÁLOGO WEB ANTI-GENÉRICO DE CASCOS MOTORSPORT

## 01. PROPÓSITO DEL PROYECTO

El objetivo de esta web es construir el **CATÁLOGO DIGITAL INTERACTIVO DE CASCOS DE ALTA GAMA MÁS AVANZADO DE NICARAGUA**, basado en la colección oficial del catálogo **LS2 Helmets 2025–2026**.

NO es una tienda genérica de Shopify ni un e-commerce barato con tarjetas cuadradas repetitivas.
NO es una landing page abstracta sin productos.

Es un **catálogo web editorial, cinematográfico y funcional** donde los motociclistas de Nicaragua pueden:
1. Explorar todos los modelos oficiales del catálogo organizados por disciplina de manejo.
2. Filtrar por materiales aeroespaciales (Carbono 9K, Carbono 6K, HPFC, KPA).
3. Inspeccionar especificaciones reales de fábrica: peso en gramos (± 50g), homologaciones (FIM, ECE 22.06, P/J), calotas EPS y acabados de pintura/gráficas.
4. Experimentar interacciones mecánicas reales (simulador de visores Irid® Dynamic, despiece anatómico y visor 360).
5. Cerrar la compra o prueba de talla directamente con el Showroom oficial en Managua por WhatsApp VIP.

Prioridad de diseño:
IDENTIDAD MOTORSPORT > CATÁLOGO EDITORIAL > EXPERIENCIA FÍSICA > CONVERSIÓN ASISTIDA LOCAL

---

## 02. ARQUITECTURA GENERAL DEL CATÁLOGO WEB

La web se estructura como un **Catálogo Interactivo de Alta Gama por Escenas y Módulos de Producto**:

```
[ 01. BARRA DE NAVEGACIÓN & FILTROS RÁPIDOS ]
     Logo LS2 Racing • Familias del Catálogo • Buscador de Modelos • Acceso Showroom Managua

[ 02. HERO FLAGSHIP SPOTLIGHT (EL REY DE LA VELOCIDAD) ]
     Exhibición monumental del casco insignia FF805 THUNDER GP PRO (Carbono 9K, MotoGP)
     con selector de libreas oficiales de fábrica (Matt Carbon, Polar, Raute) y telemetría de pista.

[ 03. MOTOR CENTRAL DEL CATÁLOGO (CATALOG GRID EDITORIAL) ]
     El corazón del sitio web: exploración fluida de todos los cascos del catálogo oficial:
     • FULL FACE / RACING: FF805 Thunder GP Pro, FF807 Dragon, FF811 Vector II Carbon...
     • MODULAR 180°: FF901 Advant-X Carbon, FF910 Advant II, FF906 Advant...
     • ADVENTURE & TRAIL: MX701 Explorer Carbon, MX702 Pioneer II...
     • OFF-ROAD & MOTOCROSS: MX703 X-Force Pro (9K Carbon), MX700 Subverter...
     • OPEN FACE / URBAN: OF601 Bob II Carbon, OF603 Infinity II...

[ 04. FICHA TÉCNICA EXPANDIBLE POR CASCO (QUICK SPEC DRAWER) ]
     Al hacer clic en cualquier casco del catálogo, se despliega su ficha de ingeniería:
     • Renders transparentes en alta resolución de varios ángulos.
     • Despiece de materiales: composición de calota, tallas de calota (XS-2XL), densidades de EPS.
     • Contenido de la caja oficial (What's in the Box: bolso de transporte, visor ahumado extra, Pinlock 120XLT).
     • Botón de cierre: "Cotizar en WhatsApp Managua" con el modelo y color pre-cargado.

[ 05. SIMULADOR DE VISORES & ÓPTICA (VISOR LAB) ]
     Catálogo interactivo de visores oficiales:
     • LS2 Irid® Dynamic (transición fotosensible mecánica en 0.09 segundos sin baterías).
     • Visores de competición: Iridium Gold, Iridium Blue, Dark Tinted, Clear Max Vision.

[ 06. ECOSISTEMA TECNOLÓGICO: INTERCOMUNICADORES & ACCESORIOS ]
     • Intercomunicador oficial LS2 Spectrum (co-desarrollado con Midland y bocinas RCF 40mm).
     • Gafas de motocross Aura Pro con lentes Iridium y Pinlock.

[ 07. GUÍA ANTROPOMÉTRICA DE TALLAS (FITMENT GUIDE) ]
     Calibrador interactivo en centímetros (53 a 64 cm) para que el cliente conozca su talla
     exacta antes de pedir el casco a Managua.

[ 08. SHOWROOM FÍSICO MANAGUA, BANCOS & ASESORÍA VIP ]
     Ubicación física en Carretera a Masaya, horarios, financiamiento Tasa Cero (BAC Credomatic / Banpro)
     y botón de contacto VIP con asesores de pista.
```

---

## 03. REGLAS ANTI-GENÉRICAS APLICADAS AL CATÁLOGO

1. **NO a las tarjetas de e-commerce genéricas:**
   - En lugar de tarjetas cuadradas baratas con bordes grises y botones de "Comprar ahora" de tienda de ropa, cada casco se presenta como una **pieza de ingeniería automotriz**:
     * Fotografía de producto transparente de fábrica sin fondo blanco.
     * Tipografía monumental para el nombre del modelo (`FF805 THUNDER GP PRO`).
     * Datos físicos visibles de inmediato: masa en balanza (`1280 ± 50G`), homologación de circuito (`FIM / ECE 22.06`), y tejido de calota (`CARBONO 9K`).
     * Selector interactivo de colores/gráficas reales del catálogo.

2. **Cero iconos como sustitutos de diseño:**
   - La información de seguridad y materiales se comunica con tipografía clara y datos numéricos, no con listas de iconos genéricos.

3. **Paleta Motorsport de Alto Contraste:**
   - Fondos: Negro obsidiana profundo (`#040506`), grafito técnico (`#0D0E10`) y superficies de carbono oscuro.
   - Acentos: *Racing Crimson* (`#FF2A3B`), *Iridium Gold* (`#FFDF00`), y titanio satinado.
   - Prohibido terminantemente: gradientes morados/azules de startup, neones de videojuego o cianes artificiales.

4. **Conversión Local Nicaragüense Asistida:**
   - Cada producto del catálogo tiene un botón directo que abre un mensaje de WhatsApp estructurado con la información exacta del casco:
     *"Hola, estoy viendo en el catálogo oficial el casco [Nombre] en acabado [Color], me interesa confirmar talla [Talla] y consultar planes de pago Tasa Cero BAC / Banpro en Managua."*

---

## 04. DATOS Y MODELOS DEL CATÁLOGO 2025–2026 A MOSTRAR

| Familia | Modelo Estrella | Material | Peso | Homologación | PVP Ref. |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Racing** | FF805 Thunder GP Pro | 9K Carbon | 1280g | FIM Racing & ECE 22.06 | $850 USD (799 €) |
| **Racing** | FF807 Dragon | 6K Carbon | 1450g | ECE 22.06 | $499 USD (479 €) |
| **Racing** | FF811 Vector II Carbon | 6K Carbon | 1300g | ECE 22.06 | $399 USD (379 €) |
| **Modular** | FF901 Advant-X Carbon | 6K Carbon | 1550g | Dual P/J & ECE 22.06 | $510 USD (469 €) |
| **Modular** | FF910 Advant II | KPA + Carbon | 1800g | Dual P/J & ECE 22.06 | $369 USD (339 €) |
| **Adventure** | MX701 Explorer Carbon | 6K Carbon | 1450g | ECE 22.06 Trail | $465 USD (429 €) |
| **Off-Road** | MX703 X-Force Pro | 9K Carbon | 1200g | FIM Racing & ECE 22.06 | $435 USD (399 €) |
| **Open Face** | OF601 Bob II Carbon | 6K Carbon | 900g | ECE 22.06 | $349 USD (329 €) |
| **Tech** | LS2 Spectrum Intercom | RCF Audio | 85g | Bluetooth 5.1 / IPX6 | $175 USD (159 €) |
| **Tech** | LS2 Irid® Dynamic Visor | Mecánico 0.09s | 20g | ECE 22.06 / UV400 | $355 USD (329 €) |
| **Goggles** | Aura Pro Goggles | Triple Espuma | N/A | EN1938:2010 | $95 USD (89 €) |
