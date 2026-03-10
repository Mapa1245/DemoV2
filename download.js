// download.js - VERSIÓN COMPLETAMENTE CORREGIDA

function setupPDFDownload() {
  const downloadBtn = document.getElementById('download-pdf-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', handlePDFDownload);
  }
}

async function handlePDFDownload() {
  try {
    const datos = window.datosActuales || [];
    
    if (!datos || datos.length === 0) {
      Swal.fire('Error', 'No hay datos para exportar. Primero ingresa datos.', 'error');
      return;
    }

    if (!validateExportContent()) {
      Swal.fire('Error', 'No hay resultados visibles para exportar. Genera al menos un gráfico o cálculo.', 'warning');
      return;
    }

    const { value: accept } = await Swal.fire({
      title: '¿Descargar PDF?',
      html: `Se generará un PDF con los resultados visibles`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, descargar',
      cancelButtonText: 'Cancelar'
    });

    if (!accept) return;

    const swalInstance = Swal.fire({
      title: 'Generando PDF',
      html: 'Procesando gráficos, tablas y resultados...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const exportElement = await createExportContent();
    
    const pdfOptions = getPDFOptions();
    
    await html2pdf()
      .set(pdfOptions)
      .from(exportElement)
      .save();
    
    swalInstance.close();
    Swal.fire('¡PDF Listo!', 'Documento descargado correctamente', 'success');
    
  } catch (error) {
    console.error('Error en generación de PDF:', error);
    Swal.fire('Error', 'No se pudo generar el PDF: ' + error.message, 'error');
  }
}

function validateExportContent() {
  // Verificar si hay gráfico visible
  const chartCanvas = document.getElementById('myChart');
  const pictogramaContainer = document.getElementById('pictograma-container');
  const hasChart = (chartCanvas && window.currentChart) || 
                   (pictogramaContainer && pictogramaContainer.style.display !== 'none');
  
  // Verificar si hay tabla
  const tableContainer = document.getElementById('table-container');
  const hasTable = tableContainer && tableContainer.querySelector('table');
  
  // Verificar si hay resultados visibles
  const hasMedia = document.getElementById('btn-calcular-media-resultado')?.style.display !== 'none';
  const hasMediana = document.getElementById('btn-calcular-mediana-resultado')?.style.display !== 'none';
  const hasModa = document.getElementById('btn-calcular-moda-resultado')?.style.display !== 'none';
  
  // VERIFICACIÓN MEJORADA DE PASOS DE RESOLUCIÓN
  const pasosResultado = document.getElementById('btn-ver-pasos-resultado');
  const hasPasos = pasosResultado && 
                   pasosResultado.style.display !== 'none' && 
                   pasosResultado.innerHTML.trim() !== '' &&
                   !pasosResultado.innerHTML.includes('No hay pasos de resolución');

  console.log('🔍 Validación de contenido para PDF:');
  console.log('- Gráfico:', hasChart);
  console.log('- Tabla:', hasTable);
  console.log('- Media:', hasMedia);
  console.log('- Mediana:', hasMediana);
  console.log('- Moda:', hasModa);
  console.log('- Pasos:', hasPasos);

  return hasChart || hasTable || hasMedia || hasMediana || hasModa || hasPasos;
}

async function createExportContent() {
  const exportContainer = document.createElement('div');
  exportContainer.style.padding = '20px';
  exportContainer.style.fontFamily = 'Arial, sans-serif';
  
  addExportHeader(exportContainer);
  
  addDataSummary(exportContainer);
  
  await addChartToExport(exportContainer);
  
  addStatisticsToExport(exportContainer);
  
  addFrequencyTableToExport(exportContainer);
  
  await addStepsToExport(exportContainer); // Ahora es async
  
  addExportFooter(exportContainer);
  
  return exportContainer;
}

function addExportHeader(container) {
  const header = document.createElement('div');
  header.innerHTML = `
    <h1 style="text-align: center; color: #4361ee; margin-bottom: 5px; font-size: 24pt;">
      EstadísticaMente
    </h1>
    <div style="text-align: center; color: #666; margin-bottom: 20px; font-size: 12pt;">
      Reporte de Resultados
    </div>
  `;
  container.appendChild(header);
}

function addDataSummary(container) {
  const datos = window.datosActuales || [];
  const tipoVariable = window.variableType || 'quantitative';
  
  const summary = document.createElement('div');
  summary.style.marginBottom = '20px';
  summary.style.padding = '15px';
  summary.style.backgroundColor = '#f8f9fa';
  summary.style.borderLeft = '4px solid #4361ee';
  summary.style.borderRadius = '4px';
  
  summary.innerHTML = `
    <h2 style="color: #4361ee; font-size: 14pt; margin-top: 0;">📊 Datos Generales</h2>
    <p style="margin: 5px 0;"><strong>Total de datos:</strong> ${datos.length}</p>
    <p style="margin: 5px 0;"><strong>Tipo de variable:</strong> ${tipoVariable === 'quantitative' ? 'Cuantitativa' : 'Cualitativa'}</p>
    <p style="margin: 5px 0;"><strong>Datos ingresados:</strong></p>
    <p style="margin: 5px 0; font-family: monospace; background: white; padding: 8px; border-radius: 3px; word-wrap: break-word;">${datos.join(', ')}</p>
  `;
  
  container.appendChild(summary);
}

async function addChartToExport(container) {
  const chartSection = document.createElement('div');
  chartSection.style.marginBottom = '30px';
  chartSection.style.pageBreakInside = 'avoid';
  
  let imageData = null;
  
  // Intentar capturar gráfico de Chart.js
  const chartCanvas = document.getElementById('myChart');
  if (chartCanvas && window.currentChart) {
    imageData = chartCanvas.toDataURL('image/png', 1.0);
  }
  
  // Si no hay Chart.js, intentar capturar pictograma
  if (!imageData) {
    const pictogramaContainer = document.getElementById('pictograma-container');
    if (pictogramaContainer && pictogramaContainer.style.display !== 'none') {
      try {
        const canvas = await html2canvas(pictogramaContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        imageData = canvas.toDataURL('image/png', 1.0);
      } catch (error) {
        console.error('Error capturando pictograma:', error);
      }
    }
  }
  
  if (imageData) {
    const chartTitle = document.createElement('h2');
    chartTitle.textContent = '📈 Gráfico Generado';
    chartTitle.style.textAlign = 'center';
    chartTitle.style.marginBottom = '15px';
    chartTitle.style.color = '#4361ee';
    chartTitle.style.fontSize = '14pt';
    
    const imgElement = document.createElement('img');
    imgElement.src = imageData;
    imgElement.style.maxWidth = '100%';
    imgElement.style.height = 'auto';
    imgElement.style.display = 'block';
    imgElement.style.margin = '0 auto';
    imgElement.style.border = '2px solid #e0e0e0';
    imgElement.style.borderRadius = '8px';
    imgElement.style.padding = '10px';
    imgElement.style.backgroundColor = 'white';
    
    chartSection.appendChild(chartTitle);
    chartSection.appendChild(imgElement);
    container.appendChild(chartSection);
  }
}

function addStatisticsToExport(container) {
  const statsSection = document.createElement('div');
  statsSection.style.marginBottom = '20px';
  statsSection.style.pageBreakInside = 'avoid';
  
  let hasStats = false;
  const statsHTML = [];
  const statsValues = { media: null, mediana: null, moda: null };
  
  // Capturar Media
  const mediaResultado = document.getElementById('btn-calcular-media-resultado');
  if (mediaResultado && mediaResultado.style.display !== 'none') {
    const valorMedia = mediaResultado.querySelector('.resultado-valor');
    if (valorMedia) {
      const valor = valorMedia.textContent.trim();
      statsValues.media = valor;
      statsHTML.push(`
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Media</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace; text-align: center; font-size: 16pt; color: #4361ee;">${valor}</td>
        </tr>
      `);
      hasStats = true;
    }
  }
  
  // Capturar Mediana
  const medianaResultado = document.getElementById('btn-calcular-mediana-resultado');
  if (medianaResultado && medianaResultado.style.display !== 'none') {
    const valorMediana = medianaResultado.querySelector('.resultado-valor');
    if (valorMediana) {
      const valor = valorMediana.textContent.trim();
      statsValues.mediana = valor;
      statsHTML.push(`
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Mediana</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace; text-align: center; font-size: 16pt; color: #7209b7;">${valor}</td>
        </tr>
      `);
      hasStats = true;
    }
  }
  
  // Capturar Moda
  const modaResultado = document.getElementById('btn-calcular-moda-resultado');
  if (modaResultado && modaResultado.style.display !== 'none') {
    const valorModa = modaResultado.querySelector('.resultado-valor');
    if (valorModa) {
      const valor = valorModa.textContent.trim();
      statsValues.moda = valor;
      statsHTML.push(`
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Moda</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace; text-align: center; font-size: 16pt; color: #f72585;">${valor}</td>
        </tr>
      `);
      hasStats = true;
    }
  }
  
  if (hasStats) {
    const statsTitle = document.createElement('h2');
    statsTitle.textContent = '📐 Medidas de Tendencia Central';
    statsTitle.style.textAlign = 'center';
    statsTitle.style.marginBottom = '15px';
    statsTitle.style.color = '#4361ee';
    statsTitle.style.fontSize = '14pt';
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '10px 0';
    
    table.innerHTML = `
      <thead>
        <tr style="background: #4361ee; color: white;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left; width: 40%;">Medida</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 60%;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${statsHTML.join('')}
      </tbody>
    `;
    
    statsSection.appendChild(statsTitle);
    statsSection.appendChild(table);
    
    // Agregar resumen destacado si hay las 3 medidas
    if (statsValues.media && statsValues.mediana && statsValues.moda) {
      const resumen = document.createElement('div');
      resumen.style.marginTop = '20px';
      resumen.style.padding = '15px';
      resumen.style.background = 'linear-gradient(135deg, #d1f2eb 0%, #a8e6cf 100%)';
      resumen.style.borderRadius = '8px';
      resumen.style.border = '2px solid #00695c';
      
      resumen.innerHTML = `
        <h3 style="color: #00695c; margin-top: 0; text-align: center; font-size: 13pt;">
          ✅ Resumen de Medidas de Tendencia Central
        </h3>
        <div style="display: table; width: 100%; margin-top: 10px;">
          <div style="display: table-row;">
            <div style="display: table-cell; padding: 8px; text-align: center; border-right: 1px solid #00695c;">
              <strong style="color: #4361ee;">Media:</strong><br>
              <span style="font-size: 18pt; color: #4361ee; font-weight: bold;">${statsValues.media}</span>
            </div>
            <div style="display: table-cell; padding: 8px; text-align: center; border-right: 1px solid #00695c;">
              <strong style="color: #7209b7;">Mediana:</strong><br>
              <span style="font-size: 18pt; color: #7209b7; font-weight: bold;">${statsValues.mediana}</span>
            </div>
            <div style="display: table-cell; padding: 8px; text-align: center;">
              <strong style="color: #f72585;">Moda:</strong><br>
              <span style="font-size: 18pt; color: #f72585; font-weight: bold;">${statsValues.moda}</span>
            </div>
          </div>
        </div>
      `;
      
      statsSection.appendChild(resumen);
    }
    
    container.appendChild(statsSection);
  }
}

function addFrequencyTableToExport(container) {
  const tableContainer = document.getElementById('table-container');
  
  // Verificar si existe y tiene contenido
  if (!tableContainer) {
    console.log('⚠️ No se encontró table-container');
    return;
  }
  
  const tableElement = tableContainer.querySelector('table');
  if (!tableElement) {
    console.log('⚠️ No hay tabla dentro de table-container');
    return;
  }
  
  console.log('✅ Tabla de frecuencias encontrada, agregando al PDF');
  
  const tableSection = document.createElement('div');
  tableSection.style.marginBottom = '30px';
  tableSection.style.pageBreakInside = 'avoid';
  
  const tableTitle = document.createElement('h2');
  tableTitle.textContent = '📋 Tabla de Frecuencias';
  tableTitle.style.textAlign = 'center';
  tableTitle.style.marginBottom = '15px';
  tableTitle.style.color = '#4361ee';
  tableTitle.style.fontSize = '14pt';
  
  // Clonar la tabla y asegurar estilos
  const clonedTable = tableElement.cloneNode(true);
  clonedTable.style.width = '100%';
  clonedTable.style.borderCollapse = 'collapse';
  clonedTable.style.margin = '10px 0';
  clonedTable.style.fontSize = '11pt';
  
  // Asegurar que todas las celdas tengan bordes
  const allCells = clonedTable.querySelectorAll('th, td');
  allCells.forEach(cell => {
    cell.style.padding = '8px';
    cell.style.border = '1px solid #ddd';
  });
  
  // Asegurar que el thead tenga fondo
  const thead = clonedTable.querySelector('thead');
  if (thead) {
    const thCells = thead.querySelectorAll('th');
    thCells.forEach(th => {
      th.style.backgroundColor = '#4361ee';
      th.style.color = 'white';
      th.style.fontWeight = 'bold';
    });
  }
  
  // Alternar colores en las filas del tbody
  const tbody = clonedTable.querySelector('tbody');
  if (tbody) {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
      if (!row.classList.contains('total-row')) {
        row.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white';
      } else {
        // Fila de totales
        row.style.backgroundColor = '#e3f2fd';
        row.style.fontWeight = 'bold';
      }
    });
  }
  
  tableSection.appendChild(tableTitle);
  tableSection.appendChild(clonedTable);
  container.appendChild(tableSection);
  
  console.log('✅ Tabla de frecuencias agregada al contenedor de exportación');
}

async function addStepsToExport(container) {
  const pasosResultado = document.getElementById('btn-ver-pasos-resultado');
  
  if (!pasosResultado || pasosResultado.style.display === 'none') {
    console.log('⚠️ No hay pasos de resolución visibles para exportar');
    return;
  }

  console.log('📝 Procesando pasos de resolución para PDF...');
  
  const stepsSection = document.createElement('div');
  stepsSection.style.marginBottom = '30px';
  stepsSection.style.pageBreakBefore = 'always';
  
  const stepsTitle = document.createElement('h2');
  stepsTitle.textContent = '📝 Pasos de Resolución';
  stepsTitle.style.textAlign = 'center';
  stepsTitle.style.marginBottom = '15px';
  stepsTitle.style.color = '#4361ee';
  stepsTitle.style.fontSize = '14pt';
  
  const stepsContent = document.createElement('div');
  stepsContent.style.border = '2px solid #e0e0e0';
  stepsContent.style.borderRadius = '8px';
  stepsContent.style.padding = '20px';
  stepsContent.style.backgroundColor = '#f8f9fa';
  stepsContent.style.fontSize = '11pt';
  stepsContent.style.lineHeight = '1.4';

  try {
    // ESTRATEGIA 1: Capturar contenido del contenedor de resultados
    let contenidoHTML = '';
    
    // Buscar el contenido de pasos en diferentes ubicaciones posibles
    const contenidoPasos = pasosResultado.querySelector('.contenido-resultado');
    if (contenidoPasos) {
      console.log('✅ Encontrado .contenido-resultado');
      
      // Clonar el contenido para no afectar el original
      const clone = contenidoPasos.cloneNode(true);
      
      // Limpiar elementos no deseados
      const elementosRemover = clone.querySelectorAll('button, .lector-resolucion-btn, .btn, script, style');
      elementosRemover.forEach(el => el.remove());
      
      // Aplicar estilos para PDF
      aplicarEstilosPasosPDF(clone);
      
      contenidoHTML = clone.innerHTML;
    } else {
      // ESTRATEGIA 2: Usar el contenido interno completo
      console.log('⚠️ No se encontró .contenido-resultado, usando contenido interno');
      const clone = pasosResultado.cloneNode(true);
      
      // Remover botones y elementos no deseados
      const elementosRemover = clone.querySelectorAll('button, .lector-resolucion-btn, .btn, script, style');
      elementosRemover.forEach(el => el.remove());
      
      // Remover el título duplicado si existe
      const titulos = clone.querySelectorAll('h4');
      titulos.forEach(titulo => titulo.remove());
      
      aplicarEstilosPasosPDF(clone);
      
      contenidoHTML = clone.innerHTML;
    }

    // ESTRATEGIA 3: Si aún no hay contenido, usar html2canvas como último recurso
    if (!contenidoHTML || contenidoHTML.trim() === '' || contenidoHTML.length < 100) {
      console.log('🔄 Usando html2canvas para capturar pasos...');
      try {
        const canvas = await html2canvas(pasosResultado, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0
        });
        
        const imageData = canvas.toDataURL('image/png', 1.0);
        contenidoHTML = `<img src="${imageData}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" alt="Pasos de resolución" />`;
        console.log('✅ Pasos capturados como imagen');
      } catch (canvasError) {
        console.error('Error capturando pasos con html2canvas:', canvasError);
        contenidoHTML = '<p style="text-align: center; color: #666;">No se pudieron cargar los pasos de resolución en el PDF.</p>';
      }
    }

    // Verificar que el contenido sea válido
    if (!contenidoHTML || contenidoHTML.trim() === '' || contenidoHTML.includes('No hay pasos de resolución')) {
      contenidoHTML = `
        <div style="text-align: center; color: #666; padding: 40px;">
          <p>No hay pasos de resolución disponibles para exportar.</p>
          <p>Genera los pasos primero haciendo clic en "Ver pasos de resolución".</p>
        </div>
      `;
    }

    stepsContent.innerHTML = contenidoHTML;
    
  } catch (error) {
    console.error('❌ Error procesando pasos para PDF:', error);
    stepsContent.innerHTML = `
      <div style="text-align: center; color: #dc3545; padding: 20px;">
        <p>Error al cargar los pasos de resolución.</p>
        <p>Intenta generar los pasos nuevamente.</p>
      </div>
    `;
  }

  stepsSection.appendChild(stepsTitle);
  stepsSection.appendChild(stepsContent);
  container.appendChild(stepsSection);
  
  console.log('✅ Pasos de resolución agregados al PDF');
}

// Función auxiliar para aplicar estilos a los pasos en PDF
function aplicarEstilosPasosPDF(elemento) {
  // Estilos para listas
  const listas = elemento.querySelectorAll('ol, ul');
  listas.forEach(lista => {
    lista.style.margin = '12px 0';
    lista.style.paddingLeft = '25px';
  });

  // Estilos para párrafos
  const parrafos = elemento.querySelectorAll('p');
  parrafos.forEach(p => {
    p.style.margin = '8px 0';
    p.style.lineHeight = '1.5';
  });

  // Estilos para títulos
  const titulos = elemento.querySelectorAll('h3, h4');
  titulos.forEach(titulo => {
    titulo.style.margin = '16px 0 8px 0';
    titulo.style.paddingBottom = '6px';
    titulo.style.borderBottom = '2px solid #4361ee';
    titulo.style.color = '#4361ee';
  });

  // Estilos para tablas
  const tablas = elemento.querySelectorAll('table');
  tablas.forEach(tabla => {
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
    tabla.style.margin = '12px 0';
    tabla.style.fontSize = '10pt';
    
    const celdas = tabla.querySelectorAll('th, td');
    celdas.forEach(celda => {
      celda.style.padding = '8px';
      celda.style.border = '1px solid #ddd';
      celda.style.textAlign = 'left';
    });
    
    const encabezados = tabla.querySelectorAll('th');
    encabezados.forEach(th => {
      th.style.backgroundColor = '#4361ee';
      th.style.color = 'white';
      th.style.fontWeight = 'bold';
    });
    
    // Alternar colores en filas
    const filas = tabla.querySelectorAll('tr');
    filas.forEach((fila, index) => {
      if (index % 2 === 0) {
        fila.style.backgroundColor = '#f8f9fa';
      }
    });
  });

  // Estilos para elementos destacados
  const destacados = elemento.querySelectorAll('.detalle-calculo, .explicacion, .tabla-info');
  destacados.forEach(destacado => {
    destacado.style.background = '#e3f2fd';
    destacado.style.padding = '10px';
    destacado.style.borderRadius = '5px';
    destacado.style.margin = '10px 0';
    destacado.style.borderLeft = '4px solid #2196F3';
  });

  // Estilos para resultados
  const resultados = elemento.querySelectorAll('.resultado-valor');
  resultados.forEach(resultado => {
    resultado.style.fontSize = '16pt';
    resultado.style.fontWeight = 'bold';
    resultado.style.margin = '10px 0';
  });
}

function addExportFooter(container) {
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.marginTop = '30px';
  footer.style.color = '#666';
  footer.style.fontSize = '10pt';
  footer.style.borderTop = '2px solid #e0e0e0';
  footer.style.paddingTop = '15px';
  footer.innerHTML = `
    <p style="margin: 5px 0;"><strong>Generado el:</strong> ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
    <p style="margin: 5px 0;">EstadísticaMente - Herramienta educativa</p>
  `;
  container.appendChild(footer);
}

function getPDFOptions() {
  return {
    margin: [15, 15],
    filename: `estadisticamente_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break' 
    }
  };
}

// FUNCIÓN DE DIAGNÓSTICO MEJORADA
function diagnosticarProblemaPDF() {
  const datos = window.datosActuales || [];
  const chartCanvas = document.getElementById('myChart');
  const pictogramaContainer = document.getElementById('pictograma-container');
  const tableContainer = document.getElementById('table-container');
  const pasosResultado = document.getElementById('btn-ver-pasos-resultado');
  
  const mediaVisible = document.getElementById('btn-calcular-media-resultado')?.style.display !== 'none';
  const medianaVisible = document.getElementById('btn-calcular-mediana-resultado')?.style.display !== 'none';
  const modaVisible = document.getElementById('btn-calcular-moda-resultado')?.style.display !== 'none';
  
  // Diagnóstico detallado de pasos
  let diagnosticoPasos = '❌ No existe';
  if (pasosResultado) {
    const tieneContenido = pasosResultado.style.display !== 'none';
    const contenidoHTML = pasosResultado.innerHTML;
    const contenidoTexto = pasosResultado.textContent || '';
    
    diagnosticoPasos = `
      ✅ Existe<br>
      - Visible: ${tieneContenido ? '✅ Sí' : '❌ No'}<br>
      - Longitud HTML: ${contenidoHTML.length} caracteres<br>
      - Longitud texto: ${contenidoTexto.length} caracteres<br>
      - Tiene .contenido-resultado: ${!!pasosResultado.querySelector('.contenido-resultado') ? '✅ Sí' : '❌ No'}
    `;
  }

  const info = `
    <div style="text-align: left; max-height: 500px; overflow-y: auto;">
      <h4>Diagnóstico Completo del Sistema de PDF</h4>
      
      <h5>📊 Contenido Disponible:</h5>
      <p><strong>Datos cargados:</strong> ${datos.length}</p>
      <p><strong>Chart.js activo:</strong> ${window.currentChart ? '✅ Sí' : '❌ No'}</p>
      <p><strong>Pictograma visible:</strong> ${pictogramaContainer && pictogramaContainer.style.display !== 'none' ? '✅ Sí' : '❌ No'}</p>
      <p><strong>Tabla disponible:</strong> ${tableContainer && tableContainer.querySelector('table') ? '✅ Sí' : '❌ No'}</p>
      
      <h5>📐 Resultados Visibles:</h5>
      <p><strong>Media:</strong> ${mediaVisible ? '✅ Visible' : '❌ No visible'}</p>
      <p><strong>Mediana:</strong> ${medianaVisible ? '✅ Visible' : '❌ No visible'}</p>
      <p><strong>Moda:</strong> ${modaVisible ? '✅ Visible' : '❌ No visible'}</p>
      
      <h5>📝 Pasos de Resolución:</h5>
      <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
        ${diagnosticoPasos}
      </div>
      
      <hr>
      <p><strong>¿Puede exportar?</strong> ${validateExportContent() ? '✅ SÍ' : '❌ NO'}</p>
      
      <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 5px;">
        <strong>💡 Solución rápida:</strong><br>
        Si los pasos no se exportan, intenta:<br>
        1. Generar los pasos nuevamente<br>
        2. Verificar que estén visibles en pantalla<br>
        3. Usar el botón "Diagnosticar Pasos" para más detalles
      </div>
    </div>
  `;
  
  Swal.fire({
    title: 'Diagnóstico PDF',
    html: info,
    icon: validateExportContent() ? 'success' : 'warning',
    width: '600px'
  });
}

// NUEVA FUNCIÓN PARA DIAGNÓSTICO ESPECÍFICO DE PASOS
function diagnosticarPasosPDF() {
  const pasosResultado = document.getElementById('btn-ver-pasos-resultado');
  
  if (!pasosResultado) {
    Swal.fire('Error', 'No se encontró el contenedor de pasos de resolución.', 'error');
    return;
  }

  const contenidoPasos = pasosResultado.querySelector('.contenido-resultado');
  const contenidoHTML = pasosResultado.innerHTML;
  const contenidoTexto = pasosResultado.textContent || '';
  
  const info = `
    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
      <h4>Diagnóstico Específico - Pasos de Resolución</h4>
      
      <p><strong>Elemento existe:</strong> ✅ Sí</p>
      <p><strong>Está visible:</strong> ${pasosResultado.style.display !== 'none' ? '✅ Sí' : '❌ No'}</p>
      <p><strong>Tiene .contenido-resultado:</strong> ${contenidoPasos ? '✅ Sí' : '❌ No'}</p>
      <p><strong>Longitud HTML:</strong> ${contenidoHTML.length} caracteres</p>
      <p><strong>Longitud texto:</strong> ${contenidoTexto.length} caracteres</p>
      
      <h5>Vista previa del contenido (primeros 300 caracteres):</h5>
      <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 10px; max-height: 150px; overflow-y: auto;">
        ${contenidoTexto.substring(0, 300)}...
      </div>
      
      <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">
        <strong>🔧 Acciones recomendadas:</strong><br>
        1. Asegúrate de que los pasos estén generados y visibles<br>
        2. Si el contenido es muy largo, el PDF podría dividirlo en páginas<br>
        3. Verifica que no haya errores en la consola del navegador
      </div>
    </div>
  `;
  
  Swal.fire({
    title: 'Diagnóstico Pasos PDF',
    html: info,
    width: '700px',
    confirmButtonText: 'Entendido'
  });
}

// Función para capturar solo el gráfico
async function capturarSoloGrafico() {
  try {
    let imageData = null;
    
    const chartCanvas = document.getElementById('myChart');
    if (chartCanvas && window.currentChart) {
      imageData = chartCanvas.toDataURL('image/png', 1.0);
    } else {
      const pictogramaContainer = document.getElementById('pictograma-container');
      if (pictogramaContainer && pictogramaContainer.style.display !== 'none') {
        const canvas = await html2canvas(pictogramaContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        imageData = canvas.toDataURL('image/png', 1.0);
      }
    }
    
    if (!imageData) {
      Swal.fire('Error', 'No hay gráfico visible para capturar', 'warning');
      return;
    }
    
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.textAlign = 'center';
    content.innerHTML = `
      <h1 style="color: #4361ee;">EstadísticaMente - Gráfico</h1>
      <img src="${imageData}" style="max-width: 100%; height: auto; margin: 20px 0;" />
      <p style="color: #666;">Generado el ${new Date().toLocaleString('es-ES')}</p>
    `;
    
    const options = {
      margin: 10,
      filename: `grafico_estadisticamente_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    await html2pdf().set(options).from(content).save();
    
    Swal.fire('¡Éxito!', 'Gráfico exportado como PDF', 'success');
    
  } catch (error) {
    console.error('Error capturando gráfico:', error);
    Swal.fire('Error', 'No se pudo exportar el gráfico', 'error');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', setupPDFDownload);

// Hacer funciones globales
window.handlePDFDownload = handlePDFDownload;
window.diagnosticarProblemaPDF = diagnosticarProblemaPDF;
window.diagnosticarPasosPDF = diagnosticarPasosPDF;
window.capturarSoloGrafico = capturarSoloGrafico;

console.log('✅ download.js cargado - VERSIÓN COMPLETAMENTE CORREGIDA');