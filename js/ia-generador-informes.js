
// Generador de Informes Educativos con DeepSeek API - VERSIÓN PROFESIONAL
class DeepSeekGeneradorInformes {
    constructor() {
        this.apiKey = "sk-b394744ba7d74c71acf469bb7f067d2d";
        this.baseURL = 'https://api.deepseek.com/v1/chat/completions';
    }

    // Generar prompt basado en los resultados reales de la aplicación
    generarPromptAnalitico(analisis, configGraficos, datosGraficos, tablaFrecuencias, estadisticasPersonalizadas) {
        return `
Eres un analista de datos. Genera un informe técnico pero accesible basado EXCLUSIVAMENTE en los siguientes resultados generados por el usuario:

# RESULTADOS OBTENIDOS EN LA APLICACIÓN:

## 1. CONFIGURACIÓN DE GRÁFICOS:
${this.formatearConfiguracionGraficos(configGraficos)}

## 2. DATOS VISUALIZADOS EN GRÁFICOS:
${this.formatearDatosGraficos(configGraficos, datosGraficos)}

## 3. TABLA DE FRECUENCIAS GENERADA:
${this.formatearResultadosTablaFrecuencias(tablaFrecuencias)}

## 4. RESUMEN ESTADÍSTICO CALCULADO:
${this.formatearEstadisticasCompletas(analisis.estadisticas, estadisticasPersonalizadas)}

## 5. ANÁLISIS AUTOMÁTICO DEL SISTEMA:
- Tendencias: ${analisis.tendencias?.length || 0} detectadas
- Correlaciones: ${analisis.correlaciones?.length || 0} significativas
- Valores atípicos: ${analisis.outliers?.length || 0} identificados

## INSTRUCCIONES PARA EL INFORME:
- Analiza los resultados REALES que el usuario generó
- Explica qué significan los patrones observados en los gráficos
- Interpreta los resultados de la tabla de frecuencias
- Relaciona las estadísticas con las visualizaciones
- Usa lenguaje claro pero técnicamente preciso
- Evita explicaciones básicas de "qué es un gráfico"
- Enfócate en la interpretación de los resultados específicos
- Estructura el análisis de manera lógica y profesional

Estructura requerida:
1. Resumen Ejecutivo
2. Análisis de Gráficos (interpretación de lo visualizado)
3. Interpretación de Tabla de Frecuencias
4. Síntesis Estadística
5. Conclusiones y Observaciones
`;
    }

    formatearConfiguracionGraficos(configGraficos) {
        if (!configGraficos || configGraficos.length === 0) return 'No hay gráficos configurados';
        
        return configGraficos.map((config, index) => 
            `Gráfico ${index + 1}: ${config.titulo}
             Tipo: ${config.tipo}
             Eje X: ${config.campo}
             Eje Y: ${config.campoValor || config.campo}`
        ).join('\n\n');
    }

    formatearDatosGraficos(configGraficos, datosGraficos) {
        if (!configGraficos || !datosGraficos) return 'No hay datos de gráficos disponibles';
        
        return configGraficos.map((config, index) => {
            const datos = datosGraficos[index];
            if (!datos) return `Gráfico ${index + 1}: Sin datos`;
            
            return this.obtenerResumenDatosGrafico(config.tipo, datos, config.campo, config.campoValor);
        }).join('\n\n');
    }

    obtenerResumenDatosGrafico(tipo, datos, campoX, campoY) {
        switch(tipo) {
            case 'bar':
            case 'pie':
                const categorias = Object.keys(datos);
                const valores = Object.values(datos);
                const maxValor = Math.max(...valores);
                const minValor = Math.min(...valores);
                const categoriaMax = categorias[valores.indexOf(maxValor)];
                const categoriaMin = categorias[valores.indexOf(minValor)];
                
                return `Gráfico ${tipo}: ${categorias.length} categorías
- Mayor valor: ${categoriaMax} (${maxValor})
- Menor valor: ${categoriaMin} (${minValor})
- Rango: ${minValor} - ${maxValor}`;

            case 'line':
                const valoresLinea = Object.values(datos);
                const primeraValor = valoresLinea[0];
                const ultimaValor = valoresLinea[valoresLinea.length - 1];
                const variacion = ((ultimaValor - primeraValor) / primeraValor * 100).toFixed(1);
                
                return `Gráfico línea: ${valoresLinea.length} puntos temporales
- Valor inicial: ${primeraValor}
- Valor final: ${ultimaValor}
- Variación: ${variacion}%`;

            case 'scatter':
                return `Gráfico dispersión: ${datos.x?.length || 0} puntos
- Analiza relación entre ${campoX} y ${campoY}`;

            case 'histogram':
                const totalDatos = Object.values(datos).reduce((a, b) => a + b, 0);
                return `Histograma: ${Object.keys(datos).length} intervalos
- Total datos: ${totalDatos}
- Distribución de frecuencias`;

            default:
                return `Gráfico ${tipo}: ${Object.keys(datos).length} elementos`;
        }
    }

    formatearResultadosTablaFrecuencias(tablaFrecuencias) {
        if (!tablaFrecuencias || !tablaFrecuencias.tabla) {
            return 'No se generó tabla de frecuencias';
        }

        let resumen = `TABLA DE FRECUENCIAS - Tipo: ${tablaFrecuencias.tipo}\n`;
        resumen += `Total de datos: ${tablaFrecuencias.total}\n`;
        
        if (tablaFrecuencias.tipo === 'cualitativa') {
            const categoriaPrincipal = tablaFrecuencias.tabla.reduce((max, item) => 
                item.frecuencia > max.frecuencia ? item : max, tablaFrecuencias.tabla[0]);
            
            resumen += `Categorías: ${tablaFrecuencias.tabla.length}\n`;
            resumen += `Categoría más frecuente: "${categoriaPrincipal.categoria}" (${categoriaPrincipal.frecuencia} ocurrencias, ${(categoriaPrincipal.frecuenciaRelativa * 100).toFixed(1)}%)`;
        
        } else if (tablaFrecuencias.tipo === 'simple') {
            const valoresUnicos = tablaFrecuencias.tabla.length;
            resumen += `Valores únicos: ${valoresUnicos}\n`;
            resumen += `Rango analizado: ${tablaFrecuencias.tabla[0]?.valor} - ${tablaFrecuencias.tabla[valoresUnicos-1]?.valor}`;
        
        } else if (tablaFrecuencias.tipo === 'agrupada') {
            resumen += `Intervalos: ${tablaFrecuencias.configuracion.intervalos}\n`;
            resumen += `Amplitud: ${tablaFrecuencias.configuracion.amplitud.toFixed(2)}\n`;
            resumen += `Rango total: ${tablaFrecuencias.configuracion.min} - ${tablaFrecuencias.configuracion.max}`;
        }

        return resumen;
    }

    formatearEstadisticasCompletas(estadisticas, estadisticasPersonalizadas) {
        let contenido = '';
        
        // Estadísticas básicas del análisis automático
        if (estadisticas && estadisticas.length > 0) {
            contenido += 'ESTADÍSTICAS DESCRIPTIVAS:\n';
            estadisticas.forEach(est => {
                contenido += `${est.campo}:
- Media: ${est.promedio.toFixed(2)}
- Rango: ${est.min} - ${est.max}
- Desviación: ${est.desviacion.toFixed(2)}
- Coeficiente de variación: ${((est.desviacion / est.promedio) * 100).toFixed(1)}%\n\n`;
            });
        }
        
        // Estadísticas personalizadas del usuario
        if (estadisticasPersonalizadas && estadisticasPersonalizadas.length > 0) {
            contenido += 'MEDIDAS ESTADÍSTICAS PERSONALIZADAS:\n';
            estadisticasPersonalizadas.forEach(est => {
                contenido += `• ${est.nombre}: ${this.obtenerDescripcionEstadistica(est.tipo)}\n`;
            });
        }
        
        return contenido || 'No hay estadísticas disponibles';
    }

    obtenerDescripcionEstadistica(tipo) {
        const descripciones = {
            'promedio': 'Medida de tendencia central',
            'mediana': 'Valor que divide la distribución en dos partes iguales',
            'moda': 'Valor más frecuente en el conjunto de datos',
            'percentil': 'Valor por debajo del cual se encuentra un porcentaje de observaciones',
            'quartil': 'Puntos que dividen los datos ordenados en cuatro partes iguales',
            'varianza': 'Medida de dispersión de los datos',
            'desviacion': 'Desviación estándar - dispersión alrededor de la media'
        };
        return descripciones[tipo] || 'Medida estadística calculada';
    }

    formatearNumero(num) {
        if (num === undefined || num === null) return 'N/A';
        if (isNaN(num)) return 'N/A';
        return typeof num === 'number' ? num.toFixed(2) : num;
    }

    // Método principal
    async generarInformeAnalitico(analisis, configGraficos, datosGraficos, tablaFrecuencias, estadisticasPersonalizadas) {
        try {
            const prompt = this.generarPromptAnalitico(analisis, configGraficos, datosGraficos, tablaFrecuencias, estadisticasPersonalizadas);
            
            const respuesta = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `Eres un analista de datos profesional. Tu tarea es interpretar resultados estadísticos generados por un usuario en una aplicación de análisis.

ENFOQUE REQUERIDO:
- Analiza los resultados REALES que el usuario generó
- Interpreta patrones y tendencias observadas en los datos
- Explica el significado estadístico de los hallazgos
- Relaciona las diferentes visualizaciones y análisis
- Usa lenguaje técnico pero accesible
- Evita explicaciones básicas sobre conceptos estadísticos
- Enfócate en la interpretación práctica de los resultados
- No inventes datos ni realices cálculos adicionales

El usuario ya conoce los conceptos básicos, necesita entender qué significan SUS resultados específicos.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2800,
                    temperature: 0.6,
                    stream: false
                })
            });

            if (!respuesta.ok) {
                throw new Error(`Error DeepSeek: ${respuesta.status}`);
            }

            const data = await respuesta.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Error con DeepSeek:', error);
            return this.generarInformeAlternativo(analisis, configGraficos, datosGraficos, tablaFrecuencias);
        }
    }

    generarInformeAlternativo(analisis, configGraficos, datosGraficos, tablaFrecuencias) {
        return `INFORME DE ANÁLISIS - RESULTADOS GENERADOS

RESUMEN EJECUTIVO
Se analizaron ${analisis.estadisticas?.length || 0} variables mediante ${configGraficos?.length || 0} visualizaciones diferentes.

ANÁLISIS DE GRÁFICOS
${configGraficos?.map((config, i) => {
    const datos = datosGraficos[i];
    return `Gráfico ${i+1} (${config.tipo}): ${config.titulo}
- Variable X: ${config.campo}
- Variable Y: ${config.campoValor || config.campo}
${datos ? `- Elementos visualizados: ${Object.keys(datos).length}` : ''}`;
}).join('\n\n') || 'No hay gráficos para analizar'}

TABLA DE FRECUENCIAS
${tablaFrecuencias ? 
`Tipo: ${tablaFrecuencias.tipo}
Total de datos: ${tablaFrecuencias.total}
${tablaFrecuencias.tipo === 'cualitativa' ? `Categorías analizadas: ${tablaFrecuencias.tabla.length}` : ''}` 
: 'No se generó tabla de frecuencias'}

ESTADÍSTICAS CALCULADAS
${analisis.estadisticas?.map(est => 
    `${est.campo}: Media=${est.promedio.toFixed(2)}, Rango=${est.min}-${est.max}`
).join('\n') || 'No hay estadísticas disponibles'}

---
Informe generado automáticamente a partir de los análisis realizados.`;
    }
}
