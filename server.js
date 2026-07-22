const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ========== BASES DE DATOS EN MEMORIA ==========
const jugadores = {};
const fantasmas = [];
const recursos = {};

// ========== RECURSOS Y MUNDOS ==========
const mundos = {
    'fuego': {
        nombre: 'Mundo de Fuego',
        recursos: ['Mineral de Fuego', 'Carbón', 'Azufre'],
        descripcion: 'Un mundo ardiente lleno de minerales y recursos volcánicos.'
    },
    'hielo': {
        nombre: 'Mundo de Hielo',
        recursos: ['Cristal de Hielo', 'Agua Pura', 'Plata'],
        descripcion: 'Un mundo helado donde se encuentran gemas y metales preciosos.'
    },
    'bosque': {
        nombre: 'Mundo del Bosque',
        recursos: ['Madera Élfica', 'Piedra Lunar', 'Hierbas Curativas'],
        descripcion: 'Un bosque antiguo lleno de recursos mágicos y naturales.'
    },
    'desierto': {
        nombre: 'Mundo del Desierto',
        recursos: ['Oro del Desierto', 'Esencia Solar', 'Metal de Arena'],
        descripcion: 'Un desierto interminable con recursos raros y valiosos.'
    }
};

// ========== INICIALIZAR RECURSOS DE JUGADORES ==========
function inicializarRecursosJugador(idJugador) {
    if (!recursos[idJugador]) {
        recursos[idJugador] = {
            'Mineral de Fuego': 0,
            'Carbón': 0,
            'Azufre': 0,
            'Cristal de Hielo': 0,
            'Agua Pura': 0,
            'Plata': 0,
            'Madera Élfica': 0,
            'Piedra Lunar': 0,
            'Hierbas Curativas': 0,
            'Oro del Desierto': 0,
            'Esencia Solar': 0,
            'Metal de Arena': 0,
            'Energía Espectral': 100,
            'Monedas Premium': 0
        };
    }
    return recursos[idJugador];
}

// ========== CONTADORES ==========
let contadorId = 1;
let contadorFantasma = 1;

// ========== RUTAS PRINCIPALES ==========
app.get('/', (req, res) => {
    res.send(`
        <h1>🎮 Rogue-Social Server</h1>
        <p>✅ Sistema de RECURSOS y MUNDOS activo</p>
        <p>Jugadores: ${Object.keys(jugadores).length}</p>
        <p>Fantasmas: ${fantasmas.length}</p>
        <hr>
        <p><strong>Mundos disponibles:</strong></p>
        <ul>
            ${Object.values(mundos).map(m => `<li>${m.nombre}: ${m.recursos.join(', ')}</li>`).join('')}
        </ul>
    `);
});

app.get('/api/estado', (req, res) => {
    res.json({
        estado: 'online',
        mundos: mundos,
        timestamp: new Date().toISOString()
    });
});

// ========== RUTAS DE JUGADORES ==========
app.post('/api/jugador', (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const id = contadorId++;
    jugadores[id] = {
        id: id,
        nombre: nombre,
        vida: 100,
        nivel: 1,
        mundoActual: 'fuego',
        energiaEspectral: 100,
        monedasPremium: 0
    };

    // Inicializar recursos
    inicializarRecursosJugador(id);

    console.log(`✅ Jugador creado: ${nombre} (ID: ${id})`);
    res.json({
        mensaje: 'Jugador creado',
        jugador: jugadores[id],
        recursos: recursos[id]
    });
});

app.get('/api/jugadores', (req, res) => {
    res.json(Object.values(jugadores));
});

app.get('/api/jugador/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const jugador = jugadores[id];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    res.json({
        jugador: jugador,
        recursos: recursos[id] || {}
    });
});

// ========== RUTAS DE MUNDOS Y RECURSOS ==========
app.get('/api/mundos', (req, res) => {
    res.json(mundos);
});

app.get('/api/mundo/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    const mundo = mundos[nombre];
    if (!mundo) {
        return res.status(404).json({ error: 'Mundo no encontrado' });
    }
    res.json(mundo);
});

// ========== RECOLECTAR RECURSO ==========
app.post('/api/recolectar', (req, res) => {
    const { idJugador, recurso, cantidad } = req.body;
    
    if (!idJugador || !recurso || !cantidad) {
        return res.status(400).json({ error: 'Faltan datos: idJugador, recurso, cantidad' });
    }

    const jugador = jugadores[idJugador];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    // Verificar que el recurso existe en el mundo actual del jugador
    const mundoActual = mundos[jugador.mundoActual];
    if (!mundoActual || !mundoActual.recursos.includes(recurso)) {
        return res.status(400).json({ error: `El recurso ${recurso} no existe en ${mundoActual?.nombre || 'este mundo'}` });
    }

    // Inicializar recursos del jugador si no existen
    if (!recursos[idJugador]) {
        inicializarRecursosJugador(idJugador);
    }

    // Añadir recurso
    recursos[idJugador][recurso] = (recursos[idJugador][recurso] || 0) + cantidad;
    
    console.log(`📦 ${jugador.nombre} recolectó ${cantidad} de ${recurso}`);
    res.json({
        mensaje: `Recolectaste ${cantidad} de ${recurso}`,
        jugador: jugador,
        recursos: recursos[idJugador]
    });
});

// ========== RUTAS DE FANTASMAS ==========
app.post('/api/fantasma', (req, res) => {
    const { nombreOriginal, estilo, jugadorId } = req.body;

    if (!nombreOriginal || !estilo) {
        return res.status(400).json({ error: 'Faltan datos del fantasma' });
    }

    const config = {
        'agresivo': { color: '#FF0000', emoji: '⚔️', ataque: 20, defensa: 5, vida: 100 },
        'curandero': { color: '#00FF00', emoji: '💚', ataque: 5, defensa: 10, vida: 120 },
        'tactico': { color: '#0000FF', emoji: '🧠', ataque: 10, defensa: 15, vida: 90 },
        'veloz': { color: '#FFAA00', emoji: '⚡', ataque: 15, defensa: 5, vida: 80 },
        'tank': { color: '#AAAAAA', emoji: '🛡️', ataque: 5, defensa: 25, vida: 150 },
        'magico': { color: '#AA00FF', emoji: '🔮', ataque: 25, defensa: 0, vida: 70 }
    };

    const stats = config[estilo] || config['agresivo'];

    const nuevoFantasma = {
        id: contadorFantasma++,
        nombreOriginal: nombreOriginal,
        estilo: estilo,
        jugadorId: jugadorId || 0,
        color: stats.color,
        emoji: stats.emoji,
        ataque: stats.ataque,
        defensa: stats.defensa,
        vida: stats.vida,
        nivel: 1,
        fecha: new Date().toISOString()
    };

    fantasmas.push(nuevoFantasma);
    console.log(`👻 Nuevo fantasma: ${nombreOriginal} (${estilo}) - ${stats.emoji}`);
    res.json({
        mensaje: 'Fantasma creado',
        fantasma: nuevoFantasma
    });
});

app.get('/api/fantasmas', (req, res) => {
    res.json(fantasmas);
});

// ========== RUTA DE INVOCACIÓN ==========
app.get('/api/invocar/:idFantasma', (req, res) => {
    const id = parseInt(req.params.idFantasma);
    const fantasma = fantasmas.find(f => f.id === id);

    if (!fantasma) {
        return res.status(404).json({ error: 'Fantasma no encontrado' });
    }

    let buff = {};
    switch (fantasma.estilo) {
        case 'agresivo': buff = { ataqueExtra: 10, velocidadExtra: 3 }; break;
        case 'curandero': buff = { vidaExtra: 30, pocionesExtra: 3 }; break;
        case 'tactico': buff = { defensaExtra: 5, evasionExtra: 15 }; break;
        case 'veloz': buff = { velocidadExtra: 10, evasionExtra: 20 }; break;
        case 'tank': buff = { defensaExtra: 10, vidaExtra: 50 }; break;
        case 'magico': buff = { ataqueExtra: 15, pocionesExtra: 2 }; break;
        default: buff = { ataqueExtra: 5, defensaExtra: 5 };
    }

    res.json({
        mensaje: `Has invocado a ${fantasma.nombreOriginal} (${fantasma.estilo}) ${fantasma.emoji}`,
        fantasma: fantasma,
        buff: buff
    });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
    console.log(`🚀 Servidor con RECURSOS y MUNDOS rodando en puerto ${PORT}`);
    console.log(`📡 Mundos disponibles: ${Object.keys(mundos).join(', ')}`);
});
