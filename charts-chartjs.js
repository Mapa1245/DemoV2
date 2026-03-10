// charts-chartjs.js - Implementación con Chart.js para niños

let currentChart = null;

// Generar colores para el gráfico
function generateColors(n) {
  const palette = [
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
    "#59a14f", "#edc949", "#af7aa1", "#ff9da7",
    "#9c755f", "#bab0ab", "#a0cbe8", "#ffbe7d"
  ];

  let colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

function createChart(frequencies, chartType) {
    console.log('📊 Creando gráfico con Chart.js - DEBUG:', { chartType, frequencies });
    
    const chartCanvas = document.getElementById('chart-canvas');
    const myChartCanvas = document.getElementById('myChart');
    
    console.log('🔍 DEBUG - chartCanvas:', chartCanvas);
    
    if (!chartCanvas || !myChartCanvas) {
        console.error('❌ No se encontró el contenedor del gráfico');
        return;
    }

    // Destruir gráfico anterior si existe
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }

    const labels = frequencies.map(f => f.value);
    const values = frequencies.map(f => f.frequency);
    const colors = generateColors(labels.length);

    // Asegurar que el contenedor esté visible
    chartCanvas.style.display = 'block';
    chartCanvas.style.width = '100%';
    chartCanvas.style.height = '500px';

    // Configuración común para todos los gráficos
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: "'Comic Neue', cursive",
                        size: 14
                    }
                }
            },
            title: {
                display: true,
                text: chartType === 'bar' ? 'Gráfico de Barras' : 'Gráfico de Sectores',
                font: {
                    family: "'Comic Neue', cursive",
                    size: 18
                }
            },
            tooltip: {
                titleFont: {
                    family: "'Comic Neue', cursive"
                },
                bodyFont: {
                    family: "'Open Sans', sans-serif"
                }
            }
        }
    };

    let config;

    switch(chartType) {
        case 'bar':
            config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Frecuencia',
                        data: values,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace('0.8', '1')),
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Frecuencia',
                                font: {
                                    family: "'Comic Neue', cursive",
                                    size: 14
                                }
                            },
                            ticks: {
                                font: {
                                    family: "'Open Sans', sans-serif"
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Valores',
                                font: {
                                    family: "'Comic Neue', cursive",
                                    size: 14
                                }
                            },
                            ticks: {
                                font: {
                                    family: "'Open Sans', sans-serif"
                                }
                            }
                        }
                    }
                }
            };
            break;

        case 'pie':
            config = {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace('0.8', '1')),
                        borderWidth: 2
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            };
            break;

        case 'pictograma':
            // Para pictograma, usar el método existente
            crearGraficoPictograma(frequencies, "pictograma-container");
            return;

        default:
            console.error('Tipo de gráfico no soportado:', chartType);
            return;
    }

    // Crear el gráfico
    try {
        const ctx = myChartCanvas.getContext('2d');
        currentChart = new Chart(ctx, config);
        window.currentChart = currentChart;
        window.chartType = chartType;
        console.log('✅ Gráfico creado exitosamente con Chart.js');
    } catch (error) {
        console.error('❌ Error al crear gráfico con Chart.js:', error);
    }
}

// Crear gráfico agrupado (para datos cuantitativos agrupados)
function createGroupedChart(intervals, chartType) {
    console.log('📊 Creando gráfico agrupado con Chart.js:', { chartType, intervals });
    
    const chartCanvas = document.getElementById('chart-canvas');
    const myChartCanvas = document.getElementById('myChart');
    
    if (!chartCanvas || !myChartCanvas) {
        console.error('❌ No se encontró el contenedor del gráfico');
        return;
    }

    // Destruir gráfico anterior si existe
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }

    const labels = intervals.map(i => `${formatNumber(i.start)} - ${formatNumber(i.end)}`);
    const values = intervals.map(i => i.frequency);
    const colors = generateColors(labels.length);

    // Asegurar que el contenedor esté visible
    chartCanvas.style.display = 'block';
    chartCanvas.style.width = '100%';
    chartCanvas.style.height = '500px';

    let config;

    if (chartType === 'line') {
        // Polígono de frecuencia
        config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frecuencia',
                    data: values,
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    borderColor: colors[0],
                    borderWidth: 3,
                    tension: 0.1,
                    pointBackgroundColor: colors[0],
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Comic Neue', cursive",
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Polígono de Frecuencia',
                        font: {
                            family: "'Comic Neue', cursive",
                            size: 18
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Frecuencia',
                            font: {
                                family: "'Comic Neue', cursive",
                                size: 14
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Intervalos',
                            font: {
                                family: "'Comic Neue', cursive",
                                size: 14
                            }
                        }
                    }
                }
            }
        };
    } else {
        // Histograma (barras)
        config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frecuencia',
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.8', '1')),
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Comic Neue', cursive",
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Histograma',
                        font: {
                            family: "'Comic Neue', cursive",
                            size: 18
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Frecuencia',
                            font: {
                                family: "'Comic Neue', cursive",
                                size: 14
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Intervalos',
                            font: {
                                family: "'Comic Neue', cursive",
                                size: 14
                            }
                        }
                    }
                }
            }
        };
    }

    // Crear el gráfico
    try {
        const ctx = myChartCanvas.getContext('2d');
        currentChart = new Chart(ctx, config);
        window.currentChart = currentChart;
        window.chartType = chartType;
        console.log('✅ Gráfico agrupado creado exitosamente con Chart.js');
    } catch (error) {
        console.error('❌ Error al crear gráfico agrupado con Chart.js:', error);
    }
}

// Función para formatear números
function formatNumber(num) {
    return Number.isInteger(num) ? num : num.toFixed(3);
}

// Pictograma - CORREGIDA
function crearGraficoPictograma(frecuencias, contenedorId) {
    const iconos = ["🔷", "🔶", "🔺", "🔵", "🟢", "🟣", "🟤", "⭐", "🧩"];
    const contenedor = document.getElementById(contenedorId);
    
    if (!contenedor) {
        console.error('❌ No se encontró el contenedor del pictograma:', contenedorId);
        return;
    }
   
    // Limpiar y preparar contenedor
    contenedor.innerHTML = "<h3 style='margin-bottom: 15px; text-align: center; color: #333;'>Pictograma</h3>";
    contenedor.style.display = "block";
    contenedor.style.padding = "20px";
    contenedor.style.background = "white";
    contenedor.style.borderRadius = "8px";
    contenedor.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";

    // Ocultar el canvas de Chart.js
    const chartCanvas = document.getElementById('chart-canvas');
    if (chartCanvas) {
        chartCanvas.style.display = 'none';
    }

    // Crear elementos del pictograma
    frecuencias.forEach((item, index) => {
        const fila = document.createElement("div");
        fila.style.display = "flex";
        fila.style.alignItems = "center";
        fila.style.marginBottom = "15px";
        fila.style.padding = "10px";
        fila.style.background = "#f8f9fa";
        fila.style.borderRadius = "8px";

        const emoji = iconos[index % iconos.length];
        const repeticiones = emoji.repeat(Math.min(item.frequency, 20)); // Limitar a 20 para no saturar

        fila.innerHTML = `
            <div style="flex: 1; font-weight: bold; color: #333;">${item.value}:</div>
            <div style="flex: 2; font-size: 24px; text-align: left;">${repeticiones}</div>
            <div style="flex: 1; text-align: right; color: #666; font-size: 14px;">
                (${item.frequency})
            </div>
        `;
        contenedor.appendChild(fila);
    });

    console.log('✅ Pictograma creado exitosamente');
}

// Mostrar pictograma adicional si corresponde
function mostrarPictogramaAdicionalSiCorresponde(frequencies, variableType, chartType) {
    const esCualitativa = variableType === "qualitative";
    const esGraficoApto = chartType === "bar" || chartType === "pie";

    const pictogramaContainer = document.getElementById("pictograma-container");
    const chartCanvas = document.getElementById("chart-canvas");

    if (pictogramaContainer) {
        pictogramaContainer.innerHTML = "";
        
        if (esCualitativa && esGraficoApto) {
            pictogramaContainer.style.display = "block";
            if (chartCanvas) {
                chartCanvas.style.display = "none";
            }
            
            const frecuenciasAdaptadas = frequencies.map(item => ({
                value: item.label || item.value,
                frequency: item.frequency
            }));
            crearGraficoPictograma(frecuenciasAdaptadas, "pictograma-container");
        } else {
            pictogramaContainer.style.display = "none";
            if (chartCanvas) {
                chartCanvas.style.display = "block";
            }
        }
    }
}

// Función para ajustar tamaño del gráfico
function ajustarTamanioGrafico() {
    const chartCanvas = document.getElementById('chart-canvas');
    const resultsSection = document.getElementById('results-section');
    
    if (chartCanvas && resultsSection) {
        // Forzar el ancho completo
        resultsSection.style.width = '100%';
        chartCanvas.style.width = '100%';
        
        // Asegurar que Chart.js use todo el espacio
        if (currentChart) {
            setTimeout(() => {
                currentChart.resize();
                console.log('✅ Tamaño del gráfico ajustado correctamente');
            }, 200);
        }
    }
}

// Función para limpiar todos los gráficos
function limpiarGraficos() {
    const chartCanvas = document.getElementById('chart-canvas');
    const pictogramaContainer = document.getElementById('pictograma-container');
    
    if (chartCanvas) {
        chartCanvas.style.display = 'none';
    }
    
    if (pictogramaContainer) {
        pictogramaContainer.innerHTML = '';
        pictogramaContainer.style.display = 'none';
    }
    
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
    
    console.log('🧹 Todos los gráficos limpiados');
}

// Función para verificar si hay datos para graficar
function validarDatosParaGrafico(frequencies) {
    if (!frequencies || frequencies.length === 0) {
        console.error('❌ No hay frecuencias para graficar');
        return false;
    }
    
    const totalFrecuencias = frequencies.reduce((sum, f) => sum + f.frequency, 0);
    if (totalFrecuencias === 0) {
        console.error('❌ Las frecuencias suman 0');
        return false;
    }
    
    return true;
}

// Manejar redimensionamiento de ventana
window.addEventListener('resize', function() {
    if (currentChart) {
        setTimeout(() => {
            ajustarTamanioGrafico();
        }, 300);
    }
});

// Hacer funciones disponibles globalmente
window.generateColors = generateColors;
window.createGroupedChart = createGroupedChart;
window.createChart = createChart;
window.crearGraficoPictograma = crearGraficoPictograma;
window.mostrarPictogramaAdicionalSiCorresponde = mostrarPictogramaAdicionalSiCorresponde;
window.ajustarTamanioGrafico = ajustarTamanioGrafico;
window.limpiarGraficos = limpiarGraficos;
window.validarDatosParaGrafico = validarDatosParaGrafico;

console.log('✅ charts-chartjs.js cargado correctamente');