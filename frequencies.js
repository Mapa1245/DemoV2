function formatNumber(num) {
  return Number.isInteger(num) ? num : num.toFixed(3);
}

function calcularFrecuencias() {
  const variableType = document.getElementById('variable-type')?.value;

  let frequencies;
  if (variableType === 'quantitative') {
    frequencies = calculateSimpleFrequencies(window.datosActuales);
  } else {
    frequencies = calculateQualitativeFrequencies(window.datosActuales);
  }

  return frequencies;
}

window.calcularFrecuencias = calcularFrecuencias;

function calculateSimpleFrequencies(dataArray) {
  const frequencies = {};
  dataArray.forEach(num => {
    frequencies[num] = (frequencies[num] || 0) + 1;
  });

  const sorted = Object.keys(frequencies)
    .map(Number)
    .sort((a, b) => a - b)
    .map(num => ({ value: num, frequency: frequencies[num] }));

  return sorted;
}

function calculateGroupedFrequencies(dataArray) {
    if (dataArray.length === 0) return [];

    const sortedData = [...dataArray].sort((a, b) => a - b);
    const min = Math.floor(sortedData[0]);
    const max = Math.ceil(sortedData[sortedData.length - 1]);

    let k;
    const inputK = document.getElementById('interval-count')?.value;
    if (inputK && !isNaN(inputK) && parseInt(inputK) > 0) {
        k = parseInt(inputK);
    } else {
        k = Math.ceil(1 + 3.322 * Math.log10(sortedData.length));
    }

    const range = max - min;
    const amplitude = range / k;

    const intervals = [];
    for (let i = 0; i < k; i++) {
        const start = min + i * amplitude;
        const end = i === k - 1 ? max + 1 : start + amplitude;

        intervals.push({
            start,
            end,
            label: `[${formatNumber(start)} - ${formatNumber(end)})`,
            frequency: 0
        });
    }

    sortedData.forEach(value => {
        for (let interval of intervals) {
            if (value >= interval.start && value < interval.end) {
                interval.frequency++;
                break;
            }
        }
    });

    return intervals;
}

function createGroupedTable(intervals) {
  const tableContainer = document.getElementById('table-container');
  if (!tableContainer) {
    console.warn('❌ No se encontró table-container');
    return;
  }

  tableContainer.innerHTML = '';

  const total = intervals.reduce((sum, i) => sum + i.frequency, 0);
  let faAcumulada = 0;
  let frAcumulada = 0;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Intervalo</th>
      <th>Marca de clase ($x_i$)</th>
      <th>Frecuencia</th>
      <th>$f_{r}$</th>
      <th>F. Acumulada</th>
      <th>$f_{r}$ Acum.</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  intervals.forEach(interval => {
    const fr = interval.frequency / total;
    faAcumulada += interval.frequency;
    frAcumulada += fr;
    
    const marcaClase = (interval.start + interval.end) / 2;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>[${formatNumber(interval.start)} - ${formatNumber(interval.end)})</td>
      <td>${formatNumber(marcaClase)}</td>
      <td>${interval.frequency}</td>
      <td>${fr.toFixed(3)}</td>
      <td>${faAcumulada}</td>
      <td>${frAcumulada.toFixed(3)}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);

  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
  }
}

function createFrequencyTable(frequencies, isNumeric = true) {
  const tableContainer = document.getElementById('table-container');
  if (!tableContainer) {
    console.warn('❌ No se encontró table-container');
    return;
  }

  tableContainer.innerHTML = '';

  const total = frequencies.reduce((sum, row) => sum + row.frequency, 0);
  let faAcumulada = 0;
  let frAcumulada = 0;

  const table = document.createElement('table');
  table.className = 'tabla-frecuencias-completa'; // Agregar clase para estilos
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Valor</th>
      <th>Frecuencia (f)</th>
      <th>Frec. Relativa (fr)</th>
      ${isNumeric ? '<th>F. Acumulada</th><th>Fr. Acumulada</th>' : ''}
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  
  frequencies.forEach(row => {
    const fr = row.frequency / total;
    if (isNumeric) {
      faAcumulada += row.frequency;
      frAcumulada += fr;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.value}</td>
      <td>${row.frequency}</td>
      <td>${fr.toFixed(4)}</td>
      ${isNumeric ? 
        `<td>${faAcumulada}</td>
         <td>${frAcumulada.toFixed(4)}</td>` : ''}
    `;
    tbody.appendChild(tr);
  });

  // Agregar fila de totales si es numérica
  if (isNumeric) {
    const trTotal = document.createElement('tr');
    trTotal.className = 'total-row';
    trTotal.innerHTML = `
      <td><strong>Total</strong></td>
      <td><strong>${total}</strong></td>
      <td><strong>1.0000</strong></td>
      <td></td>
      <td></td>
    `;
    tbody.appendChild(trTotal);
  }

  table.appendChild(tbody);
  tableContainer.appendChild(table);

  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
  }
}

function calculateQualitativeFrequencies(dataArray) {
  const frequencies = {};
  dataArray.forEach(val => {
    const cleaned = val.trim().toLowerCase(); 
    frequencies[cleaned] = (frequencies[cleaned] || 0) + 1;
  });

  const total = dataArray.length;
  const sorted = Object.keys(frequencies).sort().map(cat => {
    return {
      value: cat,
      frequency: frequencies[cat],
      relFreq: frequencies[cat] / total
    };
  });

  return sorted;
}

function createFrequencyTableWithoutAcc(frequencies) {
  const tableContainer = document.getElementById('table-container');
  if (!tableContainer) {
    console.warn('❌ No se encontró table-container');
    return;
  }

  tableContainer.innerHTML = '';

  const total = frequencies.reduce((sum, row) => sum + row.frequency, 0);

  const table = document.createElement('table');
  table.className = 'tabla-frecuencias-completa';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Categoría</th>
      <th>Frecuencia (f)</th>
      <th>Frec. Relativa (fr)</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  
  frequencies.forEach(row => {
    const fr = row.frequency / total;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.value}</td>
      <td>${row.frequency}</td>
      <td>${fr.toFixed(4)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Fila de totales
  const trTotal = document.createElement('tr');
  trTotal.className = 'total-row';
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td><strong>${total}</strong></td>
    <td><strong>1.0000</strong></td>
  `;
  tbody.appendChild(trTotal);

  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

window.calculateQualitativeFrequencies = calculateQualitativeFrequencies;
window.calculateSimpleFrequencies = calculateSimpleFrequencies;
window.calculateGroupedFrequencies = calculateGroupedFrequencies;
window.createFrequencyTable = createFrequencyTable;
window.createGroupedTable = createGroupedTable;
window.createFrequencyTableWithoutAcc = createFrequencyTableWithoutAcc;