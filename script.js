class EstadisticaMenteApp {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const buttons = document.querySelectorAll('.level-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const level = e.target.getAttribute('data-level');
                this.handleLevelSelection(level);
            });
        });
    }

    handleLevelSelection(level) {
        // Aquí manejaremos la redirección más adelante
        console.log(`Nivel seleccionado: ${level}`);
        
        // Efecto visual de selección
        this.animateButtonSelection(level);
        
        // Mostrar mensaje temporal
        this.showTemporaryMessage(`Redirigiendo al nivel ${level}...`);
        
        // Simular redirección después de 2 segundos
        setTimeout(() => {
            // En el futuro, aquí irá la redirección real
            // window.location.href = `nivel-${level}.html`;
        }, 2000);
    }

    animateButtonSelection(level) {
        const button = document.querySelector(`[data-level="${level}"]`);
        
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    }

    showTemporaryMessage(message) {
        // Crear elemento de mensaje temporal
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            font-family: 'Open Sans', sans-serif;
        `;
        
        document.body.appendChild(messageEl);
        
        // Remover después de 2 segundos
        setTimeout(() => {
            messageEl.remove();
        }, 2000);
    }
}
function abrirActividadesInteractivas() {
    window.location.href = 'juegos.html';
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new EstadisticaMenteApp();
});

// En script.js, agrega esta función
function abrirCreadorDashboards() {
    window.location.href = 'dem.html';
}