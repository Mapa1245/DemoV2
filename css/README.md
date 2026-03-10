# Guía de Uso - Variables CSS

## Cómo usar las nuevas variables

Las variables CSS están ahora disponibles en todo el proyecto. Para usarlas, simplemente reemplaza los valores hardcodeados por las variables.

### Colores

```css
/* ANTES */
.mi-elemento {
    background-color: #C2185B;
    color: #666666;
}

/* DESPUÉS */
.mi-elemento {
    background-color: var(--em-primary);
    color: var(--em-text-secondary);
}
```

### Tabla de Referencia Rápida

| Valor Antiguo | Variable Nueva |
|---------------|----------------|
| `#C2185B` | `var(--em-primary)` |
| `#A0154B` | `var(--em-primary-dark)` |
| `#F8BBD0` | `var(--em-primary-light)` |
| `#4361ee` | `var(--em-accent)` |
| `#3a56d4` | `var(--em-accent-dark)` |
| `#28a745` | `var(--em-success)` |
| `#dc3545` | `var(--em-danger)` |
| `#ffc107` | `var(--em-warning)` |
| `#333` o `#333333` | `var(--em-text-primary)` |
| `#666` o `#666666` | `var(--em-text-secondary)` |
| `#f8f9fa` | `var(--em-gray-50)` |
| `white` | `var(--em-white)` |

### Tipografía

```css
/* ANTES */
font-family: 'Patrick Hand', cursive;
font-family: 'Comic Neue', cursive;
font-family: 'Open Sans', sans-serif;

/* DESPUÉS */
font-family: var(--em-font-display);   /* Patrick Hand - títulos grandes */
font-family: var(--em-font-heading);   /* Comic Neue - subtítulos/botones */
font-family: var(--em-font-body);      /* Open Sans - texto general */
```

### Espaciado

```css
/* ANTES */
padding: 8px;
margin: 16px;
gap: 24px;

/* DESPUÉS */
padding: var(--em-space-2);   /* 8px */
margin: var(--em-space-4);    /* 16px */
gap: var(--em-space-6);       /* 24px */
```

### Escala de espaciado

| Variable | Valor |
|----------|-------|
| `--em-space-1` | 4px |
| `--em-space-2` | 8px |
| `--em-space-3` | 12px |
| `--em-space-4` | 16px |
| `--em-space-5` | 20px |
| `--em-space-6` | 24px |
| `--em-space-8` | 32px |
| `--em-space-10` | 40px |
| `--em-space-12` | 48px |

### Border Radius

```css
/* ANTES */
border-radius: 8px;
border-radius: 12px;
border-radius: 50%;

/* DESPUÉS */
border-radius: var(--em-radius-md);    /* 8px */
border-radius: var(--em-radius-lg);    /* 12px */
border-radius: var(--em-radius-circle); /* 50% */
```

### Sombras

```css
/* ANTES */
box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
box-shadow: 0 4px 15px rgba(194, 24, 91, 0.3);

/* DESPUÉS */
box-shadow: var(--em-shadow-md);
box-shadow: var(--em-shadow-primary);
```

### Transiciones

```css
/* ANTES */
transition: all 0.3s ease;
transition: background-color 0.3s ease;

/* DESPUÉS */
transition: var(--em-transition-all);
transition: var(--em-transition-colors);
```

---

## Clases Utilitarias Disponibles

También hay clases utilitarias listas para usar:

```html
<!-- Colores de fondo -->
<div class="em-bg-primary">Fondo rosa primario</div>
<div class="em-bg-accent">Fondo azul accent</div>
<div class="em-bg-success">Fondo verde éxito</div>

<!-- Colores de texto -->
<p class="em-text-primary">Texto rosa</p>
<p class="em-text-muted">Texto gris suave</p>

<!-- Sombras -->
<div class="em-shadow-md">Sombra mediana</div>
<div class="em-shadow-primary">Sombra rosa</div>

<!-- Bordes redondeados -->
<div class="em-rounded-lg">Bordes redondeados grandes</div>
```

---

## Proceso de Migración Segura

1. **Identifica** un componente o sección para migrar
2. **Busca** los valores hardcodeados en el CSS
3. **Reemplaza** por las variables correspondientes
4. **Prueba** en el navegador
5. **Si funciona**, haz commit. Si no, revierte.

### Ejemplo práctico

```css
/* styles.css - Línea X */

/* ANTES */
.level-btn {
    padding: 1.5rem 1rem;
    border-radius: 15px;
    font-family: 'Comic Neue', cursive;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #333;
}

.level-btn.primary {
    background-color: #C2185B;
    color: white;
}

/* DESPUÉS */
.level-btn {
    padding: var(--em-space-6) var(--em-space-4);
    border-radius: var(--em-radius-lg);
    font-family: var(--em-font-heading);
    box-shadow: var(--em-shadow-sm);
    color: var(--em-text-primary);
}

.level-btn.primary {
    background-color: var(--em-primary);
    color: var(--em-white);
}
```

---

## Archivos Modificados en Fase 1

- `/app/css/variables.css` - **NUEVO** - Todas las variables
- `/app/css/main.css` - **NUEVO** - Importador principal
- `/app/index.html` - Agregado link a variables.css
- `/app/login.html` - Agregado link a variables.css
- `/app/nivelinicial.html` - Agregado link a variables.css
- `/app/juegos.html` - Agregado link a variables.css
- `/app/material.html` - Agregado link a variables.css
- `/app/materials.html` - Agregado link a variables.css
- `/app/integracion-dashboard.html` - Mapeado variables locales al sistema global
