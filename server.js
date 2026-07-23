const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ========== BASES DE DATOS ==========
const jugadores = {};
const fantasmas = {};
const recursos = {};
let contadorId = 1;
let contadorFantasma = 1;

// ========== RECURSOS Y MUNDOS ==========
const mundos = {
    'fuego': {
        nombre: 'Mundo de Fuego',
        recursos: ['Mineral de Fuego', 'Carbon', 'Azufre'],
        descripcion: 'Un mundo ardiente lleno de minerales y recursos volcanicos.'
    },
    'hielo': {
        nombre: 'Mundo de Hielo',
        recursos: ['Cristal de Hielo', 'Agua Pura', 'Plata'],
        descripcion: 'Un mundo helado donde se encuentran gemas y metales preciosos.'
    },
    'bosque': {
        nombre: 'Mundo del Bosque',
        recursos: ['Madera Elfica', 'Piedra Lunar', 'Hierbas Curativas'],
        descripcion: 'Un bosque antiguo lleno de recursos magicos y naturales.'
    },
    'desierto': {
        nombre: 'Mundo del Desierto',
        recursos: ['Oro del Desierto', 'Esencia Solar', 'Metal de Arena'],
        descripcion: 'Un desierto interminable con recursos raros y valiosos.'
    }
};

// ========== INICIALIZAR RECURSOS ==========
function inicializarRecursosJugador(idJugador) {
    if (!recursos[idJugador]) {
        recursos[idJugador] = {
            'Mineral de Fuego': 0,
            'Carbon': 0,
            'Azufre': 0,
            'Cristal de Hielo': 0,
            'Agua Pura': 0,
            'Plata': 0,
            'Madera Elfica': 0,
            'Piedra Lunar': 0,
            'Hierbas Curativas': 0,
            'Oro del Desierto': 0,
            'Esencia Solar': 0,
            'Metal de Arena': 0,
            'Energia Espectral': 100,
            'Monedas Premium': 0
        };
    }
    return recursos[idJugador];
}

// ========== RUTAS PRINCIPALES ==========
app.get('/', (req, res) => {
    res.send(`
        <h1> Rogue-Social Server</h1>
        <p> Sistema de RECURSOS, MUNDOS y VIAJES activo</p>
        <p>Jugadores: ${Object.keys(jugadores).length}</p>
        <p>Fantasmas: ${Object.keys(fantasmas).length}</p>
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
        mundoActual: 'fuego', // <--- MUNDO INICIAL
        energiaEspectral: 100,
        monedasPremium: 0
    };

    inicializarRecursosJugador(id);

    console.log(` Jugador creado: ${nombre} (ID: ${id})`);
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

// ========== RUTAS DE MUNDOS ==========
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

// ========== RUTA PARA VIAJAR ENTRE MUNDOS ==========
app.post('/api/cambiar-mundo', (req, res) => {
    const { idJugador, nuevoMundo } = req.body;

    // Validar que lleguen los datos
    if (!idJugador) {
        return res.status(400).json({ error: 'Falta idJugador' });
    }
    if (!nuevoMundo) {
        return res.status(400).json({ error: 'Falta nuevoMundo' });
    }

    // Verificar que el jugador existe
    const jugador = jugadores[idJugador];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    // Verificar que el mundo existe
    if (!mundos[nuevoMundo]) {
        return res.status(400).json({ 
            error: 'Mundo no encontrado',
            mundosDisponibles: Object.keys(mundos)
        });
    }

    // Cambiar el mundo
    jugador.mundoActual = nuevoMundo;
    
    console.log(` Viaje: ${jugador.nombre} viajo a ${mundos[nuevoMundo].nombre}`);
    res.json({
        mensaje: `Viajaste a ${mundos[nuevoMundo].nombre}`,
        jugador: jugador,
        recursos: recursos[idJugador]
    });
});

// ========== RUTA DE RECOLECCIÓN ==========
app.post('/api/recolectar', (req, res) => {
    const { idJugador, recurso, cantidad } = req.body;
    
    if (!idJugador) {
        return res.status(400).json({ error: 'Falta idJugador' });
    }
    if (!recurso) {
        return res.status(400).json({ error: 'Falta recurso' });
    }
    if (!cantidad) {
        return res.status(400).json({ error: 'Falta cantidad' });
    }

    const jugador = jugadores[idJugador];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const mundoActual = mundos[jugador.mundoActual];
    if (!mundoActual) {
        return res.status(400).json({ error: 'Mundo actual no encontrado' });
    }
    
    if (!mundoActual.recursos.includes(recurso)) {
        return res.status(400).json({ 
            error: `El recurso ${recurso} no existe en ${mundoActual.nombre}`,
            recursosDisponibles: mundoActual.recursos
        });
    }

    if (!recursos[idJugador]) {
        inicializarRecursosJugador(idJugador);
    }

    recursos[idJugador][recurso] = (recursos[idJugador][recurso] || 0) + cantidad;
    
    console.log(` ${jugador.nombre} recolecto ${cantidad} de ${recurso} en ${mundoActual.nombre}`);
    res.json({
        mensaje: `Recolectaste ${cantidad} de ${recurso} en ${mundoActual.nombre}`,
        recurso: recurso,
        cantidad: cantidad,
        total: recursos[idJugador][recurso],
        mundoActual: jugador.mundoActual,
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

    const id = contadorFantasma++;
    fantasmas[id] = {
        id: id,
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

    console.log(` Nuevo fantasma: ${nombreOriginal} (${estilo})`);
    res.json({
        mensaje: 'Fantasma creado',
        fantasma: fantasmas[id]
    });
});

app.get('/api/fantasmas', (req, res) => {
    res.json(Object.values(fantasmas));
});

// ========== RUTA DE INVOCACIÓN ==========
app.get('/api/invocar/:idFantasma', (req, res) => {
    const id = parseInt(req.params.idFantasma);
    const fantasma = fantasmas[id];

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
        mensaje: `Has invocado a ${fantasma.nombreOriginal} (${fantasma.estilo})`,
        fantasma: fantasma,
        buff: buff
    });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
    console.log(` Servidor con VIAJES rodando en puerto ${PORT}`);
    console.log(` Mundos disponibles: ${Object.keys(mundos).join(', ')}`);
});
