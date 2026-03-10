// descargar-reporte-ia.js - VERSIÓN CON PDF
class DescargadorReporteIA {
    constructor() {
        this.contenidoIA = '';
        this.analisis = null;
        this.configGraficos = [];
        this.tablaFrecuencias = null;
        this.estadisticasPersonalizadas = [];
    }

    // Configurar datos para el reporte
    configurarDatos(contenidoIA, analisis, configGraficos, tablaFrecuencias, estadisticasPersonalizadas) {
        this.contenidoIA = contenidoIA || '';
        this.analisis = analisis || {};
        this.configGraficos = configGraficos || [];
        this.tablaFrecuencias = tablaFrecuencias || null;
        this.estadisticasPersonalizadas = estadisticasPersonalizadas || [];
    }

    // Generar contenido HTML completo del reporte (optimizado para PDF)
    generarContenidoHTML() {
        const fecha = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Análisis - EstadísticaMente</title>
    <style>
        /* ESTILOS OPTIMIZADOS PARA PDF */
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 15px;
            background-color: #fff;
            font-size: 12px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #C2185B;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .titulo-principal {
            color: #C2185B;
            font-size: 22px;
            margin: 8px 0;
        }
        
        .fecha {
            color: #666;
            font-size: 11px;
        }
        
        .seccion {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .titulo-seccion {
            color: #C2185B;
            font-size: 16px;
            border-bottom: 1px solid #F8BBD0;
            padding-bottom: 4px;
            margin-bottom: 12px;
        }
        
        .contenido-ia {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 3px solid #4361ee;
            font-size: 11px;
        }
        
        .resumen-estadistico {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 15px 0;
        }
        
        .tarjeta-estadistica {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            border-left: 3px solid #C2185B;
            text-align: center;
        }
        
        .valor-estadistica {
            font-size: 18px;
            font-weight: bold;
            color: #C2185B;
            margin-bottom: 3px;
        }
        
        .etiqueta-estadistica {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
        }
        
        .lista-graficos {
            margin: 12px 0;
        }
        
        .item-grafico {
            background: #f8f9fa;
            padding: 8px 12px;
            margin: 6px 0;
            border-radius: 4px;
            border-left: 2px solid #4361ee;
            font-size: 11px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 10px;
        }
        
        /* Estilos para tablas en el contenido de IA */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        /* Mejorar legibilidad en PDF */
        p, li {
            margin: 5px 0;
            font-size: 11px;
        }
        
        h1, h2, h3, h4 {
            margin: 8px 0;
        }
        
        /* Evitar cortes de página en medio de secciones */
        .seccion {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        
        /* Asegurar que las tablas no se corten */
        table {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="titulo-principal">Reporte de Análisis Estadístico</h1>
        <div class="fecha">Generado el ${fecha}</div>
    </div>

    ${this.generarSeccionResumen()}
    ${this.generarSeccionIA()}
    ${this.generarSeccionGraficos()}
    ${this.generarSeccionEstadisticas()}
    ${this.generarSeccionTablaFrecuencias()}

    <div class="footer">
        <p>Reporte generado automáticamente por EstadísticaMente - Plataforma de análisis estadístico educativo</p>
    </div>
</body>
</html>`;
    }

    // Las funciones de generación de secciones se mantienen igual que antes...
    generarSeccionResumen() {
        const totalGraficos = this.configGraficos.length;
        const totalVariables = this.analisis.estadisticas?.length || 0;
        const totalDatos = this.analisis.datos?.length || 0;

        return `
        <div class="seccion">
            <h2 class="titulo-seccion">📊 Resumen Ejecutivo</h2>
            <div class="resumen-estadistico">
                <div class="tarjeta-estadistica">
                    <div class="valor-estadistica">${totalGraficos}</div>
                    <div class="etiqueta-estadistica">Gráficos</div>
                </div>
                <div class="tarjeta-estadistica">
                    <div class="valor-estadistica">${totalVariables}</div>
                    <div class="etiqueta-estadistica">Variables</div>
                </div>
                <div class="tarjeta-estadistica">
                    <div class="valor-estadistica">${totalDatos}</div>
                    <div class="etiqueta-estadistica">Registros</div>
                </div>
                <div class="tarjeta-estadistica">
                    <div class="valor-estadistica">${this.estadisticasPersonalizadas.length}</div>
                    <div class="etiqueta-estadistica">Estadísticas</div>
                </div>
            </div>
        </div>`;
    }

    generarSeccionIA() {
        if (!this.contenidoIA) {
            return `
            <div class="seccion">
                <h2 class="titulo-seccion">🤖 Análisis de Inteligencia Artificial</h2>
                <p>No se generó análisis de IA para este reporte.</p>
            </div>`;
        }

        // Limpiar y formatear el contenido de IA para PDF
        const contenidoLimpio = this.limpiarContenidoIA(this.contenidoIA);
        
        return `
        <div class="seccion">
            <h2 class="titulo-seccion">🤖 Análisis de Inteligencia Artificial</h2>
            <div class="contenido-ia">
                ${contenidoLimpio}
            </div>
        </div>`;
    }

    generarSeccionGraficos() {
        if (!this.configGraficos || this.configGraficos.length === 0) {
            return `
            <div class="seccion">
                <h2 class="titulo-seccion">📈 Configuración de Gráficos</h2>
                <p>No se configuraron gráficos para este análisis.</p>
            </div>`;
        }

        const listaGraficos = this.configGraficos.map((grafico, index) => `
            <div class="item-grafico">
                <strong>Gráfico ${index + 1}:</strong> ${grafico.titulo}<br>
                <small>Tipo: ${this.obtenerNombreTipoGrafico(grafico.tipo)} | 
                       Eje X: ${grafico.campo} | 
                       ${grafico.campoValor ? `Eje Y: ${grafico.campoValor}` : 'Conteo automático'}
                </small>
            </div>
        `).join('');

        return `
        <div class="seccion">
            <h2 class="titulo-seccion">📈 Configuración de Gráficos</h2>
            <div class="lista-graficos">
                ${listaGraficos}
            </div>
        </div>`;
    }

    generarSeccionEstadisticas() {
        let contenido = '';

        // Estadísticas básicas
        if (this.analisis.estadisticas && this.analisis.estadisticas.length > 0) {
            contenido += `
            <h3>Estadísticas Descriptivas</h3>
            <div class="lista-graficos">
                ${this.analisis.estadisticas.map(est => `
                    <div class="item-grafico">
                        <strong>${est.campo}:</strong><br>
                        Media: ${est.promedio.toFixed(2)} | 
                        Mín: ${est.min} | 
                        Máx: ${est.max} | 
                        Desv: ${est.desviacion.toFixed(2)}
                    </div>
                `).join('')}
            </div>`;
        }

        // Estadísticas personalizadas
        if (this.estadisticasPersonalizadas.length > 0) {
            contenido += `
            <h3>Estadísticas Personalizadas</h3>
            <div class="lista-graficos">
                ${this.estadisticasPersonalizadas.map(est => `
                    <div class="item-grafico">
                        <strong>${est.nombre}</strong><br>
                        <small>Tipo: ${this.obtenerNombreEstadistica(est.tipo)} | Campo: ${est.campo}</small>
                    </div>
                `).join('')}
            </div>`;
        }

        if (!contenido) {
            contenido = '<p>No hay estadísticas disponibles para mostrar.</p>';
        }

        return `
        <div class="seccion">
            <h2 class="titulo-seccion">📊 Análisis Estadístico</h2>
            ${contenido}
        </div>`;
    }

    generarSeccionTablaFrecuencias() {
        if (!this.tablaFrecuencias) {
            return `
            <div class="seccion">
                <h2 class="titulo-seccion">📋 Tabla de Frecuencias</h2>
                <p>No se generó tabla de frecuencias para este análisis.</p>
            </div>`;
        }

        let contenido = `
        <p><strong>Tipo:</strong> ${this.tablaFrecuencias.tipo} | 
           <strong>Total de datos:</strong> ${this.tablaFrecuencias.total}</p>`;

        if (this.tablaFrecuencias.tipo === 'agrupada' && this.tablaFrecuencias.configuracion) {
            contenido += `
            <p><strong>Intervalos:</strong> ${this.tablaFrecuencias.configuracion.intervalos} | 
               <strong>Amplitud:</strong> ${this.tablaFrecuencias.configuracion.amplitud.toFixed(2)} | 
               <strong>Rango:</strong> ${this.tablaFrecuencias.configuracion.min} - ${this.tablaFrecuencias.configuracion.max}</p>`;
        }

        return `
        <div class="seccion">
            <h2 class="titulo-seccion">📋 Tabla de Frecuencias</h2>
            ${contenido}
        </div>`;
    }

    // Limpiar contenido de IA para PDF (remover estilos problemáticos)
    limpiarContenidoIA(contenido) {
        return contenido
            .replace(/style="[^"]*"/g, '') // Remover estilos inline
            .replace(/class="[^"]*"/g, '') // Remover clases
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remover estilos
            .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '') // Remover head
            .replace(/on\w+="[^"]*"/g, ''); // Remover eventos
    }

    // Helper para obtener nombre del tipo de gráfico
    obtenerNombreTipoGrafico(tipo) {
        const nombres = {
            'bar': 'Barras',
            'line': 'Líneas',
            'scatter': 'Dispersión',
            'pie': 'Circular',
            'doughnut': 'Dona',
            'area': 'Área',
            'bubble': 'Burbujas',
            'box': 'Cajas',
            'violin': 'Violín',
            'histogram': 'Histograma',
            'heatmap': 'Mapa de Calor'
        };
        return nombres[tipo] || tipo;
    }

    // Helper para obtener nombre de estadística
    obtenerNombreEstadistica(tipo) {
        const nombres = {
            'promedio': 'Promedio',
            'mediana': 'Mediana',
            'moda': 'Moda',
            'percentil': 'Percentil',
            'quartil': 'Quartil',
            'deciles': 'Deciles',
            'maximo': 'Máximo',
            'minimo': 'Mínimo',
            'varianza': 'Varianza',
            'desviacion': 'Desviación Estándar',
            'coeficiente': 'Coeficiente de Variación'
        };
        return nombres[tipo] || tipo;
    }

    // Método principal para descargar como PDF
    async descargarComoPDF() {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Generar el contenido HTML
                const contenidoHTML = this.generarContenidoHTML();
                
                // 2. Crear un elemento temporal para renderizar el HTML
                const elementoContenedor = document.createElement('div');
                elementoContenedor.style.position = 'absolute';
                elementoContenedor.style.left = '-9999px';
                elementoContenedor.style.top = '0';
                elementoContenedor.style.width = '210mm'; // Tamaño A4
                elementoContenedor.style.padding = '20px';
                elementoContenedor.style.background = 'white';
                elementoContenedor.innerHTML = contenidoHTML;
                
                document.body.appendChild(elementoContenedor);
                
                // 3. Esperar a que las imágenes se carguen
                await this.esperarImagenes(elementoContenedor);
                
                // 4. Convertir a PDF usando html2canvas y jsPDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Configuración para html2canvas
                const opciones = {
                    scale: 2, // Mejor calidad
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    width: elementoContenedor.scrollWidth,
                    height: elementoContenedor.scrollHeight,
                    windowWidth: elementoContenedor.scrollWidth,
                    windowHeight: elementoContenedor.scrollHeight
                };
                
                // Convertir a canvas
                const canvas = await html2canvas(elementoContenedor, opciones);
                
                // Obtener dimensiones
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 295; // A4 height in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let alturaRestante = imgHeight;
                let posicion = 0;
                
                // Agregar primera página
                pdf.addImage(canvas, 'PNG', 0, posicion, imgWidth, imgHeight, undefined, 'FAST');
                alturaRestante -= pageHeight;
                
                // Agregar páginas adicionales si es necesario
                while (alturaRestante >= 0) {
                    posicion = alturaRestante - imgHeight;
                    pdf.addPage();
                    pdf.addImage(canvas, 'PNG', 0, posicion, imgWidth, imgHeight, undefined, 'FAST');
                    alturaRestante -= pageHeight;
                }
                
                // 5. Limpiar y descargar
                document.body.removeChild(elementoContenedor);
                
                // 6. Descargar el PDF
                const nombreArchivo = `reporte-analisis-${new Date().toISOString().split('T')[0]}.pdf`;
                pdf.save(nombreArchivo);
                
                console.log('✅ PDF generado y descargado exitosamente');
                resolve(true);
                
            } catch (error) {
                console.error('❌ Error al generar PDF:', error);
                reject(error);
            }
        });
    }

    // Esperar a que las imágenes se carguen
    esperarImagenes(elemento) {
        const imagenes = elemento.getElementsByTagName('img');
        const promesas = [];
        
        for (let img of imagenes) {
            if (!img.complete) {
                const promesa = new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continuar incluso si hay error
                });
                promesas.push(promesa);
            }
        }
        
        return Promise.all(promesas);
    }

    // Método alternativo más simple (si el anterior falla)
    async descargarComoPDFSimple() {
        try {
            const contenidoHTML = this.generarContenidoHTML();
            
            // Crear ventana temporal
            const ventana = window.open('', '_blank');
            ventana.document.write(contenidoHTML);
            ventana.document.close();
            
            // Esperar a que se cargue el contenido
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Imprimir como PDF
            ventana.print();
            
            // Cerrar ventana después de un tiempo
            setTimeout(() => {
                ventana.close();
            }, 3000);
            
            return true;
            
        } catch (error) {
            console.error('Error en método simple:', error);
            return false;
        }
    }
}

// Instancia global del descargador
const descargadorReporteIA = new DescargadorReporteIA();

// Función global para descargar como PDF
async function descargarReporteCompleto() {
    // Obtener el contenido de IA del DOM
    const contenidoIAElement = document.getElementById('contenido-ia');
    const contenidoIA = contenidoIAElement ? contenidoIAElement.innerHTML : '';
    
    // Configurar datos del descargador
    descargadorReporteIA.configurarDatos(
        contenidoIA,
        window.analisisActual,
        window.configuracionGraficos,
        window.tablaFrecuenciasActual,
        window.estadisticasPersonalizadas
    );
    
    // Mostrar mensaje de progreso
    const boton = document.getElementById('btnDescargarTodo');
    const textoOriginal = boton.textContent;
    boton.textContent = '⏳ Generando PDF...';
    boton.disabled = true;
    
    try {
        // Intentar descargar como PDF
        const exito = await descargadorReporteIA.descargarComoPDF();
        
        if (exito) {
            mostrarMensaje('✅ PDF descargado exitosamente');
        } else {
            // Fallback: método simple
            mostrarMensaje('⚠️ Usando método alternativo...');
            await descargadorReporteIA.descargarComoPDFSimple();
        }
        
    } catch (error) {
        console.error('Error en descarga PDF:', error);
        mostrarMensaje('❌ Error al generar el PDF. Intenta nuevamente.');
    } finally {
        // Restaurar botón
        boton.textContent = textoOriginal;
        boton.disabled = false;
    }
}