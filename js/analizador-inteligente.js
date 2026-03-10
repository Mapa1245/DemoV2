// Analizador Inteligente para Dashboard
class AnalizadorDashboard {
    constructor(datos) {
        this.datos = datos;
        this.analisis = {};
    }

    // Análisis estadístico básico
    analizarEstadisticas() {
        const camposNumericos = this.obtenerCamposNumericos();
        
        this.analisis.estadisticas = camposNumericos.map(campo => {
            const valores = this.datos.map(d => d[campo]).filter(v => v != null);
            return {
                campo: campo,
                total: valores.reduce((a, b) => a + b, 0),
                promedio: valores.reduce((a, b) => a + b, 0) / valores.length,
                max: Math.max(...valores),
                min: Math.min(...valores),
                desviacion: this.calcularDesviacionEstandar(valores)
            };
        });

        return this.analisis.estadisticas;
    }

    // Detección de tendencias
    analizarTendencias() {
        const camposTemporales = this.obtenerCamposTemporales();
        const tendencias = [];

        camposTemporales.forEach(campoTiempo => {
            const datosOrdenados = [...this.datos].sort((a, b) => 
                new Date(a[campoTiempo]) - new Date(b[campoTiempo])
            );
            
            if (datosOrdenados.length > 1) {
                const primerValor = this.obtenerPrimerValorNumerico(datosOrdenados[0]);
                const ultimoValor = this.obtenerPrimerValorNumerico(datosOrdenados[datosOrdenados.length - 1]);
                const tendencia = ((ultimoValor - primerValor) / primerValor) * 100;
                
                tendencias.push({
                    periodo: campoTiempo,
                    crecimiento: tendencia,
                    tendencia: tendencia > 0 ? 'positiva' : 'negativa',
                    magnitud: Math.abs(tendencia) > 20 ? 'alta' : Math.abs(tendencia) > 10 ? 'media' : 'baja'
                });
            }
        });

        this.analisis.tendencias = tendencias;
        return tendencias;
    }

    // Análisis de correlaciones
    analizarCorrelaciones() {
        const camposNumericos = this.obtenerCamposNumericos();
        const correlaciones = [];

        for (let i = 0; i < camposNumericos.length; i++) {
            for (let j = i + 1; j < camposNumericos.length; j++) {
                const correlacion = this.calcularCorrelacion(
                    this.datos.map(d => d[camposNumericos[i]]),
                    this.datos.map(d => d[camposNumericos[j]])
                );
                
                if (Math.abs(correlacion) > 0.5) {
                    correlaciones.push({
                        campo1: camposNumericos[i],
                        campo2: camposNumericos[j],
                        correlacion: correlacion,
                        fuerza: Math.abs(correlacion) > 0.8 ? 'fuerte' : 'moderada',
                        tipo: correlacion > 0 ? 'positiva' : 'negativa'
                    });
                }
            }
        }

        this.analisis.correlaciones = correlaciones;
        return correlaciones;
    }

    // Análisis de outliers
    analizarOutliers() {
        const camposNumericos = this.obtenerCamposNumericos();
        const outliers = [];

        camposNumericos.forEach(campo => {
            const valores = this.datos.map(d => d[campo]).filter(v => v != null);
            const Q1 = this.calcularPercentil(valores, 25);
            const Q3 = this.calcularPercentil(valores, 75);
            const IQR = Q3 - Q1;
            const limiteInferior = Q1 - 1.5 * IQR;
            const limiteSuperior = Q3 + 1.5 * IQR;

            const datosOutliers = this.datos.filter(d => 
                d[campo] < limiteInferior || d[campo] > limiteSuperior
            );

            if (datosOutliers.length > 0) {
                outliers.push({
                    campo: campo,
                    cantidad: datosOutliers.length,
                    porcentaje: (datosOutliers.length / this.datos.length) * 100,
                    ejemplos: datosOutliers.slice(0, 3)
                });
            }
        });

        this.analisis.outliers = outliers;
        return outliers;
    }

    // Generar insights automáticos
    generarInsights() {
        const insights = [];

        // Insight 1: Tendencias principales
        if (this.analisis.tendencias) {
            const tendenciaPrincipal = this.analisis.tendencias
                .sort((a, b) => Math.abs(b.crecimiento) - Math.abs(a.crecimiento))[0];
            
            if (tendenciaPrincipal) {
                insights.push({
                    tipo: 'tendencia',
                    titulo: 'Tendencia Principal Detectada',
                    descripcion: `Crecimiento ${tendenciaPrincipal.tendencia} del ${Math.abs(tendenciaPrincipal.crecimiento).toFixed(1)}% en ${tendenciaPrincipal.periodo}`,
                    importancia: 'alta'
                });
            }
        }

        // Insight 2: Correlaciones importantes
        if (this.analisis.correlaciones && this.analisis.correlaciones.length > 0) {
            const correlacionFuerte = this.analisis.correlaciones
                .filter(c => c.fuerza === 'fuerte')[0];
            
            if (correlacionFuerte) {
                insights.push({
                    tipo: 'correlacion',
                    titulo: 'Correlación Significativa',
                    descripcion: `${correlacionFuerte.campo1} y ${correlacionFuerte.campo2} tienen una correlación ${correlacionFuerte.tipo} ${correlacionFuerte.fuerza}`,
                    importancia: 'media'
                });
            }
        }

        // Insight 3: Outliers
        if (this.analisis.outliers && this.analisis.outliers.length > 0) {
            const outlierPrincipal = this.analisis.outliers
                .sort((a, b) => b.porcentaje - a.porcentaje)[0];
            
            if (outlierPrincipal && outlierPrincipal.porcentaje > 10) {
                insights.push({
                    tipo: 'anomalia',
                    titulo: 'Posibles Anomalías Detectadas',
                    descripcion: `${outlierPrincipal.cantidad} valores atípicos encontrados en ${outlierPrincipal.campo} (${outlierPrincipal.porcentaje.toFixed(1)}% del total)`,
                    importancia: 'alta'
                });
            }
        }

        // Insight 4: Distribución de datos
        if (this.analisis.estadisticas) {
            const campoPrincipal = this.analisis.estadisticas
                .sort((a, b) => b.total - a.total)[0];
            
            if (campoPrincipal) {
                insights.push({
                    tipo: 'distribucion',
                    titulo: 'Campo con Mayor Impacto',
                    descripcion: `${campoPrincipal.campo} representa el valor más significativo en el dataset`,
                    importancia: 'media'
                });
            }
        }

        this.analisis.insights = insights;
        return insights;
    }

analizarCompleto() {
    this.analizarEstadisticas();
    this.analizarTendencias();
    this.analizarCorrelaciones();
    this.analizarOutliers();
    this.generarInsights();

    // 🔧 SOLUCIÓN: agregar datos reales al análisis
    this.analisis.datos = this.datos;

    return this.analisis;
}


    // Métodos auxiliares
    obtenerCamposNumericos() {
        if (this.datos.length === 0) return [];
        return Object.keys(this.datos[0]).filter(campo => 
            this.datos.some(d => typeof d[campo] === 'number')
        );
    }

    obtenerCamposTemporales() {
        const camposTemporales = ['fecha', 'mes', 'año', 'periodo', 'timestamp'];
        return Object.keys(this.datos[0]).filter(campo => 
            camposTemporales.some(temporal => campo.toLowerCase().includes(temporal))
        );
    }

    calcularDesviacionEstandar(valores) {
        const avg = valores.reduce((a, b) => a + b, 0) / valores.length;
        const squareDiffs = valores.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    }

    calcularCorrelacion(x, y) {
        const n = x.length;
        const sum_x = x.reduce((a, b) => a + b, 0);
        const sum_y = y.reduce((a, b) => a + b, 0);
        const sum_xy = x.reduce((a, b, i) => a + b * y[i], 0);
        const sum_x2 = x.reduce((a, b) => a + b * b, 0);
        const sum_y2 = y.reduce((a, b) => a + b * b, 0);
        
        const numerator = n * sum_xy - sum_x * sum_y;
        const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }

    calcularPercentil(arr, p) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = lower + 1;
        const weight = index % 1;
        
        if (upper >= sorted.length) return sorted[lower];
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    obtenerPrimerValorNumerico(objeto) {
        for (let key in objeto) {
            if (typeof objeto[key] === 'number') return objeto[key];
        }
        return 0;
    }
}

// Exportar para uso en el dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalizadorDashboard;
}