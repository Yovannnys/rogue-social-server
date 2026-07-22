const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ========== BASES DE DATOS ==========
const jugadores = {};
const fantasmas = [];
let contadorId = 1;
let contadorFantasma = 1;

// ========== RUTAS PRINCIPALES ==========
app.get('/', (req, res) => {
    res.send(`
        <h1>🎮 Rogue-Social Server</h1>
        <p>✅ Servidor con sistema de FANTASMAS MEJORADO!</p>
        <p>Jugadores: ${Object.keys(jugadores).length}</p>
        <p>Fantasmas: ${fantasmas.length}</p>
        <hr>
        <p>Rutas disponibles:</p>
        <ul>
            <li><a href="/api/estado">/api/estado</a></li>
            <li><a href="/api/jugadores">/api/jugadores</a></li>
            <li><a href="/api/fantasmas">/api/fantasmas</a></li>
            <li><a href="/api/invocar/1">/api/invocar/1</a></li>
        </ul>
    `);
});

app.get('/api/estado', (req, res) => {
    res.json({
        estado: 'online',
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
        oro: 50,
        x: 0,
        y: 0
    };

    console.log(`✅ Jugador creado: ${nombre} (ID: ${id})`);
    res.json({
        mensaje: 'Jugador creado',
        jugador: jugadores[id]
    });
});

app.get('/api/jugadores', (req, res) => {
    res.json(Object.values(jugadores));
});

// ========== RUTAS DE FANTASMAS MEJORADAS ==========
app.post('/api/fantasma', (req, res) => {
    const { nombreOriginal, estilo, jugadorId } = req.body;

    if (!nombreOriginal || !estilo) {
        return res.status(400).json({ error: 'Faltan datos del fantasma' });
    }

    // Configuración según el estilo
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
        jugadorId: jugadorId || 0, // ID del jugador que creó el fantasma
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

// ========== RUTA DE INVOCACIÓN MEJORADA ==========
app.get('/api/invocar/:idFantasma', (req, res) => {
    const id = parseInt(req.params.idFantasma);
    const fantasma = fantasmas.find(f => f.id === id);

    if (!fantasma) {
        return res.status(404).json({ error: 'Fantasma no encontrado' });
    }

    // Buff mejorado según el estilo
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
    console.log(`🚀 Servidor con FANTASMAS MEJORADOS rodando en puerto ${PORT}`);
    console.log(`📡 Ruta de invocación: /api/invocar/:id`);
});
