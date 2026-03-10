// voz.js - VERSIÓN CORREGIDA Y SIMPLIFICADA (SIN EMOJIS)
class VoiceInput {
  constructor(inputElement, buttonElement) {
    this.input = inputElement;
    this.button = buttonElement;
    this.recognition = null;
    this.speech = null;
    this.isListening = false;
    this.isReading = false;
    this.currentVariableType = 'quantitative';
    this.lastTranscript = '';
    this.awaitingVariableType = false;
    
    this.init();
  }

  init() {
    // Verificar compatibilidad del navegador
    if (!('webkitSpeechRecognition' in window)) {
      this.disableButton('Voz no disponible');
      console.warn('Reconocimiento de voz no disponible en este navegador');
      return;
    }

    // Configurar reconocimiento de voz
    this.setupRecognition();
    
    // Configurar síntesis de voz si está disponible
    if ('speechSynthesis' in window) {
      this.speech = window.speechSynthesis;
    }

    this.setupEvents();
    console.log('✅ VoiceInput inicializado correctamente');
  }

  setupRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.lang = 'es-ES';
      this.recognition.interimResults = false;
      this.recognition.continuous = true;
      this.recognition.maxAlternatives = 3;
      
      this.recognition.onresult = (event) => this.handleResult(event);
      this.recognition.onerror = (event) => this.handleError(event.error);
      this.recognition.onend = () => {
        console.log('Reconocimiento finalizado');
        if (this.isListening) {
          console.log('Reiniciando reconocimiento...');
          setTimeout(() => {
            try {
              this.recognition.start();
            } catch (e) {
              console.error('Error al reiniciar:', e);
            }
          }, 100);
        }
      };
      
      this.recognition.onstart = () => {
        console.log('Reconocimiento iniciado');
      };
      
    } catch (error) {
      console.error('Error al configurar reconocimiento:', error);
      this.disableButton('Error en configuración');
    }
  }

  setupEvents() {
    // Evento principal del botón de voz
    this.button.addEventListener('click', () => {
      console.log('Botón de datos por voz clickeado');
      this.startListening();
    });
  }

  startListening() {
    if (this.isListening) {
      console.log('Ya está escuchando, deteniendo...');
      this.stopListening();
      return;
    }
    
    try {
      console.log('Iniciando reconocimiento de voz...');
      this.isListening = true;
      this.updateButtonState(true);
      this.lastTranscript = '';
      this.awaitingVariableType = true;
      
      // Actualizar tipo de variable actual
      this.updateVariableType();
      
      // Mostrar instrucciones
      Swal.fire({
        title: '¿Qué vas a ingresar?',
        html: `<div style="font-size:1.2rem;margin-bottom:10px;">
                Di <strong>"números"</strong> para datos cuantitativos<br>
                O <strong>"palabras"</strong> para cualitativos
              </div>`,
        timer: 5000,
        showConfirmButton: false,
        background: '#4361ee',
        color: 'white'
      });
      
      // Iniciar reconocimiento
      this.recognition.start();
      
    } catch (error) {
      console.error('Error al iniciar reconocimiento:', error);
      this.showFeedback('Error', 'No se pudo iniciar el reconocimiento de voz', 'error');
      this.stopListening();
    }
  }

  stopListening() {
    if (!this.isListening) return;
    
    console.log('Deteniendo reconocimiento...');
    this.isListening = false;
    this.updateButtonState(false);
    this.awaitingVariableType = false;
    
    try {
      this.recognition.stop();
    } catch (e) {
      console.log('Error al detener:', e);
    }
    
    this.showFeedback('Reconocimiento detenido', 'El sistema ha dejado de escuchar', 'info');
  }

  handleResult(event) {
    if (!this.isListening) return;
    
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim().toLowerCase();
    
    if (transcript === this.lastTranscript) return;
    this.lastTranscript = transcript;
    
    console.log('Transcripción recibida:', transcript);
    
    // PRIMERO verificar comandos de control globales
    if (transcript.includes('leer pantalla') || transcript.includes('leer página')) {
      console.log('Comando de lectura detectado');
      this.startReading();
      return;
    }
    
    if (transcript.includes('leer resultados') || transcript.includes('resultados')) {
      console.log('Comando de leer resultados detectado');
      this.readCurrentResults();
      return;
    }

    if (transcript.includes('leer pasos') || transcript.includes('leer resolución')) {
      console.log('Comando de leer pasos detectado');
      this.readResolucionSteps();
      return;
    }
    
    if (transcript.includes('detener lectura') || transcript.includes('parar lectura') || transcript.includes('detener')) {
      console.log('Comando de detener lectura detectado');
      this.stopReading();
      return;
    }
    
    if (transcript.includes('ayuda') || transcript.includes('qué puedo hacer') || transcript.includes('help')) {
      console.log('Comando de ayuda detectado');
      this.provideContextHelp();
      return;
    }
    
    // LUEGO verificar si quiere detener el reconocimiento
    if (transcript.includes('listo') || transcript.includes('terminar')) {
      console.log('Comando de detener reconocimiento detectado');
      this.stopListening();
      return;
    }
    
    // SOLO DESPUÉS procesar selección de tipo de variable
    if (this.awaitingVariableType) {
      console.log('Procesando selección de tipo de variable');
      this.handleVariableTypeSelection(transcript);
      return;
    }
    
    // FINALMENTE procesar datos según el tipo de variable
    console.log('Procesando datos del tipo:', this.currentVariableType);
    if (this.currentVariableType === 'quantitative') {
      const numbers = this.processNumbers(transcript);
      if (numbers && numbers.length > 0) {
        this.insertData(numbers);
        this.showFeedback(
          '✓ Datos reconocidos', 
          `Se agregaron: <strong>${numbers.join(', ')}</strong>`, 
          'success'
        );
      } else {
        this.showFeedback(
          'Formato incorrecto', 
          'Ejemplos válidos:<br>"cinco punto tres" → 5.3<br>"veinte punto cinco" → 20.5', 
          'error'
        );
      }
    } else {
      const words = this.processWords(transcript);
      if (words && words.length > 0) {
        this.insertData(words);
        this.showFeedback('✓ Palabras reconocidas', words.join(', '), 'success');
      } else {
        this.showFeedback('No se reconocieron palabras', 'Di algo como: "rojo, azul, verde"', 'error');
      }
    }
  }

  // FUNCIÓN PARA LIMPIAR EMOJIS
  cleanEmojis(text) {
    if (!text) return '';
    
    // Expresión regular para eliminar emojis y símbolos especiales
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{1F1E0}-\u{1F1FF}]/gu;
    
    // Eliminar emojis y limpiar espacios
    let cleanText = text.replace(emojiRegex, '');
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText;
  }

  // FUNCIÓN PARA LEER PANTALLA
  startReading() {
    console.log('Iniciando lectura de pantalla...');
    
    if (!this.speech) {
      this.showFeedback('Error', 'La síntesis de voz no está disponible en este navegador', 'error');
      return;
    }

    const pageContent = this.getScreenContent();
    console.log('Contenido a leer:', pageContent);
    
    if (!pageContent || pageContent.trim() === '') {
      this.showFeedback('Error', 'No hay contenido para leer', 'error');
      return;
    }

    this.speakText(pageContent);
    this.showFeedback('Leyendo pantalla', 'El contenido se está leyendo en voz alta', 'info');
  }

  // FUNCIÓN PARA LEER RESULTADOS ACTUALES
  readCurrentResults() {
    if (!this.speech) {
      this.showFeedback('Error', 'La síntesis de voz no está disponible', 'error');
      return;
    }

    let resultadosText = 'Resultados actuales: ';
    
    // Verificar datos en el textarea
    const dataInput = document.getElementById('data-input');
    if (dataInput && dataInput.value) {
      resultadosText += `Datos ingresados: ${dataInput.value}. `;
    } else {
      resultadosText += 'No hay datos ingresados. ';
    }
    
    // Verificar resultados de cálculos visibles
    const resultados = document.querySelectorAll('.resultado-contenedor:not([style*="display: none"])');
    if (resultados.length > 0) {
      resultadosText += 'Se encontraron los siguientes resultados: ';
      resultados.forEach((resultado, index) => {
        const titulo = resultado.querySelector('h4')?.textContent || `Resultado ${index + 1}`;
        const contenido = resultado.textContent.replace(/\s+/g, ' ').substring(0, 100);
        resultadosText += `${titulo}: ${contenido}. `;
      });
    } else {
      resultadosText += 'No hay resultados visibles. ';
    }
    
    // Limpiar emojis antes de leer
    resultadosText = this.cleanEmojis(resultadosText);
    
    this.speakText(resultadosText);
    this.showFeedback('Leyendo resultados', 'Los resultados actuales se están leyendo', 'info');
  }

  // FUNCIÓN PARA LEER PASOS DE RESOLUCIÓN
  readResolucionSteps() {
    if (!this.speech) {
      this.showFeedback('Error', 'La síntesis de voz no está disponible', 'error');
      return;
    }

    const contenedorPasos = document.getElementById('btn-ver-pasos-resultado');
    if (!contenedorPasos || contenedorPasos.style.display === 'none' || contenedorPasos.innerHTML.trim() === '') {
      this.showFeedback('Primero genera los pasos', 'Haz clic en "Ver pasos de resolución" antes de leerlos', 'warning');
      return;
    }

    const textoPasos = this.extraerTextoPasos(contenedorPasos);
    if (textoPasos) {
      this.speakText(textoPasos);
      this.showFeedback('Leyendo pasos', 'Los pasos de resolución se están leyendo', 'info');
    } else {
      this.showFeedback('No hay contenido', 'No se encontraron pasos de resolución para leer', 'error');
    }
  }

  extraerTextoPasos(contenedor) {
    // Clonar el contenedor para no afectar el DOM original
    const clone = contenedor.cloneNode(true);
    
    // Remover elementos que no queremos leer
    const elementosNoLeer = clone.querySelectorAll('button, .btn, .lector-resolucion-btn, script, style, img, .btn-icon');
    elementosNoLeer.forEach(el => el.remove());
    
    // Obtener el texto limpio
    let texto = clone.textContent || clone.innerText || '';
    
    // Limpiar emojis del texto
    texto = this.cleanEmojis(texto);
    
    // Limpiar espacios y formato
    texto = texto.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
    
    // Limpiar texto excesivo
    if (texto.length > 2000) {
      texto = texto.substring(0, 2000) + '... [Contenido continuará]';
    }
    
    return texto || null;
  }

  stopReading() {
    console.log('Deteniendo lectura...');
    this.isReading = false;
    
    if (this.speech) {
      this.speech.cancel();
    }
    
    this.showFeedback('Lectura detenida', 'La lectura ha sido cancelada', 'info');
  }

  // FUNCIÓN CORREGIDA PARA LEER TEXTO (SIN EMOJIS)
  speakText(text) {
    if (!this.speech) {
      console.error('Síntesis de voz no disponible');
      return;
    }

    // Cancelar cualquier lectura previa
    this.speech.cancel();

    // Limpiar emojis antes de leer
    const cleanText = this.cleanEmojis(text);
    
    console.log('Texto original:', text.substring(0, 100));
    console.log('Texto limpio:', cleanText.substring(0, 100));

    if (!cleanText || cleanText.trim() === '') {
      console.warn('Texto vacío después de limpiar emojis');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log('Comenzando a leer:', cleanText.substring(0, 50) + '...');
      this.isReading = true;
    };

    utterance.onend = () => {
      console.log('Lectura finalizada');
      this.isReading = false;
    };

    utterance.onerror = (event) => {
      console.error('Error en síntesis de voz:', event);
      this.isReading = false;
    };

    this.speech.speak(utterance);
  }

  handleVariableTypeSelection(transcript) {
    console.log('Procesando selección de tipo:', transcript);
    
    const numericKeywords = ['número', 'numeros', 'numeral', 'cuantitativa', 'cantidad', 'dígito', 'dígitos'];
    const wordKeywords = ['palabra', 'palabras', 'cualitativa', 'texto', 'categoría', 'categorias'];
    
    if (numericKeywords.some(keyword => transcript.includes(keyword))) {
      this.currentVariableType = 'quantitative';
      this.selectVariableButton('quantitative');
      this.awaitingVariableType = false;
      this.showFeedback(
        'Modo numérico activado', 
        'Ahora di los números<br>Ej: "cinco punto tres" o "veinte punto cinco"', 
        'info'
      );
    } 
    else if (wordKeywords.some(keyword => transcript.includes(keyword))) {
      this.currentVariableType = 'qualitative';
      this.selectVariableButton('qualitative');
      this.awaitingVariableType = false;
      this.showFeedback(
        'Modo palabras activado', 
        'Ahora di las palabras<br>Ej: "rojo, azul, verde"', 
        'info'
      );
    }
    else {
      this.showFeedback(
        'No entendí', 
        'Di claramente:<br><strong>"números"</strong> o <strong>"palabras"</strong>', 
        'error'
      );
    }
  }

  selectVariableButton(type) {
    // Remover clase active de todos los botones de variable
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Agregar clase active al botón correspondiente
    const targetBtn = document.querySelector(`.option-btn[onclick*="${type}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
      // También disparar el click para activar la funcionalidad
      targetBtn.click();
    }
  }

  processNumbers(text) {
    console.log('Procesando números:', text);
    
    const numberMap = {
      'cero': '0', 'uno': '1', 'un': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
      'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
      'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14', 'quince': '15',
      'dieciséis': '16', 'diecisiete': '17', 'dieciocho': '18', 'diecinueve': '19',
      'veinte': '20', 'veintiuno': '21', 'veintidós': '22', 'veintitrés': '23',
      'veinticuatro': '24', 'veinticinco': '25', 'veintiséis': '26', 'veintisiete': '27',
      'veintiocho': '28', 'veintinueve': '29', 'treinta': '30', 'treinta y uno': '31',
      'cuarenta': '40', 'cincuenta': '50', 'sesenta': '60', 'setenta': '70', 
      'ochenta': '80', 'noventa': '90', 'cien': '100', 'ciento': '100', 
      'doscientos': '200', 'mil': '1000', 'medio': '0.5', 'cuarto': '0.25',
      'tercio': '0.33', 'décima': '0.1', 'centésima': '0.01'
    };

    let processedText = text.toLowerCase()
      .replace(/[,;]/g, ' ')  
      .replace(/\s+y\s+/g, ' ')
      .replace(/\s+/g, ' ')   
      .trim();

    // Convertir "punto" a decimal
    processedText = processedText.replace(/(\d+)\s+(punto|coma)\s+(\d+)/g, '$1.$3');

    // Reemplazar palabras por números
    Object.keys(numberMap).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      processedText = processedText.replace(regex, numberMap[word]);
    });

    // Buscar números
    const numberRegex = /-?\d*\.?\d+/g;
    const matches = processedText.match(numberRegex);

    console.log('Números encontrados:', matches);
    return matches ? matches.map(Number).filter(num => !isNaN(num)) : [];
  }

  processWords(text) {
    console.log('Procesando palabras:', text);
    
    const words = text
      .toLowerCase()
      .replace(/[.,;¿?¡!]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0 && word.length > 1)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));

    const uniqueWords = words.filter((word, index, self) => self.indexOf(word) === index);
    
    console.log('Palabras únicas:', uniqueWords);
    return uniqueWords;
  }

  insertData(items) {
    if (!items || items.length === 0) return;
    
    console.log('Insertando datos:', items);
    
    const newData = items.join(', ');
    
    if (this.input.value) {
      this.input.value += this.input.value.endsWith(',') ? ' ' : ', ';
    }
    
    this.input.value += newData;
    
    // Disparar evento para notificar cambios
    const event = new Event('input', { bubbles: true });
    this.input.dispatchEvent(event);
    
    console.log('Datos insertados correctamente');
  }

  showFeedback(title, html, type = 'success') {
    const colors = {
      success: '#4caf50',
      error: '#f44336',
      info: '#4361ee'
    };
    
    Swal.fire({
      title: title,
      html: `<div style="font-size:1.1rem;text-align:left;">${html}</div>`,
      timer: type === 'error' ? 4000 : 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top',
      background: colors[type] || '#4361ee',
      color: 'white',
      width: '26em'
    });
  }

  handleError(error) {
    console.error('Error de reconocimiento:', error);
    
    const errorMessages = {
      'no-speech': 'No se detectó voz. Intenta nuevamente.',
      'audio-capture': 'No se pudo acceder al micrófono. Verifica los permisos.',
      'not-allowed': 'Permiso para usar el micrófono denegado.',
      'network': 'Error de conexión. Verifica tu internet.',
      'language-not-supported': 'Idioma no soportado.',
      'service-not-allowed': 'Servicio de reconocimiento no disponible.'
    };
    
    this.showFeedback(
      '✖ Error', 
      errorMessages[error] || `Error: ${error}`, 
      'error'
    );
    
    this.stopListening();
  }

  updateVariableType() {
    // Determinar el tipo de variable basado en los botones activos
    const quantitativeBtn = document.querySelector('.option-btn[onclick*="quantitative"]');
    const qualitativeBtn = document.querySelector('.option-btn[onclick*="qualitative"]');
    
    if (quantitativeBtn && quantitativeBtn.classList.contains('active')) {
      this.currentVariableType = 'quantitative';
    } else if (qualitativeBtn && qualitativeBtn.classList.contains('active')) {
      this.currentVariableType = 'qualitative';
    }
    // Por defecto, usar cuantitativa si no hay botones activos
    else {
      this.currentVariableType = 'quantitative';
    }
    
    console.log('Tipo de variable actualizado:', this.currentVariableType);
  }

  updateButtonState(listening) {
    if (listening) {
      this.button.classList.add('listening');
      this.button.innerHTML = '🎤 Escuchando...';
      this.button.style.background = '#f44336';
      this.button.style.color = 'white';
    } else {
      this.button.classList.remove('listening');
      this.button.innerHTML = '🎤 Cargar datos por voz';
      this.button.style.background = '';
      this.button.style.color = '';
    }
  }

  disableButton(text) {
    this.button.disabled = true;
    this.button.innerHTML = `🎤 ${text}`;
    this.button.style.background = '#6c757d';
  }

  getScreenContent() {
    let content = '';
    const currentPage = window.location.pathname.split('/').pop() || 'nivelinicial.html';

    console.log('Generando contenido para página:', currentPage);

    if (currentPage === 'nivelinicial.html') {
      content = this.getNivelPrimarioContent();
    } else {
      content = this.getGenericContent();
    }

    // Limpiar emojis del contenido final
    content = this.cleanEmojis(content);
    
    return content;
  }

  getNivelPrimarioContent() {
    const title = document.querySelector('.main-title')?.textContent || 'Nivel Primario';
    
    // Obtener todas las secciones importantes
    const sectionTitles = document.querySelectorAll('.section-subtitle');
    let sectionsText = '';
    
    sectionTitles.forEach(section => {
      sectionsText += section.textContent + '. ';
    });

    // Información sobre datos actuales
    const dataInput = document.getElementById('data-input');
    let dataInfo = '';
    if (dataInput) {
      dataInfo = dataInput.value ? 
        ` Datos actuales ingresados: ${dataInput.value}.` : 
        ' Aún no hay datos ingresados.';
    }

    // Información sobre selecciones
    const activeVariable = document.querySelector('.option-btn.active');
    let variableInfo = '';
    if (activeVariable) {
      const btnText = activeVariable.querySelector('.btn-text') || activeVariable;
      variableInfo = ` Variable seleccionada: ${btnText.textContent}.`;
    }

    return `
      ${title}. 
      ${sectionsText}
      ${dataInfo}
      ${variableInfo}
      Herramientas para aprender estadística básica. 
      Puedes ingresar datos, seleccionar tipos de variables y gráficos, y calcular medidas estadísticas.
    `.replace(/\s+/g, ' ').trim();
  }

  getGenericContent() {
    const title = document.querySelector('h1, h2, .main-title')?.textContent || 'Página de EstadísticaMente';
    return `${title}. ${this.extractMainContent()}`;
  }

  extractMainContent() {
    try {
      const excludedSelectors = 'header, footer, nav, script, style, .chat-avatar, .chat-window, button, .btn';
      const clone = document.body.cloneNode(true);
      
      const excludedElements = clone.querySelectorAll(excludedSelectors);
      excludedElements.forEach(el => el.remove());
      
      let text = clone.textContent || clone.innerText || '';
      text = text.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
      
      if (text.length > 500) {
        text = text.substring(0, 500) + '...';
      }
      
      return text || 'Contenido no disponible';
    } catch (error) {
      console.error('Error extrayendo contenido:', error);
      return 'Contenido de la página';
    }
  }

  provideContextHelp() {
    const helpText = `
      Estás en el Nivel Primario de EstadísticaMente.
      
      Comandos de voz disponibles:
      - "leer pantalla" - Leer el contenido completo
      - "leer resultados" - Leer los resultados actuales
      - "leer pasos" - Leer los pasos de resolución
      - "ayuda" - Obtener ayuda paso a paso
      - "detener" - Parar reconocimiento o lectura
      
      Para ingresar datos, di "números" o "palabras" cuando se te pregunte.
    `;

    // Limpiar emojis del texto de ayuda
    const cleanHelpText = this.cleanEmojis(helpText);
    
    this.speakText(cleanHelpText);
    this.showFeedback('Ayuda de Comandos', 
      'Puedes decir:<br>' +
      '• <strong>"leer pantalla"</strong> - Para leer el contenido<br>' +
      '• <strong>"leer resultados"</strong> - Para leer resultados<br>' +
      '• <strong>"leer pasos"</strong> - Para leer pasos de resolución<br>' +
      '• <strong>"ayuda"</strong> - Para obtener ayuda<br>' +
      '• <strong>"detener"</strong> - Para parar', 
      'info'
    );
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  const voiceBtn = document.getElementById('voice-btn');
  const dataInput = document.getElementById('data-input');
  
  if (voiceBtn && dataInput) {
    setTimeout(() => {
      window.voiceInput = new VoiceInput(dataInput, voiceBtn);
      console.log('✅ VoiceInput inicializado correctamente');
    }, 1000);
  } else {
    console.error('❌ No se pudo inicializar VoiceInput - Elementos no encontrados');
  }
});