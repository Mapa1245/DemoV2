// nivelprimario.js - VERSIÓN CORREGIDA Y MEJORADA

// VARIABLES GLOBALES CON VALORES POR DEFECTO
let variableType = 'quantitative';
let chartType = 'bar';
let datosActuales = [];

// ✅ INICIALIZACIÓN GLOBAL MEJORADA
function inicializarVariablesGlobales() {
    // Asegurar que las variables estén disponibles globalmente
    window.variableType = variableType;
    window.chartType = chartType;
    window.datosActuales = datosActuales;
    
    console.log('🔄 Variables globales inicializadas:', {
        variableType: window.variableType,
        chartType: window.chartType,
        datosActuales: window.datosActuales
    });
}

// ✅ SINCRONIZACIÓN MEJORADA
function sincronizarDatosGlobales(datos) {
    if (datos && datos.length > 0) {
        datosActuales = datos;
        window.datosActuales = datos;
        window.variableType = variableType;
        window.chartType = chartType;
        
        console.log('🔄 Datos sincronizados:', datos);
        console.log('📊 Tipo variable:', variableType);
        console.log('🎯 Tipo gráfico:', chartType);
    }
}

// ✅ FUNCIÓN MEJORADA PARA PROCESAR DATOS
function procesarDatosInput() {
    const dataInput = document.getElementById('data-input');
    if (!dataInput || !dataInput.value.trim()) {
        console.warn('⚠️ No hay datos en el input');
        return null;
    }
    
    const inputText = dataInput.value.trim();
    console.log('📥 Texto del input:', inputText);
    
    const datos = inputText.split(/[\s,]+/)
        .map(item => item.trim())
        .filter(item => item !== '');
    
    if (datos.length === 0) {
        console.warn('⚠️ No se pudieron extraer datos válidos');
        return null;
    }
    
    console.log('📊 Datos procesados:', datos);
    
    // Convertir a números si es cuantitativa
    if (variableType === 'quantitative') {
        const datosNumericos = datos.map(item => {
            const num = Number(item);
            if (isNaN(num)) {
                console.warn(`⚠️ Valor no numérico encontrado: ${item}, se convertirá a 0`);
                return 0;
            }
            return num;
        });
        console.log('🔢 Datos numéricos:', datosNumericos);
        return datosNumericos;
    }
    
    return datos;
}

// ✅ FUNCIONES DE CÁLCULO MANUALES (como fallback)
function calculateSimpleFrequencias(dataArray) {
    console.log('📈 Calculando frecuencias para:', dataArray);
    
    const frequencies = {};
    dataArray.forEach(num => {
        frequencies[num] = (frequencies[num] || 0) + 1;
    });

    const resultado = Object.keys(frequencies)
        .map(Number)
        .sort((a, b) => a - b)
        .map(num => ({ value: num, frequency: frequencies[num] }));
    
    console.log('📊 Frecuencias calculadas:', resultado);
    return resultado;
}

function calculateQualitativeFrequencias(dataArray) {
    console.log('📈 Calculando frecuencias cualitativas para:', dataArray);
    
    const frequencies = {};
    dataArray.forEach(val => {
        const cleaned = val.trim().toLowerCase();
        frequencies[cleaned] = (frequencies[cleaned] || 0) + 1;
    });

    const resultado = Object.keys(frequencies)
        .sort()
        .map(cat => ({ value: cat, frequency: frequencies[cat] }));
    
    console.log('📊 Frecuencias cualitativas calculadas:', resultado);
    return resultado;
}

// ✅ GENERAR GRÁFICO CORREGIDO
function generarGrafico() {
    console.log('🎯 GENERAR GRÁFICO ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos || datos.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Datos requeridos',
            text: 'Por favor ingresa algunos datos primero',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    // Sincronizar datos
    sincronizarDatosGlobales(datos);
    
    // Calcular frecuencias
    let frequencies;
    if (variableType === 'quantitative') {
        frequencies = calculateSimpleFrequencias(datos);
    } else {
        frequencies = calculateQualitativeFrequencias(datos);
    }
    
    if (!frequencies || frequencies.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error en cálculo',
            text: 'No se pudieron calcular las frecuencias',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    console.log('📊 Frecuencias para gráfico:', frequencies);
    
    // Mostrar gráfico
    const chartCanvas = document.getElementById('chart-canvas');
    const pictogramaContainer = document.getElementById('pictograma-container');
    
    if (!chartCanvas || !pictogramaContainer) {
        console.error('❌ Contenedores de gráfico no encontrados');
        return;
    }
    
    if (chartType === 'pictograma') {
        console.log('🎨 Creando pictograma...');
        pictogramaContainer.classList.remove('hidden');
        pictogramaContainer.style.display = 'block';
        chartCanvas.style.display = 'none';
        
        if (typeof crearGraficoPictograma === 'function') {
            crearGraficoPictograma(frequencies, 'pictograma-container');
        } else {
            console.error('❌ Función crearGraficoPictograma no disponible');
            mostrarPictogramaFallback(frequencies, 'pictograma-container');
        }
    } else {
        console.log('📈 Creando gráfico normal...');
        chartCanvas.classList.remove('hidden');
        chartCanvas.style.display = 'block';
        pictogramaContainer.style.display = 'none';
        
        if (typeof createChart === 'function') {
            createChart(frequencies, chartType);
        } else {
            console.error('❌ Función createChart no disponible');
            mostrarGraficoFallback(frequencies, chartType);
        }
    }
    
    Swal.fire({
        icon: 'success',
        title: '¡Gráfico generado!',
        text: 'El gráfico se ha creado correctamente',
        timer: 2000,
        showConfirmButton: false
    });
}

// ✅ FUNCIONES FALLBACK PARA GRÁFICOS
function mostrarGraficoFallback(frequencies, tipo) {
    const ctx = document.getElementById('myChart');
    if (!ctx) {
        console.error('❌ Canvas no encontrado');
        return;
    }
    
    const labels = frequencies.map(item => item.value);
    const data = frequencies.map(item => item.frequency);
    
    // Crear gráfico simple con Chart.js
    new Chart(ctx, {
        type: tipo === 'pie' ? 'pie' : 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frecuencia',
                data: data,
                backgroundColor: tipo === 'pie' ? 
                    ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#4895ef'] :
                    '#4361ee',
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Gráfico de ${tipo === 'pie' ? 'Sectores' : 'Barras'}`
                }
            }
        }
    });
}

function mostrarPictogramaFallback(frequencies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<h3>📊 Pictograma</h3>';
    frequencies.forEach(item => {
        const emojis = '🔵'.repeat(Math.min(item.frequency, 10)); // Máximo 10 emojis
        html += `
            <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.value}:</strong> ${emojis} (${item.frequency})
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ✅ CALCULAR MEDIA
function calcularMedia() {
    console.log('📐 CALCULAR MEDIA ejecutado');
    
    if (variableType === 'qualitative') {
        Swal.fire({
            icon: 'info',
            title: 'No aplicable',
            text: 'La media solo se calcula para variables cuantitativas.',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    const datos = procesarDatosInput();
    if (!datos || datos.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Datos requeridos',
            text: 'Primero ingresa datos numéricos.',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    // Cálculo manual de media
    const suma = datos.reduce((a, b) => Number(a) + Number(b), 0);
    const media = (suma / datos.length).toFixed(2);
    
    console.log('📊 Media calculada:', media);
    
    // Mostrar resultado
    mostrarResultadoCalculo(
        'btn-calcular-media',
        '📊 Media',
        media,
        '#4361ee',
        `
            <p class="explicacion"><strong>Definición:</strong> Es el valor promedio de un conjunto de datos numéricos</p>
            <div class="detalle-calculo">
                <p><strong>Cálculo:</strong> (${datos.join(' + ')}) ÷ ${datos.length} = ${media}</p>
                <p><strong>Total de datos:</strong> ${datos.length}</p>
                <p><strong>Suma total:</strong> ${suma.toFixed(2)}</p>
            </div>
        `
    );
}

// ✅ CALCULAR MEDIANA
function calcularMediana() {
    console.log('📏 CALCULAR MEDIANA ejecutado');
    
    if (variableType === 'qualitative') {
        Swal.fire({
            icon: 'info',
            title: 'No aplicable',
            text: 'La mediana solo se calcula para variables cuantitativas.',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    const datos = procesarDatosInput();
    if (!datos || datos.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Datos requeridos',
            text: 'Primero ingresa datos numéricos.',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    // Cálculo manual de mediana
    const sorted = [...datos].map(Number).sort((a, b) => a - b);
    let mediana;
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        mediana = ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);
    } else {
        mediana = sorted[mid].toFixed(2);
    }
    
    console.log('📏 Mediana calculada:', mediana);
    
    // Mostrar resultado
    mostrarResultadoCalculo(
        'btn-calcular-mediana',
        '📏 Mediana',
        mediana,
        '#7209b7',
        `
            <p class="explicacion"><strong>Definición:</strong> Valor central de los datos ordenados</p>
            <div class="detalle-calculo">
                <p><strong>Datos ordenados:</strong> ${sorted.join(', ')}</p>
                <p><strong>Posición central:</strong> ${sorted.length % 2 === 0 ? 
                    `Posiciones ${mid} y ${mid + 1} (${sorted[mid - 1]} y ${sorted[mid]})` : 
                    `Posición ${mid + 1}`}</p>
                <p><strong>Cantidad de datos:</strong> ${sorted.length} (${sorted.length % 2 === 0 ? 'par' : 'impar'})</p>
            </div>
        `
    );
}

// ✅ CALCULAR MODA
function calcularModa() {
    console.log('🔢 CALCULAR MODA ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos || datos.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Datos requeridos',
            text: 'Primero ingresa datos.',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    // Cálculo manual de moda
    const frequencies = {};
    datos.forEach(val => {
        const key = variableType === 'quantitative' ? val : String(val).trim().toLowerCase();
        frequencies[key] = (frequencies[key] || 0) + 1;
    });
    
    const maxFreq = Math.max(...Object.values(frequencies));
    const modas = Object.keys(frequencies).filter(key => frequencies[key] === maxFreq);
    const modaTexto = modas.join(', ');
    const tipoModa = modas.length > 1 ? 'Multimodal' : (modas.length === datos.length ? 'Sin moda única' : 'Unimodal');
    
    console.log('🔢 Moda calculada:', modaTexto);
    
    // Mostrar resultado
    mostrarResultadoCalculo(
        'btn-calcular-moda',
        '🔢 Moda',
        modaTexto,
        '#f72585',
        `
            <p class="explicacion"><strong>Definición:</strong> Valor(es) que aparece(n) con mayor frecuencia</p>
            <div class="detalle-calculo">
                <p><strong>Frecuencias:</strong> ${Object.entries(frequencies).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                <p><strong>Mayor frecuencia:</strong> ${maxFreq}</p>
                <p><strong>Tipo:</strong> ${tipoModa}</p>
            </div>
        `
    );
}

// ✅ FUNCIÓN AUXILIAR PARA MOSTRAR RESULTADOS
function mostrarResultadoCalculo(botonId, titulo, resultado, color, contenidoExtra) {
    const contenedor = crearContenedorResultado(botonId, titulo);
    if (!contenedor) return;
    
    const contenido = `
        <div class="resultado-calculado">
            <p class="resultado-valor" style="font-size: 24px; font-weight: bold; color: ${color}; text-align: center; padding: 10px; background: ${color}10; border-radius: 8px;">
                ${resultado}
            </p>
            ${contenidoExtra}
        </div>
    `;
    
    mostrarResultadoEnContenedor(contenedor, contenido);
    
    // Mostrar alerta de éxito
    Swal.fire({
        title: `${titulo} calculada`,
        html: `<div style="font-size: 1.5rem; text-align: center; color: ${color}; font-weight: bold;">${resultado}</div>`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// ✅ MOSTRAR TABLA DE FRECUENCIAS
function mostrarTablaFrecuencias() {
    console.log('📋 MOSTRAR TABLA ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos || datos.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Datos requeridos',
            text: 'Primero ingresa datos.',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    let frequencies;
    if (variableType === 'quantitative') {
        frequencies = calculateSimpleFrequencias(datos);
        // Llamar a la función de tabla existente
        if (typeof createFrequencyTable === 'function') {
            createFrequencyTable(frequencies, true);
        }
    } else {
        frequencies = calculateQualitativeFrequencias(datos);
        // Llamar a la función de tabla existente
        if (typeof createFrequencyTableWithoutAcc === 'function') {
            createFrequencyTableWithoutAcc(frequencies);
        }
    }
    
    // Mostrar resultado debajo del botón
    const contenedor = crearContenedorResultado('btn-mostrar-tabla', '📋 Tabla de Frecuencias');
    if (contenedor) {
        const tableContainer = document.getElementById('table-container');
        let tablaHTML = tableContainer ? tableContainer.innerHTML : generarTablaHTMLManual(frequencies, datos.length);
        
        mostrarResultadoEnContenedor(contenedor, `
            <div class="tabla-resultado-completa">
                <div class="tabla-info">
                    <p><strong>Total de datos:</strong> ${datos.length}</p>
                    <p><strong>Cantidad de categorías:</strong> ${frequencies.length}</p>
                </div>
                <div class="tabla-con-scroll">
                    ${tablaHTML}
                </div>
            </div>
        `);
    }
    
    Swal.fire({
        icon: 'success',
        title: '¡Tabla generada!',
        text: 'La tabla de frecuencias se ha creado correctamente.',
        timer: 2000,
        showConfirmButton: false
    });
}

// ✅ FUNCIÓN AUXILIAR PARA TABLA MANUAL
function generarTablaHTMLManual(frequencies, totalDatos) {
    let html = `
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
                <tr style="background: #4361ee; color: white;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Valor</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Frecuencia</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Frec. Relativa</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Porcentaje</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    frequencies.forEach(item => {
        const freqRel = (item.frequency / totalDatos).toFixed(4);
        const porcentaje = (item.frequency / totalDatos * 100).toFixed(2);
        html += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.value}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.frequency}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${freqRel}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${porcentaje}%</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    return html;
}

// ✅ FUNCIONES AUXILIARES PARA MOSTRAR RESULTADOS
function crearContenedorResultado(botonId, titulo) {
    const boton = document.getElementById(botonId);
    if (!boton) {
        console.error('❌ Botón no encontrado:', botonId);
        return null;
    }
    
    let contenedorResultado = document.getElementById(`${botonId}-resultado`);
    if (!contenedorResultado) {
        contenedorResultado = document.createElement('div');
        contenedorResultado.id = `${botonId}-resultado`;
        contenedorResultado.className = 'resultado-contenedor';
        
        // Insertar después del botón
        boton.parentNode.insertBefore(contenedorResultado, boton.nextSibling);
    }
    
    return contenedorResultado;
}

function mostrarResultadoEnContenedor(contenedor, contenido) {
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <h4 style="color: #4361ee; margin-bottom: 15px; border-bottom: 2px solid #4361ee; padding-bottom: 5px;">
            ${contenedor.id.replace('btn-calcular-', '').replace('-resultado', '').toUpperCase()}
        </h4>
        <div class="contenido-resultado" style="
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            background: white;
            padding: 20px;
            border-radius: 5px;
            border-left: 4px solid #4361ee;
        ">
            ${contenido}
        </div>
    `;
    
    // Mostrar el contenedor
    contenedor.style.display = 'block';
    contenedor.classList.add('expandido');
    
    console.log('✅ Contenedor mostrado:', contenedor.id);
}

// ✅ FUNCIONES DE SELECCIÓN
function seleccionarVariable(tipo) {
    variableType = tipo;
    window.variableType = tipo;
    
    // Actualizar clases activas
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    console.log('✅ Variable seleccionada:', tipo);
    
    Swal.fire({
        title: 'Tipo de variable seleccionado',
        text: `Variable ${tipo === 'quantitative' ? 'cuantitativa' : 'cualitativa'}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
}

function seleccionarGrafico(tipo) {
    chartType = tipo;
    window.chartType = tipo;
    
    // Actualizar clases activas
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    console.log('✅ Gráfico seleccionado:', tipo);
    
    Swal.fire({
        title: 'Tipo de gráfico seleccionado',
        text: `Gráfico de ${tipo === 'bar' ? 'barras' : tipo === 'pie' ? 'sectores' : 'pictograma'}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
}

// ✅ INICIALIZACIÓN MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Nivel primario inicializado correctamente');
    
    // Inicializar variables globales
    inicializarVariablesGlobales();
    
    // Configurar botón de voz
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            if (typeof cargarDatosPorVoz === 'function') {
                cargarDatosPorVoz();
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Función no disponible',
                    text: 'La función de voz no está disponible en este momento.',
                    confirmButtonColor: '#4361ee'
                });
            }
        });
    }
    // ✅ FUNCIÓN PARA VER PASOS DE RESOLUCIÓN (COMPLETA)
function verPasosResolucion() {
    console.log('📝 VER PASOS DE RESOLUCIÓN ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos || datos.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Datos requeridos',
            text: 'Primero ingresa datos en el campo de texto.',
            confirmButtonColor: '#4361ee'
        });
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    // Generar contenido de pasos según el tipo de variable
    let contenidoPasos = '';
    
    if (variableType === 'qualitative') {
        contenidoPasos = generarPasosCualitativos(datos);
    } else {
        contenidoPasos = generarPasosCuantitativos(datos);
    }
    
    // Mostrar resultado debajo del botón
    const contenedor = crearContenedorResultado('btn-ver-pasos', '📝 Pasos de Resolución');
    if (contenedor) {
        mostrarResultadoEnContenedor(contenedor, `
            <div class="pasos-resolucion-detallados" style="
                max-height: none !important;
                height: auto !important;
                overflow: visible !important;
                min-height: auto !important;
                width: 100%;
            ">
                ${contenidoPasos}
            </div>
        `);
        
        // Forzar visualización completa
        contenedor.style.display = 'block';
        contenedor.style.maxHeight = 'none';
        contenedor.style.overflow = 'visible';
        
        // Scroll suave al contenedor
        setTimeout(() => {
            contenedor.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
        }, 100);
    }
    
    Swal.fire({
        title: '¡Pasos generados!', 
        text: 'Los pasos de resolución se muestran completos.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

function generarPasosCualitativos(datos) {
    const n = datos.length;
    
    // Calcular frecuencias
    const frequencies = {};
    datos.forEach(val => {
        const key = String(val).trim().toLowerCase();
        frequencies[key] = (frequencies[key] || 0) + 1;
    });
    
    // Calcular moda
    const maxFreq = Math.max(...Object.values(frequencies));
    const modas = Object.keys(frequencies).filter(k => frequencies[k] === maxFreq);
    
    return `
        <div style="text-align: left;">
            <h3 style="color: #4361ee; margin-top: 0;">🔤 Variable Cualitativa</h3>
            <p><strong>Datos ingresados:</strong> ${datos.join(', ')}</p>
            <p><strong>Total de datos (n):</strong> ${n}</p>
            
            <hr style="margin: 15px 0;">
            
            <h4 style="color: #7209b7;">📊 Paso 1: Tabla de Frecuencias</h4>
            <ol>
                <li>Identificamos cada categoría única en los datos</li>
                <li>Contamos cuántas veces aparece cada categoría</li>
                <li>Calculamos la frecuencia relativa dividiendo cada frecuencia por el total</li>
            </ol>
            
            <table style="width: 100%; margin: 15px 0; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #4361ee; color: white;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Categoría</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Frecuencia</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Frec. Relativa</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(frequencies).map(key => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${key}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${frequencies[key]}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${(frequencies[key] / n).toFixed(4)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background: #e3f2fd; font-weight: bold;">
                        <td style="padding: 8px; border: 1px solid #ddd;">TOTAL</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${n}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">1.0000</td>
                    </tr>
                </tbody>
            </table>
            
            <hr style="margin: 15px 0;">
            
            <h4 style="color: #f72585;">📢 Paso 2: Calcular la Moda</h4>
            <ol>
                <li>Identificamos la frecuencia más alta: <strong>${maxFreq}</strong></li>
                <li>La(s) categoría(s) con esa frecuencia es/son la moda</li>
                <li><strong>Moda:</strong> <span style="color: #f72585; font-size: 1.1em;">${modas.join(', ')}</span></li>
            </ol>
            
            <div style="background: #fff3cd; padding: 12px; border-radius: 5px; margin-top: 15px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Nota importante:</strong> Para variables cualitativas, solo podemos calcular la <strong>moda</strong>. 
                Las medidas como media y mediana requieren datos numéricos.
            </div>
        </div>
    `;
}

function generarPasosCuantitativos(datos) {
    const n = datos.length;
    const suma = datos.reduce((a, b) => Number(a) + Number(b), 0);
    const media = (suma / n).toFixed(2);
    
    // Mediana
    const sorted = [...datos].map(Number).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    let mediana;
    let pasosMediana = '';
    
    if (sorted.length % 2 === 0) {
        mediana = ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);
        pasosMediana = `
            <li>Como hay ${n} datos (par), tomamos los dos del medio: <strong>${sorted[mid - 1]}</strong> y <strong>${sorted[mid]}</strong></li>
            <li>Promediamos: (${sorted[mid - 1]} + ${sorted[mid]}) ÷ 2 = <strong>${mediana}</strong></li>
        `;
    } else {
        mediana = sorted[mid].toFixed(2);
        pasosMediana = `
            <li>Como hay ${n} datos (impar), tomamos el del medio: <strong>${mediana}</strong></li>
        `;
    }
    
    // Moda
    const frequencies = {};
    datos.forEach(val => {
        const key = String(val).trim();
        frequencies[key] = (frequencies[key] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequencies));
    const modas = Object.keys(frequencies).filter(k => frequencies[k] === maxFreq);
    const moda = modas.length === datos.length ? 'No hay moda única (todos los valores tienen la misma frecuencia)' : modas.join(', ');
    
    return `
        <div style="text-align: left;">
            <h3 style="color: #4361ee; margin-top: 0;">🔢 Variable Cuantitativa</h3>
            <p><strong>Datos ingresados:</strong> ${datos.join(', ')}</p>
            <p><strong>Total de datos (n):</strong> ${n}</p>
            
            <hr style="margin: 15px 0;">
            
            <h4 style="color: #4361ee;">📊 Paso 1: Calcular la Media</h4>
            <ol>
                <li>Sumamos todos los valores:<br>
                    ${datos.join(' + ')} = <strong>${suma.toFixed(2)}</strong>
                </li>
                <li>Dividimos por la cantidad de datos:<br>
                    ${suma.toFixed(2)} ÷ ${n} = <strong style="color: #4361ee; font-size: 1.1em;">${media}</strong>
                </li>
            </ol>
            <div style="background: #e3f2fd; padding: 8px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #4361ee;">
                <strong>📝 Interpretación:</strong> El valor promedio de los datos ingresados es ${media}
            </div>
            
            <hr style="margin: 15px 0;">
            
            <h4 style="color: #7209b7;">🧮 Paso 2: Calcular la Mediana</h4>
            <ol>
                <li>Ordenamos los datos de menor a mayor:<br>
                    <strong>${sorted.join(', ')}</strong>
                </li>
                ${pasosMediana}
            </ol>
            <div style="background: #f3e5f5; padding: 8px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #7209b7;">
                <strong>📝 Interpretación:</strong> La mitad de los datos son menores o iguales a ${mediana}
            </div>
            
            <hr style="margin: 15px 0;">
            
            <h4 style="color: #f72585;">📢 Paso 3: Calcular la Moda</h4>
            <ol>
                <li>Contamos la frecuencia de cada valor:<br>
                    ${Object.entries(frequencies).map(([k, v]) => `${k}: ${v} veces`).join(', ')}
                </li>
                <li>La frecuencia máxima es: <strong>${maxFreq}</strong></li>
                <li>El/los valor(es) con esa frecuencia: <strong style="color: #f72585; font-size: 1.1em;">${moda}</strong></li>
            </ol>
            <div style="background: #fce4ec; padding: 8px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #f72585;">
                <strong>📝 Interpretación:</strong> ${moda.includes('No hay moda única') ? 'Todos los valores aparecen la misma cantidad de veces' : `El valor ${moda} es el que más se repite`}
            </div>
            
            <hr style="margin: 15px 0;">
            
            <div style="background: #d1f2eb; padding: 12px; border-radius: 5px; border-left: 4px solid #00695c;">
                <h4 style="color: #00695c; margin-top: 0;">✅ Resumen de Medidas de Tendencia Central</h4>
                <p><strong>Media:</strong> ${media}</p>
                <p><strong>Mediana:</strong> ${mediana}</p>
                <p><strong>Moda:</strong> ${moda}</p>
            </div>
        </div>
    `;
}

// ✅ HACER FUNCIONES GLOBALES (ACTUALIZADO)
window.verPasosResolucion = verPasosResolucion;
window.descargarResultados = descargarResultados;
window.seleccionarVariable = seleccionarVariable;
window.seleccionarGrafico = seleccionarGrafico;
window.generarGrafico = generarGrafico;
window.mostrarTablaFrecuencias = mostrarTablaFrecuencias;
window.calcularMedia = calcularMedia;
window.calcularMediana = calcularMediana;
window.calcularModa = calcularModa;
window.abrirMaterialTeorico = abrirMaterialTeorico;
window.abrirActividadesInteractivas = abrirActividadesInteractivas;

console.log('✅ nivelprimario.js cargado completamente con pasos de resolución');
    
    // Verificar que las funciones estén disponibles
    console.log('🔍 Verificando funciones disponibles:');
    console.log('- generarGrafico:', typeof generarGrafico);
    console.log('- calcularMedia:', typeof calcularMedia);
    console.log('- calcularMediana:', typeof calcularMediana);
    console.log('- calcularModa:', typeof calcularModa);
    console.log('- mostrarTablaFrecuencias:', typeof mostrarTablaFrecuencias);
});

