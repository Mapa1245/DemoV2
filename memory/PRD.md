# PRD - EstadísticaMente CSS Refactor

## Problema Original
Usuario necesitaba unificar los estilos de un proyecto grande (EstadísticaMente) sin romper la interfaz ni la lógica existente. Los estilos estaban desordenados e inconsistentes.

## Objetivos
- Detectar estilos duplicados, inconsistentes o mal organizados
- Proponer una estructura de estilos más limpia y mantenible
- Refactorizar de manera gradual y segura
- Evitar cambios que afecten funcionalidad, layout o comportamiento existente

## Arquitectura de Estilos

### Antes (Caótico)
```
/app/
├── styles.css (1827 líneas - MONOLÍTICO)
├── index.html (70 líneas CSS inline)
├── login.html (160 líneas CSS inline)
├── nivelinicial.html (700+ líneas CSS inline)
├── integracion-dashboard.html (1200+ líneas CSS inline)
├── juegos.html (170 líneas CSS inline)
```

### Después (Organizado)
```
/app/css/
├── variables.css      (286 líneas)  - Tokens de diseño
├── base.css           (598 líneas)  - Reset y utilidades
├── main.css           (58 líneas)   - Importador principal
├── components/
│   ├── buttons.css    (737 líneas)
│   ├── cards.css      (478 líneas)
│   ├── forms.css      (498 líneas)
│   ├── chatbot.css    (463 líneas)
│   ├── tables.css     (360 líneas)
│   └── modals.css     (399 líneas)
└── pages/
    ├── home.css       (178 líneas)
    ├── login.css      (125 líneas)
    ├── juegos.css     (73 líneas)
    └── dashboard.css  (749 líneas)

TOTAL: ~5,002 líneas de CSS organizado
```

## Fases Completadas

### Fase 1: Variables CSS ✅
- Creado `/app/css/variables.css` con 200+ tokens de diseño
- Colores, tipografías, espaciados, sombras, transiciones
- Prefijo `--em-` para todas las variables

### Fase 2: Estilos Base ✅
- Creado `/app/css/base.css` con reset, tipografía, utilidades
- Clases utilitarias con prefijo `.em-`

### Fase 3: Componentes ✅
- buttons.css: Sistema completo de botones
- cards.css: Cards y contenedores
- forms.css: Inputs, textareas, selects
- chatbot.css: Chat Profe Marce
- tables.css: Tablas de frecuencia
- modals.css: Modales y overlays

### Fase 4: Páginas ✅
- home.css: Página principal
- login.css: Página de login
- juegos.css: Actividades interactivas
- dashboard.css: Dashboard de análisis

### Fase 5: Limpieza ✅
- Eliminados ~1,480 líneas de CSS inline de HTMLs
- Mantenidas variables de compatibilidad para JS

## Tokens de Diseño

### Colores Principales
- `--em-primary`: #C2185B (Rosa)
- `--em-primary-dark`: #A0154B
- `--em-primary-light`: #F8BBD0
- `--em-accent`: #4361ee (Azul)

### Fuentes
- `--em-font-display`: Patrick Hand (títulos)
- `--em-font-heading`: Comic Neue (subtítulos)
- `--em-font-body`: Open Sans (texto)

### Espaciado (escala de 4px)
- `--em-space-1`: 4px
- `--em-space-2`: 8px
- `--em-space-4`: 16px
- `--em-space-6`: 24px
- `--em-space-8`: 32px

## Backlog / Mejoras Futuras

### P0 (Crítico)
- N/A - Sistema funcionando

### P1 (Alta)
- Consolidar media queries en styles.css
- Eliminar más !important innecesarios

### P2 (Media)
- Migrar clases existentes a nuevas clases .em-*
- Crear layouts.css (header, footer, grid)
- Documentar componentes con ejemplos

### P3 (Baja)
- Añadir modo oscuro
- Crear animaciones adicionales
- Optimizar para performance

## Notas Técnicas
- El archivo styles.css original se mantiene como fallback
- Las clases antiguas (.level-btn, .back-btn, etc.) siguen funcionando
- Los nuevos estilos usan prefijo .em- para evitar conflictos
- Variables CSS permiten cambios globales fáciles
