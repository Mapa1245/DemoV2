// nivelprimario.js - VERSIÓN CORREGIDA COMPLETA

let variableType = 'quantitative';
let chartType = 'bar';
let datosActuales = [];

// ✅ SINCRONIZACIÓN MEJORADA
function sincronizarDatosGlobales(datos) {
    datosActuales = datos;
    window.datosActuales = datos;
    window.variableType = variableType;
    window.chartType = chartType;
    
    console.log('🔄 Datos sincronizados:', datos);
    console.log('📊 Tipo variable:', variableType);
}

// ✅ FUNCIÓN MEJORADA PARA PROCESAR DATOS
function procesarDatosInput() {
    const dataInput = document.getElementById('data-input');
    if (!dataInput || !dataInput.value.trim()) {
        return null;
    }
    
    const inputText = dataInput.value.trim();
    const datos = inputText.split(/[\s,]+/)
        .map(item => item.trim())
        .filter(item => item !== '');
    
    if (datos.length === 0) {
        return null;
    }
    
    // Convertir a números si es cuantitativa
    if (variableType === 'quantitative') {
        return datos.map(item => {
            const num = Number(item);
            return isNaN(num) ? 0 : num;
        });
    }
    
    return datos;
}

// ✅ GENERAR GRÁFICO CORREGIDO
function generarGrafico() {
    console.log('🎯 GENERAR GRÁFICO ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos) {
        Swal.fire('Error', 'Por favor ingresa algunos datos primero', 'warning');
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
        Swal.fire('Error', 'No se pudieron calcular las frecuencias', 'error');
        return;
    }
    
    // Mostrar gráfico
    const chartCanvas = document.getElementById('chart-canvas');
    const pictogramaContainer = document.getElementById('pictograma-container');
    
    if (chartType === 'pictograma') {
        pictogramaContainer.classList.remove('hidden');
        pictogramaContainer.style.display = 'block';
        chartCanvas.style.display = 'none';
        
        if (typeof crearGraficoPictograma === 'function') {
            crearGraficoPictograma(frequencies, 'pictograma-container');
        }
    } else {
        chartCanvas.classList.remove('hidden');
        chartCanvas.style.display = 'block';
        pictogramaContainer.style.display = 'none';
        
        if (typeof createChart === 'function') {
            createChart(frequencies, chartType);
        }
    }
    
    Swal.fire('¡Éxito!', 'Gráfico generado correctamente', 'success');
}

// ✅ FUNCIONES DE CÁLCULO MANUALES (como fallback)
function calculateSimpleFrequencias(dataArray) {
    const frequencies = {};
    dataArray.forEach(num => {
        frequencies[num] = (frequencies[num] || 0) + 1;
    });

    return Object.keys(frequencies)
        .map(Number)
        .sort((a, b) => a - b)
        .map(num => ({ value: num, frequency: frequencies[num] }));
}

function calculateQualitativeFrequencias(dataArray) {
    const frequencies = {};
    dataArray.forEach(val => {
        const cleaned = val.trim().toLowerCase();
        frequencies[cleaned] = (frequencies[cleaned] || 0) + 1;
    });

    return Object.keys(frequencies)
        .sort()
        .map(cat => ({ value: cat, frequency: frequencies[cat] }));
}

// ✅ CALCULAR MEDIA
function calcularMedia() {
    console.log('📐 CALCULAR MEDIA ejecutado');
    
    if (variableType === 'qualitative') {
        Swal.fire('No aplicable', 'La media solo se calcula para variables cuantitativas.', 'info');
        return;
    }
    
    const datos = procesarDatosInput();
    if (!datos) {
        Swal.fire('Error', 'Primero ingresa datos numéricos.', 'error');
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    // Cálculo manual de media
    const suma = datos.reduce((a, b) => a + b, 0);
    const media = (suma / datos.length).toFixed(2);
    
    // Mostrar resultado
    const contenedor = crearContenedorResultado('btn-calcular-media', '📊 Media');
    if (contenedor) {
        mostrarResultadoEnContenedor(contenedor, `
            <div class="media-resultado">
                <p class="resultado-valor" style="font-size: 24px; font-weight: bold; color: #4361ee;">${media}</p>
                <p class="explicacion"><strong>Fórmula:</strong> Suma de valores ÷ Cantidad de valores</p>
                <div class="detalle-calculo">
                    <p><strong>Cálculo:</strong> (${datos.join(' + ')}) ÷ ${datos.length} = ${media}</p>
                    <p><strong>Total de datos:</strong> ${datos.length}</p>
                </div>
            </div>
        `);
    }
    
    Swal.fire({
        title: 'Media calculada',
        html: `<div style="font-size: 2rem; text-align: center; color: #4361ee;">${media}</div>`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// ✅ CALCULAR MEDIANA
function calcularMediana() {
    console.log('📏 CALCULAR MEDIANA ejecutado');
    
    if (variableType === 'qualitative') {
        Swal.fire('No aplicable', 'La mediana solo se calcula para variables cuantitativas.', 'info');
        return;
    }
    
    const datos = procesarDatosInput();
    if (!datos) {
        Swal.fire('Error', 'Primero ingresa datos numéricos.', 'error');
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    // Cálculo manual de mediana
    const sorted = [...datos].sort((a, b) => a - b);
    let mediana;
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        mediana = ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);
    } else {
        mediana = sorted[mid].toFixed(2);
    }
    
    // Mostrar resultado
    const contenedor = crearContenedorResultado('btn-calcular-mediana', '📏 Mediana');
    if (contenedor) {
        mostrarResultadoEnContenedor(contenedor, `
            <div class="mediana-resultado">
                <p class="resultado-valor" style="font-size: 24px; font-weight: bold; color: #7209b7;">${mediana}</p>
                <p class="explicacion"><strong>Definición:</strong> Valor central de los datos ordenados</p>
                <div class="detalle-calculo">
                    <p><strong>Datos ordenados:</strong> ${sorted.join(', ')}</p>
                    <p><strong>Posición central:</strong> ${sorted.length % 2 === 0 ? 
                        `Posiciones ${mid} y ${mid + 1}` : 
                        `Posición ${mid + 1}`}</p>
                </div>
            </div>
        `);
    }
    
    Swal.fire({
        title: 'Mediana calculada',
        html: `<div style="font-size: 2rem; text-align: center; color: #7209b7;">${mediana}</div>`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// ✅ CALCULAR MODA
function calcularModa() {
    console.log('🔢 CALCULAR MODA ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos) {
        Swal.fire('Error', 'Primero ingresa datos.', 'error');
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
    
    // Mostrar resultado
    const contenedor = crearContenedorResultado('btn-calcular-moda', '🔢 Moda');
    if (contenedor) {
        mostrarResultadoEnContenedor(contenedor, `
            <div class="moda-resultado">
                <p class="resultado-valor" style="font-size: 24px; font-weight: bold; color: #f72585;">${modaTexto}</p>
                <p class="explicacion"><strong>Definición:</strong> Valor(es) que aparece(n) con mayor frecuencia</p>
                <div class="detalle-calculo">
                    <p><strong>Frecuencias:</strong> ${Object.entries(frequencies).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                    <p><strong>Mayor frecuencia:</strong> ${maxFreq}</p>
                    <p><strong>Tipo:</strong> ${modas.length > 1 ? 'Multimodal' : 'Unimodal'}</p>
                </div>
            </div>
        `);
    }
    
    Swal.fire({
        title: 'Moda calculada',
        html: `<div style="font-size: 1.5rem; text-align: center; color: #f72585;">${modaTexto}</div>`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// ✅ MOSTRAR TABLA DE FRECUENCIAS
function mostrarTablaFrecuencias() {
    console.log('📋 MOSTRAR TABLA ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos) {
        Swal.fire('Error', 'Primero ingresa datos.', 'error');
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    let frequencies;
    if (variableType === 'quantitative') {
        frequencies = calculateSimpleFrequencias(datos);
        createFrequencyTable(frequencies, true);
    } else {
        frequencies = calculateQualitativeFrequencias(datos);
        createFrequencyTableWithoutAcc(frequencies);
    }
    
    // Mostrar resultado debajo del botón
    const contenedor = crearContenedorResultado('btn-mostrar-tabla', '📋 Tabla de Frecuencias');
    if (contenedor) {
        const tableContainer = document.getElementById('table-container');
        let tablaHTML = tableContainer ? tableContainer.innerHTML : '<p>No se pudo generar la tabla</p>';
        
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
    
    Swal.fire('¡Tabla generada!', 'La tabla de frecuencias se ha creado correctamente.', 'success');
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
        contenedorResultado.innerHTML = `<h4>${titulo}</h4>`;
        
        boton.parentNode.insertBefore(contenedorResultado, boton.nextSibling);
    }
    
    return contenedorResultado;
}

function mostrarResultadoEnContenedor(contenedor, contenido) {
    if (!contenedor) return;
    
    const titulo = contenedor.querySelector('h4');
    contenedor.innerHTML = '';
    if (titulo) contenedor.appendChild(titulo);
    
    const contenidoDiv = document.createElement('div');
    contenidoDiv.className = 'contenido-resultado';
    contenidoDiv.innerHTML = contenido;
    contenedor.appendChild(contenidoDiv);
    
    contenedor.style.display = 'block';
}

// ✅ FUNCIONES DE SELECCIÓN
function seleccionarVariable(tipo) {
    variableType = tipo;
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
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
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
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

// ✅ FUNCIONES DE NAVEGACIÓN
function abrirMaterialTeorico() {
    window.open('material.html', '_blank');
}

function abrirActividadesInteractivas() {
    Swal.fire({
        title: 'Actividades Interactivas',
        html: `
            <div style="text-align: left;">
                <p><strong>Próximamente:</strong></p>
                <ul>
                    <li>🧩 Juego de clasificación de datos</li>
                    <li>🎯 Actividad de conteo y frecuencia</li>
                    <li>📊 Construcción de gráficos interactivos</li>
                    <li>🎮 Retos estadísticos</li>
                </ul>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

// ✅ INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Nivel primario inicializado correctamente');
    
    // Configurar botón de voz
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', cargarDatosPorVoz);
    }
    
    // Verificar que las funciones estén disponibles
    console.log('🔍 Verificando funciones disponibles:');
    console.log('- generarGrafico:', typeof generarGrafico);
    console.log('- calcularMedia:', typeof calcularMedia);
    console.log('- calcularMediana:', typeof calcularMediana);
    console.log('- calcularModa:', typeof calcularModa);
});
// En la función descargarResultados, reemplaza con:
function descargarResultados() {
    const datos = procesarDatosInput();
    if (!datos) {
        Swal.fire('Error', 'No hay datos para descargar. Primero ingresa datos.', 'error');
        return;
    }
    
    sincronizarDatosGlobales(datos);
    
    console.log('📥 Iniciando descarga...');
    
    if (typeof handlePDFDownload === 'function') {
        handlePDFDownload();
    } else {
        Swal.fire('Error', 'Función de descarga no disponible', 'error');
    }
}// AGREGAR ESTA FUNCIÓN AL FINAL DE nivelprimario.js

// ✅ FUNCIÓN PARA VER PASOS DE RESOLUCIÓN
// ✅ FUNCIÓN PARA VER PASOS DE RESOLUCIÓN (VERSIÓN MEJORADA)
function verPasosResolucion() {
    console.log('📝 VER PASOS DE RESOLUCIÓN ejecutado');
    
    const datos = procesarDatosInput();
    if (!datos) {
        Swal.fire('Error', 'Primero ingresa datos.', 'error');
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
    
    // Mostrar resultado debajo del botón (igual que los demás)
    const contenedor = crearContenedorResultado('btn-ver-pasos', '📝 Pasos de Resolución');
    if (contenedor) {
        mostrarResultadoEnContenedor(contenedor, `
            <div class="pasos-resolucion-detallados">
                ${contenidoPasos}
            </div>
        `);
    }
    
    Swal.fire('¡Pasos generados!', 'Los pasos de resolución se han creado correctamente.', 'success');
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
    const moda = modas.length === datos.length ? 'No hay moda única' : modas.join(', ');
    
    return `
        <div style="text-align: left; max-height: 500px; overflow-y: auto;">
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
                <strong>📝 Interpretación:</strong> En promedio, los valores son ${media}
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
                <strong>📝 Interpretación:</strong> ${moda === 'No hay moda única' ? 'Todos los valores aparecen la misma cantidad de veces' : `El valor ${moda} es el que más se repite`}
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

// Hacer función disponible globalmente
window.verPasosResolucion = verPasosResolucion;

console.log('✅ Función verPasosResolucion agregada correctamente');

// Y hazla global
window.descargarResultados = descargarResultados;
// ✅ HACER FUNCIONES GLOBALES
window.seleccionarVariable = seleccionarVariable;
window.seleccionarGrafico = seleccionarGrafico;
window.generarGrafico = generarGrafico;
window.mostrarTablaFrecuencias = mostrarTablaFrecuencias;
window.calcularMedia = calcularMedia;
window.calcularMediana = calcularMediana;
window.calcularModa = calcularModa;
window.abrirMaterialTeorico = abrirMaterialTeorico;
window.abrirActividadesInteractivas = abrirActividadesInteractivas;