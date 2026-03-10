// generador-pdf.js - Generador de reportes PDF completos
class GeneradorPDF {
    constructor() {
        this.doc = null;
        this.margins = { top: 20, right: 20, bottom: 20, left: 20 };
        this.pageWidth = 210; // A4 en mm
        this.pageHeight = 297; // A4 en mm
        this.analisisActual = null; // ← AGREGAR ESTA LÍNEA
    }

    // Método principal para exportar todo el dashboard a PDF
    async exportarAPDFCompletoDesdeAnalisis(analisis, graficosComoImagenes = []) {
        try {
            // Guardar el análisis actual para usarlo en los métodos internos
            this.analisisActual = analisis;
            
            // Inicializar jsPDF
            const { jsPDF } = window.jspdf;
            this.doc = new jsPDF();
            
            // Configuración inicial
            this.configurarDocumento();
            
            // Página 1: Portada
            await this.generarPortada(analisis);
            
            // Página 2: Resumen Ejecutivo
            this.doc.addPage();
            await this.generarResumenEjecutivo(analisis);
            
            // Página 3: Vista Previa de Datos
            this.doc.addPage();
            await this.generarVistaPreviaDatos();
            
            // Página 4+: Gráficos
            await this.generarSeccionGraficos(graficosComoImagenes);
            
            // Página: Tabla de Frecuencias
            this.doc.addPage();
            await this.generarTablaFrecuencias();
            
            // Página: Resumen Estadístico
            this.doc.addPage();
            await this.generarResumenEstadistico();
            
            // Página: Análisis IA
            this.doc.addPage();
            await this.generarAnalisisIA(analisis);
            
            // Página: Conclusiones
            this.doc.addPage();
            await this.generarConclusiones(analisis);
            
            // Guardar el PDF
            const nombreArchivo = this.generarNombreArchivo();
            this.doc.save(nombreArchivo);
            
            return {
                exito: true,
                mensaje: 'PDF generado correctamente',
                nombreArchivo: nombreArchivo
            };
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            return {
                exito: false,
                mensaje: 'Error al generar PDF: ' + error.message
            };
        }
    }

    configurarDocumento() {
        // Configurar fuentes y estilos base
        this.doc.setFont('helvetica');
        this.doc.setFontSize(10);
    }

    async generarPortada(analisis) {
        const centerX = this.pageWidth / 2;
        
        // Logo (si está disponible)
        try {
            const logo = await this.cargarImagenBase64('Sin título (4).png');
            if (logo) {
                this.doc.addImage(logo, 'PNG', centerX - 25, 40, 50, 50);
            }
        } catch (e) {
            console.log('Logo no disponible, continuando sin él');
        }
        
        // Título principal
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(194, 24, 91); // Color primario de EstadísticaMente
        this.doc.text('REPORTE ESTADÍSTICO', centerX, 110, { align: 'center' });
        
        // Subtítulo
        this.doc.setFontSize(16);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Dashboard Analítico - EstadísticaMente', centerX, 125, { align: 'center' });
        
        // Línea decorativa
        this.doc.setDrawColor(194, 24, 91);
        this.doc.setLineWidth(0.5);
        this.doc.line(centerX - 40, 135, centerX + 40, 135);
        
        // Información del reporte
        this.doc.setFontSize(12);
        this.doc.setTextColor(80, 80, 80);
        this.doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, centerX, 155, { align: 'center' });
        this.doc.text(`Hora: ${new Date().toLocaleTimeString()}`, centerX, 165, { align: 'center' });
        
        // Resumen de datos
        if (analisis.datos) {
            const datos = analisis.datos;
            this.doc.text(`Total de registros: ${datos.length}`, centerX, 180, { align: 'center' });
            this.doc.text(`Variables analizadas: ${Object.keys(datos[0] || {}).length}`, centerX, 190, { align: 'center' });
        }
        
        // Footer
        this.doc.setFontSize(10);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text('Generado automáticamente por EstadísticaMente Dashboard', centerX, 280, { align: 'center' });
    }

    async generarResumenEjecutivo(analisis) {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(194, 24, 91);
        this.doc.text('RESUMEN EJECUTIVO', 20, 30);
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        
        // Insights principales
        if (analisis.insights && analisis.insights.length > 0) {
            const insights = analisis.insights.slice(0, 5); // Máximo 5 insights
            let yPos = 50;
            
            insights.forEach((insight, index) => {
                if (yPos > 250) {
                    this.doc.addPage();
                    yPos = 30;
                }
                
                // Icono según tipo de insight
                const icono = this.obtenerIconoInsight(insight.tipo);
                
                this.doc.setFont('helvetica', 'bold');
                this.doc.setTextColor(67, 97, 238); // Azul acento
                this.doc.text(`${icono} ${insight.titulo}`, 25, yPos);
                
                this.doc.setFont('helvetica', 'normal');
                this.doc.setTextColor(80, 80, 80);
                const descripcion = this.doc.splitTextToSize(insight.descripcion, 170);
                this.doc.text(descripcion, 25, yPos + 7);
                
                yPos += 7 + (descripcion.length * 5) + 5;
            });
        }
        
        // Métricas clave
        this.agregarMetricasClave(analisis);
    }

    async generarVistaPreviaDatos() {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(194, 24, 91);
        this.doc.text('VISTA PREVIA DE DATOS', 20, 30);
        
        // CORRECCIÓN: Usar los datos del análisis en lugar de variables globales
        let datosParaMostrar = this.obtenerDatosSeguros();
        
        if (!datosParaMostrar || datosParaMostrar.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text('No hay datos disponibles para mostrar', 20, 50);
            return;
        }
        
        // Información general
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        this.doc.text(`Total de registros: ${datosParaMostrar.length}`, 20, 50);
        
        // Mostrar información de filtros si está disponible
        if (window.datosFiltrados && window.datosOriginales) {
            this.doc.text(`Registros filtrados: ${window.datosFiltrados.length}`, 20, 60);
            this.doc.text(`Variables: ${Object.keys(datosParaMostrar[0]).length}`, 20, 70);
        } else {
            this.doc.text(`Variables: ${Object.keys(datosParaMostrar[0]).length}`, 20, 60);
        }
        
        // Tabla de datos (primeras 10 filas)
        const campos = Object.keys(datosParaMostrar[0]);
        const datosTabla = datosParaMostrar.slice(0, 10).map(fila => {
            return campos.map(campo => String(fila[campo] || ''));
        });
        
        // Encabezados de la tabla
        this.doc.autoTable({
            startY: 85,
            head: [campos],
            body: datosTabla,
            theme: 'grid',
            headStyles: {
                fillColor: [194, 24, 91],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            margin: { left: 20, right: 20 }
        });
        
        // Nota al pie
        this.doc.setFontSize(10);
        this.doc.setTextColor(150, 150, 150);
        const finalY = this.doc.lastAutoTable.finalY + 10;
        this.doc.text(`Mostrando ${Math.min(10, datosParaMostrar.length)} de ${datosParaMostrar.length} registros`, 20, finalY);
    }

    async generarSeccionGraficos(graficosComoImagenes) {
        if (!graficosComoImagenes || graficosComoImagenes.length === 0) {
            this.doc.addPage();
            this.doc.setFontSize(16);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setTextColor(194, 24, 91);
            this.doc.text('GRÁFICOS Y VISUALIZACIONES', 20, 30);
            
            this.doc.setFontSize(12);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text('No hay gráficos disponibles para mostrar', 20, 50);
            return;
        }
        
        for (let i = 0; i < graficosComoImagenes.length; i++) {
            if (i > 0 || this.doc.internal.getCurrentPageInfo().pageNumber > 3) {
                this.doc.addPage();
            }
            
            const grafico = graficosComoImagenes[i];
            
            // Título del gráfico
            this.doc.setFontSize(14);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setTextColor(67, 97, 238);
            this.doc.text(`Gráfico ${i + 1}: ${grafico.titulo}`, 20, 30);
            
            try {
                // Agregar imagen del gráfico
                const imgProps = this.doc.getImageProperties(grafico.imagen);
                const width = Math.min(170, imgProps.width * 170 / imgProps.width);
                const height = Math.min(150, imgProps.height * 150 / imgProps.height);
                
                this.doc.addImage(grafico.imagen, 'PNG', 20, 45, width, height);
                
                // Descripción del gráfico (si está disponible en la configuración)
                const configGrafico = window.configuracionGraficos ? window.configuracionGraficos[i] : null;
                if (configGrafico) {
                    const descripcion = this.generarDescripcionGrafico(configGrafico);
                    this.doc.setFontSize(10);
                    this.doc.setFont('helvetica', 'italic');
                    this.doc.setTextColor(100, 100, 100);
                    
                    const descY = 45 + height + 10;
                    const descLines = this.doc.splitTextToSize(descripcion, 170);
                    this.doc.text(descLines, 20, descY);
                }
                
            } catch (error) {
                console.error(`Error agregando gráfico ${i + 1}:`, error);
                this.doc.setFontSize(12);
                this.doc.setTextColor(220, 53, 69);
                this.doc.text(`Error al cargar el gráfico: ${grafico.titulo}`, 20, 50);
            }
        }
    }

    async generarTablaFrecuencias() {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(194, 24, 91);
        this.doc.text('TABLA DE FRECUENCIAS', 20, 30);
        
        const resultadosTabla = document.getElementById('resultadosTablaFrecuencias');
        
        if (!resultadosTabla || resultadosTabla.style.display === 'none') {
            this.doc.setFontSize(12);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text('No se ha generado ninguna tabla de frecuencias', 20, 50);
            return;
        }
        
        // Extraer información de la tabla de frecuencias
        const variableSeleccionada = document.getElementById('variableSeleccionada').value;
        const tipoVariable = document.getElementById('tipoVariable').value;
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        this.doc.text(`Variable analizada: ${variableSeleccionada}`, 20, 50);
        this.doc.text(`Tipo de variable: ${tipoVariable === 'cuantitativa' ? 'Cuantitativa' : 'Cualitativa'}`, 20, 60);
        
        // Intentar capturar la tabla como imagen
        try {
            const tablaImagen = await this.capturarElementoComoImagen(resultadosTabla);
            if (tablaImagen) {
                const imgProps = this.doc.getImageProperties(tablaImagen);
                const width = Math.min(170, imgProps.width * 170 / imgProps.width);
                const height = Math.min(200, imgProps.height * 170 / imgProps.width);
                
                this.doc.addImage(tablaImagen, 'PNG', 20, 75, width, height);
            }
        } catch (error) {
            console.error('Error capturando tabla de frecuencias:', error);
            this.doc.setFontSize(10);
            this.doc.setTextColor(220, 53, 69);
            this.doc.text('No se pudo incluir la tabla de frecuencias en el PDF', 20, 75);
        }
    }

    async generarResumenEstadistico() {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(194, 24, 91);
        this.doc.text('RESUMEN ESTADÍSTICO', 20, 30);
        
        const estadisticasContainer = document.getElementById('estadisticas');
        if (!estadisticasContainer) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text('No hay estadísticas disponibles', 20, 50);
            return;
        }
        
        // CORRECCIÓN: Usar datos seguros
        const datosParaAnalizar = this.obtenerDatosSeguros();
        
        if (datosParaAnalizar.length > 0) {
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(80, 80, 80);
            
            this.doc.text(`Tamaño de muestra (N): ${datosParaAnalizar.length}`, 20, 50);
            this.doc.text(`Número de variables: ${Object.keys(datosParaAnalizar[0]).length}`, 20, 60);
            
            // Estadísticas personalizadas
            const estadisticasPersonalizadas = window.estadisticasPersonalizadas || [];
            let yPos = 80;
            
            if (estadisticasPersonalizadas.length > 0) {
                this.doc.setFont('helvetica', 'bold');
                this.doc.setTextColor(67, 97, 238);
                this.doc.text('ESTADÍSTICAS PERSONALIZADAS', 20, yPos);
                yPos += 10;
                
                estadisticasPersonalizadas.forEach((estadistica, index) => {
                    if (yPos > 250) {
                        this.doc.addPage();
                        yPos = 30;
                    }
                    
                    const valor = window.calcularEstadisticaPersonalizada ? window.calcularEstadisticaPersonalizada(estadistica) : 'N/A';
                    this.doc.setFont('helvetica', 'normal');
                    this.doc.setTextColor(80, 80, 80);
                    this.doc.text(`${estadistica.nombre}: ${valor}`, 25, yPos);
                    yPos += 7;
                });
            }
            
            // Campos numéricos disponibles
            const camposNumericos = this.obtenerCamposNumericos(datosParaAnalizar);
            if (camposNumericos.length > 0) {
                yPos += 10;
                this.doc.setFont('helvetica', 'bold');
                this.doc.setTextColor(67, 97, 238);
                this.doc.text('CAMPOS NUMÉRICOS DISPONIBLES', 20, yPos);
                yPos += 10;
                
                this.doc.setFont('helvetica', 'normal');
                this.doc.setTextColor(80, 80, 80);
                camposNumericos.forEach((campo, index) => {
                    if (yPos > 250) {
                        this.doc.addPage();
                        yPos = 30;
                    }
                    this.doc.text(`• ${campo}`, 25, yPos);
                    yPos += 5;
                });
            }
        }
    }

    async generarAnalisisIA(analisis) {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(194, 24, 91);
        this.doc.text('ANÁLISIS CON INTELIGENCIA ARTIFICIAL', 20, 30);
        
        if (!analisis.informeIA) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text('No hay análisis de IA disponible', 20, 50);
            return;
        }
        
        // Procesar el informe de IA
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        
        // Limpiar y formatear el texto del informe
        const informeLimpio = this.limpiarTextoIA(analisis.informeIA);
        const lineas = this.doc.splitTextToSize(informeLimpio, 170);
        
        let yPos = 50;
        for (let i = 0; i < lineas.length; i++) {
            if (yPos > 270) {
                this.doc.addPage();
                yPos = 30;
            }
            this.doc.text(lineas[i], 20, yPos);
            yPos += 5;
        }
    }

    async generarConclusiones(analisis) {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(194, 24, 91);
        this.doc.text('CONCLUSIONES Y RECOMENDACIONES', 20, 30);
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        
        const conclusiones = this.generarConclusionesAutomaticas(analisis);
        const lineas = this.doc.splitTextToSize(conclusiones, 170);
        
        let yPos = 50;
        for (let i = 0; i < lineas.length; i++) {
            if (yPos > 270) {
                this.doc.addPage();
                yPos = 30;
            }
            this.doc.text(lineas[i], 20, yPos);
            yPos += 5;
        }
        
        // Footer final
        this.doc.setFontSize(10);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text('--- Fin del Reporte ---', 105, 280, { align: 'center' });
    }

    // Métodos auxiliares
    obtenerIconoInsight(tipo) {
        const iconos = {
            'tendencia': '📊',
            'correlacion': '🔗',
            'anomalia': '⚠️',
            'distribucion': '📈',
            'comparacion': '⚖️'
        };
        return iconos[tipo] || '💡';
    }

    agregarMetricasClave(analisis) {
        // Implementar lógica para métricas clave basadas en el análisis
        const yPos = 200;
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(67, 97, 238);
        this.doc.text('MÉTRICAS CLAVE', 20, yPos);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        
        // Aquí se pueden agregar métricas específicas del análisis
        if (analisis.datos) {
            this.doc.text(`• Total de datos analizados: ${analisis.datos.length}`, 25, yPos + 10);
            this.doc.text(`• Nivel de confianza: 95%`, 25, yPos + 20);
        }
    }

    generarDescripcionGrafico(configGrafico) {
        const tipo = configGrafico.tipo;
        const campoX = configGrafico.campo;
        const campoY = configGrafico.campoValor;
        const campoZ = configGrafico.campoZ;
        
        let descripcion = `Gráfico de ${this.obtenerNombreTipoGrafico(tipo)} `;
        
        if (campoY) {
            descripcion += `mostrando ${campoY} por ${campoX}`;
        } else {
            descripcion += `mostrando distribución de ${campoX}`;
        }
        
        if (campoZ) {
            descripcion += ` con tamaño basado en ${campoZ}`;
        }
        
        return descripcion;
    }

    obtenerNombreTipoGrafico(tipo) {
        const nombres = {
            'bar': 'barras',
            'line': 'líneas',
            'scatter': 'dispersión',
            'pie': 'circular',
            'doughnut': 'dona',
            'area': 'áreas',
            'bubble': 'burbujas',
            'box': 'cajas (box plot)',
            'violin': 'violín',
            'histogram': 'histograma',
            'heatmap': 'mapa de calor'
        };
        return nombres[tipo] || tipo;
    }

    async capturarElementoComoImagen(elemento) {
        return new Promise((resolve) => {
            // Esta función necesitaría una implementación más robusta
            // usando html2canvas o similar para capturar elementos DOM
            resolve(null);
        });
    }

    async cargarImagenBase64(src) {
        return new Promise((resolve) => {
            // Implementación para cargar imágenes como base64
            resolve(null);
        });
    }

    obtenerCamposNumericos(datos) {
        if (!datos || datos.length === 0) return [];
        return Object.keys(datos[0]).filter(campo => 
            datos.some(d => typeof d[campo] === 'number' && !isNaN(d[campo]))
        );
    }

    limpiarTextoIA(texto) {
        // Limpiar marcado HTML/Markdown y caracteres especiales
        return texto
            .replace(/[#*`]/g, '')
            .replace(/\$\$.*?\$\$/g, '(fórmula matemática)')
            .replace(/\$.*?\$/g, '(fórmula)')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    generarConclusionesAutomaticas(analisis) {
        let conclusiones = "Basado en el análisis realizado, se pueden extraer las siguientes conclusiones:\n\n";
        
        if (analisis.datos) {
            conclusiones += `• Se analizaron ${analisis.datos.length} registros con ${Object.keys(analisis.datos[0]).length} variables diferentes.\n`;
        }
        
        if (analisis.insights && analisis.insights.length > 0) {
            conclusiones += `• Se identificaron ${analisis.insights.length} insights principales en los datos.\n`;
        }
        
        conclusiones += `• El reporte incluye visualizaciones, análisis estadístico y recomendaciones basadas en IA.\n`;
        conclusiones += `• Se recomienda revisar periódicamente los datos para identificar tendencias emergentes.\n\n`;
        conclusiones += `Este reporte fue generado automáticamente el ${new Date().toLocaleDateString()}.`;
        
        return conclusiones;
    }

    generarNombreArchivo() {
        const fecha = new Date();
        const fechaStr = fecha.toISOString().split('T')[0];
        const horaStr = fecha.toTimeString().split(' ')[0].replace(/:/g, '-');
        return `reporte-estadisticamente_${fechaStr}_${horaStr}.pdf`;
    }

    // MÉTODO NUEVO: Obtener datos de forma segura
    obtenerDatosSeguros() {
        // Prioridad 1: Datos del análisis actual
        if (this.analisisActual && this.analisisActual.datos && this.analisisActual.datos.length > 0) {
            return this.analisisActual.datos;
        }
        
        // Prioridad 2: Datos filtrados globales
        if (window.datosFiltrados && window.datosFiltrados.length > 0) {
            return window.datosFiltrados;
        }
        
        // Prioridad 3: Datos originales globales
        if (window.datosOriginales && window.datosOriginales.length > 0) {
            return window.datosOriginales;
        }
        
        // Si no hay datos, retornar array vacío
        return [];
    }

    // Método simplificado para exportación rápida
    async exportarPDFRapido() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFont('helvetica');
            doc.setFontSize(16);
            doc.setTextColor(194, 24, 91);
            doc.text('Reporte EstadísticaMente', 20, 20);
            
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 40);
            
            const datos = this.obtenerDatosSeguros();
            if (datos.length > 0) {
                doc.text(`Datos: ${datos.length} registros`, 20, 50);
                doc.text(`Gráficos: ${window.configuracionGraficos ? window.configuracionGraficos.length : 0}`, 20, 60);
            }
            
            doc.save('reporte-rapido.pdf');
            
            return { exito: true, mensaje: 'PDF rápido generado' };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    }
}

// Hacer la clase disponible globalmente
window.GeneradorPDF = GeneradorPDF;

// Función de conveniencia para uso global
window.exportarPDFCompleto = async function() {
    const generador = new GeneradorPDF();
    
    // Capturar gráficos como imágenes
    const graficosComoImagenes = await window.capturarGraficosComoImagenes();
    
    // Obtener análisis actual
    const datosParaAnalizar = window.datosFiltrados && window.datosFiltrados.length > 0 ? window.datosFiltrados : window.datosOriginales;
    const analizador = new AnalizadorDashboard(datosParaAnalizar);
    const analisis = analizador.analizarCompleto();
    
    return await generador.exportarAPDFCompletoDesdeAnalisis(analisis, graficosComoImagenes);
};

console.log('✅ GeneradorPDF cargado correctamente');


// Función única para descargar todo el reporte completo
async function descargarReporteCompleto() {
    const boton = document.getElementById('btnDescargarTodo');
    const contenedorBoton = document.getElementById('botonDescargaCompleta');
    const textoOriginal = boton.innerHTML;
    
    try {
        // Mostrar estado de carga
        boton.innerHTML = '⏳ Generando reporte completo...';
        boton.disabled = true;
        boton.style.background = 'linear-gradient(135deg, #666 0%, #888 100%)';
        
        // Mostrar notificación
        mostrarNotificacionPDF('📊 Iniciando generación del reporte completo...', 'info');
        
        console.log('📄 Capturando gráficos...');
        
        // 1. Capturar gráficos como imágenes
        const graficosComoImagenes = await capturarGraficosComoImagenes();
        console.log('✅ Gráficos capturados:', graficosComoImagenes.length);
        
        // 2. Obtener datos - VERSIÓN SIMPLIFICADA
        let datosParaAnalizar = [];
        if (window.datosFiltrados && window.datosFiltrados.length > 0) {
            datosParaAnalizar = window.datosFiltrados;
        } else if (window.datosOriginales && window.datosOriginales.length > 0) {
            datosParaAnalizar = window.datosOriginales;
        }

        console.log('📈 Datos para análisis:', datosParaAnalizar.length);

        // 🔧 PARCHE CRÍTICO: Asegurar que siempre haya datos para el PDF
        if (!datosParaAnalizar || datosParaAnalizar.length === 0) {
            console.warn('⚠️ datosParaAnalizar vacío, usando datos de respaldo...');
            datosParaAnalizar = window.datosFiltrados && window.datosFiltrados.length > 0 
                ? window.datosFiltrados 
                : window.datosOriginales;
            
            if (!datosParaAnalizar || datosParaAnalizar.length === 0) {
                throw new Error('No hay datos cargados para analizar');
            }
            console.log('✅ Datos recuperados:', datosParaAnalizar.length);
        }
        
        // 3. Crear análisis básico
        console.log('🔍 Creando análisis...');
        let analisis = {
            datos: datosParaAnalizar,
            insights: [],
            tendencias: [],
            correlaciones: [],
            outliers: [],
            estadisticas: []
        };
        // 🔧 GARANTIZAR que el análisis tenga los datos reales
if (!analisis.datos || analisis.datos.length === 0) {
    console.warn('⚠️ analisis.datos vacío, inyectando datos reales...');
    analisis.datos = window.datosFiltrados && window.datosFiltrados.length > 0 
        ? window.datosFiltrados 
        : window.datosOriginales;
}
        // Intentar usar AnalizadorDashboard si está disponible
        if (typeof AnalizadorDashboard !== 'undefined') {
            try {
                const analizador = new AnalizadorDashboard(datosParaAnalizar);
                analisis = analizador.analizarCompleto();
                console.log('✅ Análisis completo generado');
            } catch (error) {
                console.warn('⚠️ Error con AnalizadorDashboard, usando análisis básico:', error);
            }
        } else {
            console.warn('⚠️ AnalizadorDashboard no disponible, usando análisis básico');
        }
        
        // 4. Obtener tabla de frecuencias actual
        let tablaFrecuencias = null;
        try {
            if (typeof obtenerTablaFrecuenciasActual === 'function') {
                tablaFrecuencias = obtenerTablaFrecuenciasActual();
                console.log('📊 Tabla de frecuencias obtenida');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo obtener tabla de frecuencias:', error);
        }
        
        // 5. Obtener datos reales de gráficos
        let datosGraficosReales = [];
        try {
            if (typeof obtenerDatosRealesDeGraficos === 'function') {
                datosGraficosReales = await obtenerDatosRealesDeGraficos();
                console.log('🎨 Datos de gráficos obtenidos');
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron obtener datos de gráficos:', error);
        }
        
        // 6. Generar informe IA si está disponible
        let informeIA = '';
        if (window.DeepSeekGeneradorInformes && typeof DeepSeekGeneradorInformes === 'function') {
            try {
                console.log('🤖 Generando análisis con IA...');
                const iaGenerador = new DeepSeekGeneradorInformes();
                informeIA = await iaGenerador.generarInformeAnalitico(
                    analisis, 
                    window.configuracionGraficos || [], 
                    datosGraficosReales,
                    tablaFrecuencias,
                    window.estadisticasPersonalizadas || []
                );
                console.log('✅ Análisis IA generado');
            } catch (error) {
                console.warn('⚠️ No se pudo generar informe IA:', error);
                informeIA = 'Informe de IA no disponible';
            }
        } else {
            console.log('ℹ️ DeepSeek no disponible, continuando sin IA');
        }
        
        // Combinar todo en el análisis
        analisis.informeIA = informeIA;
        analisis.datos = datosParaAnalizar;
        analisis.configGraficos = window.configuracionGraficos || [];
        analisis.tablaFrecuencias = tablaFrecuencias;
        
        console.log('📄 Iniciando generación de PDF...');
        
        // 7. Generar PDF completo
        const generador = new GeneradorPDF();
        const resultadoPDF = await generador.exportarAPDFCompletoDesdeAnalisis(
            analisis, 
            graficosComoImagenes
        );
        
        if (resultadoPDF.exito) {
            console.log('✅ PDF generado correctamente:', resultadoPDF.nombreArchivo);
            
            // Mostrar éxito
            mostrarNotificacionPDF('✅ Reporte completo generado correctamente!', 'success');
            
            // Actualizar el botón con información del reporte
            const infoHTML = `
                <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745;">
                    <h5 style="margin: 0 0 10px 0; font-family: 'Comic Neue', cursive;">🎉 Reporte Generado Exitosamente</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 12px;">
                        <div><strong>📊 Gráficos:</strong> ${graficosComoImagenes.length}</div>
                        <div><strong>📈 Datos:</strong> ${datosParaAnalizar.length} registros</div>
                        <div><strong>📋 Tablas:</strong> ${tablaFrecuencias ? '1' : '0'}</div>
                        <div><strong>🧮 Estadísticas:</strong> ${window.estadisticasPersonalizadas ? window.estadisticasPersonalizadas.length : 0}</div>
                    </div>
                    <div style="margin-top: 10px; font-size: 11px; color: #0f5132;">
                        Archivo: <strong>${resultadoPDF.nombreArchivo}</strong>
                    </div>
                </div>
            `;
            
            // Remover mensaje anterior si existe
            const mensajeAnterior = contenedorBoton.nextElementSibling;
            if (mensajeAnterior && (mensajeAnterior.style.background.includes('#d4edda') || mensajeAnterior.style.background.includes('#f8d7da'))) {
                mensajeAnterior.remove();
            }
            
            contenedorBoton.insertAdjacentHTML('afterend', infoHTML);
            
        } else {
            throw new Error(resultadoPDF.mensaje);
        }
        
    } catch (error) {
        console.error('❌ Error generando reporte completo:', error);
        console.error('Stack trace:', error.stack);
        
        // Mostrar error específico
        let mensajeError = 'Error al generar el reporte: ' + error.message;
        
        if (error.message.includes('jsPDF')) {
            mensajeError = 'Error con la librería PDF. Verifica que esté cargada correctamente.';
        } else if (error.message.includes('gráfico')) {
            mensajeError = 'Error al procesar los gráficos. Intenta nuevamente.';
        } else if (error.message.includes('No hay datos')) {
            mensajeError = '❌ ' + error.message;
        }
        
        mostrarNotificacionPDF('❌ ' + mensajeError, 'error');
        
        // Mostrar opción de error
        const errorHTML = `
            <div style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545;">
                <h5 style="margin: 0 0 10px 0; font-family: 'Comic Neue', cursive;">⚠️ Error al Generar Reporte</h5>
                <p style="margin: 0 0 10px 0; font-size: 14px;">${mensajeError}</p>
                <details style="margin-top: 10px; font-size: 12px;">
                    <summary style="cursor: pointer;">Ver detalles técnicos</summary>
                    <pre style="background: #fff; padding: 10px; border-radius: 4px; margin-top: 10px; overflow-x: auto;">${error.stack || error.message}</pre>
                </details>
                <button class="btn" onclick="descargarReporteCompleto()" 
                        style="padding: 10px 20px; font-size: 14px; background: #dc3545; color: white; border: none; border-radius: 6px; margin-top: 10px; cursor: pointer;">
                    🔄 Intentar Nuevamente
                </button>
            </div>
        `;
        
        // Remover mensaje anterior si existe
        const mensajeAnterior = contenedorBoton.nextElementSibling;
        if (mensajeAnterior && (mensajeAnterior.style.background.includes('#d4edda') || mensajeAnterior.style.background.includes('#f8d7da'))) {
            mensajeAnterior.remove();
        }
        
        contenedorBoton.insertAdjacentHTML('afterend', errorHTML);
        
    } finally {
        // Restaurar botón
        boton.innerHTML = '🔥 Descargar Reporte Completo PDF';
        boton.disabled = false;
        boton.style.background = 'linear-gradient(135deg, #C2185B 0%, #A0154B 100%)';
    }
}

// Función mejorada para notificaciones
function mostrarNotificacionPDF(mensaje, tipo = 'info') {
    // Eliminar notificación anterior si existe
    const notificacionAnterior = document.getElementById('notificacion-pdf-completo');
    if (notificacionAnterior) {
        notificacionAnterior.remove();
    }
    
    // Colores según el tipo
    const colores = {
        'info': { bg: '#C2185B', color: 'white' },
        'success': { bg: '#28a745', color: 'white' },
        'error': { bg: '#dc3545', color: 'white' },
        'warning': { bg: '#ffc107', color: 'black' }
    };
    
    const color = colores[tipo] || colores.info;
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.id = 'notificacion-pdf-completo';
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.color};
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        font-family: 'Comic Neue', cursive;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        max-width: 350px;
        word-wrap: break-word;
        font-weight: bold;
        border-left: 5px solid ${tipo === 'success' ? '#155724' : tipo === 'error' ? '#721c24' : '#A0154B'};
        animation: slideInRight 0.3s ease-out;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (document.body.contains(notificacion)) {
            notificacion.style.transition = 'all 0.5s ease';
            notificacion.style.opacity = '0';
            notificacion.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notificacion)) {
                    document.body.removeChild(notificacion);
                }
            }, 500);
        }
    }, 5000);
}

// Agregar animación CSS si no existe
if (!document.getElementById('pdf-animations-style')) {
    const style = document.createElement('style');
    style.id = 'pdf-animations-style';
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        #btnDescargarTodo:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(194, 24, 91, 0.4);
        }
        
        #btnDescargarTodo:active {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}
// Función mejorada para notificaciones
function mostrarNotificacionPDF(mensaje, tipo = 'info') {
    // Eliminar notificación anterior si existe
    const notificacionAnterior = document.getElementById('notificacion-pdf-completo');
    if (notificacionAnterior) {
        notificacionAnterior.remove();
    }
    
    // Colores según el tipo
    const colores = {
        'info': { bg: '#C2185B', color: 'white' },
        'success': { bg: '#28a745', color: 'white' },
        'error': { bg: '#dc3545', color: 'white' },
        'warning': { bg: '#ffc107', color: 'black' }
    };
    
    const color = colores[tipo] || colores.info;
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.id = 'notificacion-pdf-completo';
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.color};
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        font-family: 'Comic Neue', cursive;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        max-width: 350px;
        word-wrap: break-word;
        font-weight: bold;
        border-left: 5px solid ${tipo === 'success' ? '#155724' : tipo === 'error' ? '#721c24' : '#A0154B'};
        animation: slideInRight 0.3s ease-out;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (document.body.contains(notificacion)) {
            notificacion.style.transition = 'all 0.5s ease';
            notificacion.style.opacity = '0';
            notificacion.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notificacion)) {
                    document.body.removeChild(notificacion);
                }
            }, 500);
        }
    }, 5000);
}

// Agregar animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    #btnDescargarTodo:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(194, 24, 91, 0.4);
    }
    
    #btnDescargarTodo:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
// Función auxiliar para obtener datos reales de gráficos
async function obtenerDatosRealesDeGraficos() {
    if (!window.configuracionGraficos) return [];
    
    const datosGraficos = [];
    const datosParaAnalizar = window.datosFiltrados && window.datosFiltrados.length > 0 ? 
        window.datosFiltrados : window.datosOriginales;
    
    for (let i = 0; i < window.configuracionGraficos.length; i++) {
        const config = window.configuracionGraficos[i];
        if (datosParaAnalizar && datosParaAnalizar.length > 0) {
            const datosAgrupados = agruparDatos(datosParaAnalizar, config.campo, config.campoValor || config.campo);
            datosGraficos.push(datosAgrupados);
        } else {
            datosGraficos.push(null);
        }
    }
    
    return datosGraficos;
}

// Función auxiliar para agrupar datos (si no existe)
function agruparDatos(datos, campo, campoSuma) {
    return datos.reduce((acc, item) => {
        const key = item[campo];
        if (key !== undefined && key !== null && key !== '') {
            const valor = item[campoSuma];
            if (typeof valor === 'number' && !isNaN(valor)) {
                acc[key] = (acc[key] || 0) + valor;
            } else if (!acc[key]) {
                acc[key] = 1;
            } else {
                acc[key] += 1;
            }
        }
        return acc;
    }, {});
}