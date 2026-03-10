// ==================== CONFIGURACIÓN CUBE.JS ====================
const CUBEJS_API_URL = 'http://localhost:4001/cubejs-api/v1';
const CUBEJS_TOKEN = 'mi_secreto_terciario_2024';

// Inicializar Cube.js (solo si está disponible)
let cubejsApi = null;
try {
    if (typeof cubejs !== 'undefined') {
        cubejsApi = cubejs(CUBEJS_TOKEN, { apiUrl: CUBEJS_API_URL });
        console.log('✅ Cube.js inicializado');
    }
} catch (error) {
    console.log('⚠️ Cube.js no disponible, usando cálculos locales');
}

// ==================== FUNCIONES CUBE.JS ====================
async function loadCubeData(measures, dimensions, filters = []) {
    if (!cubejsApi) {
        console.warn('Cube.js no disponible, retornando datos vacíos');
        return { rawData: () => [] };
    }
    
    try {
        const result = await cubejsApi.load({
            measures,
            dimensions,
            filters
        });
        return result;
    } catch (error) {
        console.error('Error cargando datos de Cube.js:', error);
        return { rawData: () => [] };
    }
}

// Nueva función para dashboard educativo terciario
async function loadEducationalStats() {
    const stats = {
        institutions: { total: 0, byType: {} },
        students: { total: 0, byRegion: {} },
        programs: { total: 0, byField: {} }
    };

    try {
        // Cargar estadísticas de instituciones
        const institutionsData = await loadCubeData(
            ['Institutions.count', 'Institutions.totalStudents'],
            ['Institutions.type', 'Institutions.region']
        );
        
        // Cargar programas académicos
        const programsData = await loadCubeData(
            ['Programs.programCount'],
            ['Programs.field']
        );

        // Procesar datos de instituciones
        institutionsData.rawData().forEach(row => {
            stats.institutions.total = row['Institutions.count'] || stats.institutions.total;
            stats.students.total = row['Institutions.totalStudents'] || stats.students.total;
            
            const type = row['Institutions.type'];
            const region = row['Institutions.region'];
            
            if (type) {
                stats.institutions.byType[type] = (stats.institutions.byType[type] || 0) + 1;
            }
            
            if (region) {
                stats.students.byRegion[region] = row['Institutions.totalStudents'] || 0;
            }
        });

        // Procesar datos de programas
        programsData.rawData().forEach(row => {
            const field = row['Programs.field'];
            const count = row['Programs.programCount'];
            
            if (field && count) {
                stats.programs.byField[field] = count;
                stats.programs.total += count;
            }
        });

        return stats;
    } catch (error) {
        console.error('Error cargando estadísticas educativas:', error);
        return stats;
    }
}

// Función para mostrar dashboard educativo
async function showEducationalDashboard() {
    const stats = await loadEducationalStats();
    
    // Crear o actualizar contenedor del dashboard
    let dashboardContainer = document.getElementById('educational-dashboard');
    if (!dashboardContainer) {
        dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'educational-dashboard';
        dashboardContainer.className = 'educational-dashboard';
        
        // Insertar en algún lugar apropiado
        const mainContent = document.querySelector('.main-contentn1') || document.body;
        mainContent.appendChild(dashboardContainer);
    }
    
    dashboardContainer.innerHTML = `
        <div class="dashboard-header">
            <h3>📊 Dashboard Educación Terciaria</h3>
            <button onclick="toggleDashboard()" class="btn-toggle">🔄</button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🏫</div>
                <div class="stat-value">${stats.institutions.total}</div>
                <div class="stat-label">Instituciones</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">👨‍🎓</div>
                <div class="stat-value">${stats.students.total.toLocaleString()}</div>
                <div class="stat-label">Estudiantes</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-value">${stats.programs.total}</div>
                <div class="stat-label">Programas</div>
            </div>
        </div>
        
        <div class="dashboard-charts">
            <div class="chart-container">
                <h4>Tipos de Institución</h4>
                <div class="chart-placeholder" id="typeChart">
                    ${Object.entries(stats.institutions.byType).map(([type, count]) => 
                        `<div class="chart-bar">
                            <span class="bar-label">${type}</span>
                            <div class="bar" style="width: ${(count / stats.institutions.total) * 100}%">
                                <span class="bar-value">${count}</span>
                            </div>
                        </div>`
                    ).join('')}
                </div>
            </div>
            
            <div class="chart-container">
                <h4>Programas por Área</h4>
                <div class="chart-placeholder" id="programChart">
                    ${Object.entries(stats.programs.byField).map(([field, count]) => 
                        `<div class="chart-bar">
                            <span class="bar-label">${field}</span>
                            <div class="bar" style="width: ${(count / stats.programs.total) * 100}%">
                                <span class="bar-value">${count}</span>
                            </div>
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
}

function toggleDashboard() {
    const dashboard = document.getElementById('educational-dashboard');
    if (dashboard) {
        dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
    }
}
function calculateStatistics(dataArray) {
  const variableType = document.getElementById('variable-type')?.value;

  if (dataArray.length === 0) {
    return {
      media: null,
      mediana: null,
      moda: null,
      cuartiles: null,
      deciles: null,
      percentiles: null,
      varianza: null,
      desviacionEstandar: null,
      rango: null,
      coeficienteVariacion: null
    };
  }

 
  if (variableType === 'qualitative') {
    const frequency = {};
    dataArray.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const maxFrequency = Math.max(...Object.values(frequency));
    const moda = Object.keys(frequency).filter(key => frequency[key] === maxFrequency);
    return {
      media: null,
      mediana: null,
      moda: moda,
      cuartiles: null,
      deciles: null,
      percentiles: null,
      varianza: null,
      desviacionEstandar: null,
      rango: null,
      coeficienteVariacion: null
    };
  }

  const sorted = [...dataArray].sort((a, b) => a - b);

  const media = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

  let mediana;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    mediana = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    mediana = sorted[mid];
  }

  const frequency = {};
  sorted.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
  });
  const maxFrequency = Math.max(...Object.values(frequency));
  const moda = Object.keys(frequency)
    .filter(key => frequency[key] === maxFrequency)
    .map(Number);

  const varianza = dataArray.reduce((sum, value) => sum + Math.pow(value - media, 2), 0) / (dataArray.length - 1);
  const desviacionEstandar = Math.sqrt(varianza);
  const rango = sorted[sorted.length - 1] - sorted[0];
  const coeficienteVariacion = (desviacionEstandar / media) * 100;

  const getPositionValue = (position) => {
    const index = (sorted.length - 1) * position;
    const lower = Math.floor(index);
    const fraction = index - lower;

    if (lower + 1 >= sorted.length) return sorted[lower];
    return sorted[lower] + fraction * (sorted[lower + 1] - sorted[lower]);
  };

  return {
    media: media.toFixed(2),
    mediana: mediana.toFixed(2),
    moda: moda,
    cuartiles: {
      Q1: getPositionValue(0.25).toFixed(2),
      Q2: mediana.toFixed(2),
      Q3: getPositionValue(0.75).toFixed(2)
    },
    deciles: Array.from({ length: 9 }, (_, i) => ({
      decil: i + 1,
      value: getPositionValue((i + 1) / 10).toFixed(2)
    })),
    percentiles: Array.from({ length: 99 }, (_, i) => ({
      percentil: i + 1,
      value: getPositionValue((i + 1) / 100).toFixed(2)
    })),
    varianza: varianza.toFixed(2),
    desviacionEstandar: desviacionEstandar.toFixed(2),
    rango: rango.toFixed(2),
    coeficienteVariacion: coeficienteVariacion.toFixed(2)
  };
}

function renderMath() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
  }
}

function displayStatistics(stats) {
  let statisticsContainer = document.getElementById('statistics-container');
  
  // Si no existe el contenedor, crearlo
  if (!statisticsContainer) {
    console.warn('❌ statistics-container no encontrado, creando uno...');
    statisticsContainer = document.createElement('div');
    statisticsContainer.id = 'statistics-container';
    statisticsContainer.className = 'results-section';
    
    // Insertar en algún lugar apropiado del DOM
    const mainContent = document.querySelector('.main-contentn1') || document.querySelector('main');
    if (mainContent) {
      mainContent.appendChild(statisticsContainer);
    } else {
      // Si no se encuentra main, insertar antes del footer
      const footer = document.querySelector('footer');
      if (footer) {
        footer.parentNode.insertBefore(statisticsContainer, footer);
      }
    }
  }
  
  statisticsContainer.innerHTML = '';
  statisticsContainer.style.display = 'block';
  
  const tipoVariable = document.getElementById('variable-type')?.value;
  
  if (tipoVariable === 'qualitative') {
    const advertencia = document.createElement('div');
    advertencia.className = 'mensaje-advertencia';
    advertencia.innerHTML = `
        <p style="background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 10px; border-radius: 8px; margin-top: 10px;">
        ⚠️ Esta es una variable cualitativa. Solo se puede calcular la <strong>moda</strong> porque el resto de las medidas estadísticas requieren datos numéricos.
        </p>
    `;
    statisticsContainer.appendChild(advertencia);
    
    // Para variables cualitativas, mostrar solo la moda
    const statsDiv = document.createElement('div');
    statsDiv.classList.add('statistics');
    
    statsDiv.innerHTML = `
        <h3>Medida de Tendencia Central:</h3>
        <p><strong>Moda:</strong> ${stats.moda.join(', ')}</p>
        <p><em>La moda es el valor que aparece con mayor frecuencia en los datos.</em></p>
    `;
    
    statisticsContainer.appendChild(statsDiv);
    return; // Salir de la función para variables cualitativas
  }

  // Para variables cuantitativas
  const statsDiv = document.createElement('div');
  statsDiv.classList.add('statistics');
  
  let html = `
      <h3>Medidas de Tendencia Central:</h3>
      <p><strong>Media:</strong> ${stats.media}</p>
      <p><strong>Mediana (Q2):</strong> ${stats.mediana}</p>
      <p><strong>Moda:</strong> ${stats.moda.join(', ')}</p>

      <h3>Medidas de Dispersión:</h3>
      <p><strong>Varianza (s²):</strong> ${stats.varianza}</p>
      <p><strong>Desviación Estándar (s):</strong> ${stats.desviacionEstandar}</p>
      <p><strong>Rango:</strong> ${stats.rango}</p>
      <p><strong>Coeficiente de Variación:</strong> ${stats.coeficienteVariacion}%</p>
  `;

  statsDiv.innerHTML = html;
  statisticsContainer.appendChild(statsDiv);

  // Crear botón para ver pasos de resolución
  const botonPasosTC = document.createElement('button');
  botonPasosTC.innerHTML = `
    <img src="pictogramas/resultado.png" alt="icono robot" class="icono-boton" />
    Ver pasos de resolución
  `;
  botonPasosTC.className = "boton-estadistica fucsia";
  botonPasosTC.style.marginTop = "10px";

  const divPasosTC = document.createElement('div');
  divPasosTC.id = "pasos-tc";
  divPasosTC.className = "pasos-resolucion";
  divPasosTC.style.display = "none";

  statisticsContainer.appendChild(botonPasosTC);
  statisticsContainer.appendChild(divPasosTC);

  // Event listener para el botón de pasos
  botonPasosTC.addEventListener("click", () => {
    const valores = window.datosActuales || [];
    const n = valores.length;

    const varianza = stats.varianza;
    const desviacion = stats.desviacionEstandar;
    const rango = stats.rango;
    const coefVar = stats.coeficienteVariacion;

    const suma = valores.reduce((a, b) => a + b, 0);
    const media = stats.media;

    let interpretacionMedia = '';
    if (Math.min(...valores) === Math.max(...valores)) {
      interpretacionMedia = 'Todos los datos son iguales, por eso la media coincide con cada valor.';
    } else {
      interpretacionMedia = 'La media representa un valor promedio de los datos ingresados.';
    }

    const pasosMedia = `
      Los pasos de resolución son tratados como datos simples para evitar los problemas de aproximación que surgen al trabajar con datos agrupados.
      <br>
      <h4>📊 Media:</h4>
      <ol>
        <li>Sumamos todos los valores:<br>\\( ${valores.join(" + ")} = ${suma.toFixed(2)} \\)</li>
        <li>Dividimos por la cantidad de datos (\\( n = ${n} \\)):<br>\\( \\frac{${suma.toFixed(2)}}{${n}} = ${media} \\)</li>
        <li><em>Interpretación:</em> ${interpretacionMedia}</li>
      </ol>
    `;

    const ordenados = [...valores].sort((a, b) => a - b);
    let interpretacionMediana = '';
    if (n % 2 === 0) {
      interpretacionMediana = 'Como hay una cantidad par de datos, la mediana se calcula promediando los dos valores centrales. Representa el punto medio del conjunto.';
    } else {
      interpretacionMediana = 'Como hay una cantidad impar de datos, la mediana es simplemente el valor que queda en el centro al ordenar los datos.';
    }

    let pasosMediana = `<h4>🧮 Mediana (Q2):</h4><ol><li>Ordenamos los datos: ${ordenados.join(", ")}</li>`;
    if (n % 2 === 0) {
      const medio1 = ordenados[n / 2 - 1];
      const medio2 = ordenados[n / 2];
      const mediana = stats.mediana;
      pasosMediana += `
        <li>Como hay un número par de datos (\\( n = ${n} \\)), tomamos los dos del medio:<br>\\( ${medio1} \\) y \\( ${medio2} \\)</li>
        <li>Calculamos el promedio:<br>\\( \\frac{${medio1} + ${medio2}}{2} = ${mediana} \\)</li>
      `;
    } else {
      const medio = ordenados[Math.floor(n / 2)];
      pasosMediana += `<li>Como hay un número impar de datos (\\( n = ${n} \\)), la mediana es el valor del medio:<br>\\( ${medio} \\)</li>`;
    }

    pasosMediana += `<li><em>Interpretación:</em> ${interpretacionMediana}</li></ol>`;

    const frecuencias = {};
    valores.forEach(v => frecuencias[v] = (frecuencias[v] || 0) + 1);
    const maxFreq = Math.max(...Object.values(frecuencias));
    const modas = Object.keys(frecuencias).filter(k => frecuencias[k] === maxFreq);

    let interpretacionModa = '';
    if (modas.length === valores.length) {
      interpretacionModa = 'Todos los valores aparecen la misma cantidad de veces, por lo tanto no hay una moda definida.';
    } else if (modas.length === 1) {
      interpretacionModa = `La moda es ${modas[0]} porque es el valor que más se repite. Esto indica que es el valor más frecuente en el conjunto de datos.`;
    } else {
      interpretacionModa = `Hay más de una moda (${modas.join(", ")}), lo que indica que varios valores tienen la misma frecuencia máxima. El conjunto es multimodal.`;
    }

    const pasosModa = `
      <h4>🔁 Moda:</h4>
      <ol>
        <li>Contamos cuántas veces aparece cada valor:<br><code>${JSON.stringify(frecuencias)}</code></li>
        <li>El/los valores con mayor frecuencia (\\( ${maxFreq} \\)) es/son:<br>\\( ${modas.join(", ")} \\)</li>
        <li><em>Interpretación:</em> ${interpretacionModa}</li>
      </ol>
    `;

    const diferenciasCuadrado = valores.map(v => Math.pow(v - media, 2));
    const sumaDiferencias = diferenciasCuadrado.reduce((a, b) => a + b, 0);

    let interpretacionVarianza = '';
    if (parseFloat(varianza) === 0) {
      interpretacionVarianza = 'Todos los valores son iguales, por lo tanto no hay dispersión en los datos.';
    } else if (parseFloat(varianza) < 5) {
      interpretacionVarianza = 'La varianza es baja, lo que indica que los datos están agrupados cerca de la media.';
    } else if (parseFloat(varianza) < 20) {
      interpretacionVarianza = 'La varianza es moderada, lo que indica una dispersión media de los datos respecto de la media.';
    } else {
      interpretacionVarianza = 'La varianza es alta, lo que indica que los datos están muy dispersos respecto de la media.';
    }

    const pasosVarianza = `
      <h4>📉 Varianza (s²):</h4>
      <ol>
        <li>Calculamos la diferencia entre cada valor y la media, y elevamos al cuadrado:
          <br>
          ${valores.map(v => `\\( (${v} - ${media})^2 = ${(v - media) ** 2} \\)`).join("<br>")}
        </li>
        <li>Sumamos los resultados y dividimos por \\( n - 1 = ${n - 1} \\):
          <br>
          \\[
            \\frac{${diferenciasCuadrado.map(d => d.toFixed(2)).join(" + ")}}{${n - 1}} = ${varianza}
          \\]
        </li>
        <li><em>Interpretación:</em> ${interpretacionVarianza}</li>
      </ol>
    `;

    let interpretacionDesviacion = '';
    if (parseFloat(desviacion) === 0) {
      interpretacionDesviacion = 'No hay ninguna variación entre los datos, todos los valores son iguales a la media.';
    } else if (parseFloat(desviacion) < 2) {
      interpretacionDesviacion = 'La desviación estándar es baja, los datos están muy cerca del valor medio.';
    } else if (parseFloat(desviacion) < 5) {
      interpretacionDesviacion = 'La desviación estándar es moderada, los datos se dispersan moderadamente alrededor de la media.';
    } else {
      interpretacionDesviacion = 'La desviación estándar es alta, los valores se alejan bastante del promedio.';
    }

    const pasosDesviacion = `
      <h4>📏 Desviación Estándar (s):</h4>
      <ol>
        <li>Obtenemos la raíz cuadrada de la varianza:<br>
          \\[
            \\sqrt{${varianza}} = ${desviacion}
          \\]
        </li>
        <li><em>Interpretación:</em> ${interpretacionDesviacion}</li>
      </ol>
    `;

    const valorMin = Math.min(...valores);
    const valorMax = Math.max(...valores);

    let interpretacionRango = '';
    const rangoNumerico = parseFloat(rango);
    if (rangoNumerico === 0) {
      interpretacionRango = 'Todos los valores son iguales, por lo tanto no hay dispersión.';
    } else if (rangoNumerico < 5) {
      interpretacionRango = 'La diferencia entre el valor más alto y el más bajo es pequeña. Los datos son bastante homogéneos.';
    } else if (rangoNumerico < 15) {
      interpretacionRango = 'Existe una dispersión moderada entre los datos.';
    } else {
      interpretacionRango = 'Hay una gran diferencia entre el valor mínimo y el máximo. Los datos están muy dispersos.';
    }

    const pasosRango = `
      <h4>📊 Rango:</h4>
      <ol>
        <li>Identificamos el valor máximo (${valorMax}) y el mínimo (${valorMin}).</li>
        <li>Restamos el mínimo al máximo:<br>
          \\[
            ${valorMax} - ${valorMin} = ${rango}
          \\]
        </li>
        <li><em>Interpretación:</em> ${interpretacionRango}</li>
      </ol>
    `;

    let interpretacionCV = '';
    const coefVarNum = parseFloat(coefVar);

    if (coefVarNum < 15) {
      interpretacionCV = 'La variabilidad relativa es baja, los datos son bastante consistentes respecto a la media.';
    } else if (coefVarNum < 30) {
      interpretacionCV = 'Existe una variabilidad moderada en relación a la media.';
    } else {
      interpretacionCV = 'Los datos son muy dispersos respecto a la media. La variabilidad relativa es alta.';
    }

    const pasosCoefVar = `
      <h4>📈 Coeficiente de Variación:</h4>
      <ol>
        <li>Dividimos la desviación estándar entre la media y multiplicamos por 100 para obtener el porcentaje:<br>
          \\[
            \\frac{${desviacion}}{${media}} \\times 100 = ${coefVar}\\%
          \\]
        </li>
        <li><em>Interpretación:</em> ${interpretacionCV}</li>
      </ol>
    `;

    divPasosTC.innerHTML = `
      <div class="bloque-pasos">
        ${pasosMedia}
        ${pasosMediana}
        ${pasosModa}
        ${pasosVarianza}
        ${pasosDesviacion}
        ${pasosRango}
        ${pasosCoefVar}
      </div>
    `;
    
    renderMath();
    divPasosTC.style.display = divPasosTC.style.display === "none" ? "block" : "none";
  });
}

function traducirMedida(tipo) {
  switch (tipo) {
    case 'percentile': return 'percentil';
    case 'decile': return 'decil';
    case 'quartile': return 'cuartil';
    default: return tipo;
  }
}
