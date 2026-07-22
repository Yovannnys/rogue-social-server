const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
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
        <p>✅ Servidor funcionando</p>
        <p>Jugadores: ${Object.keys(jugadores).length}</p>
        <p>Fantasmas: ${fantasmas.length}</p>
        <hr>
        <p>Rutas disponibles:</p>
        <ul>
            <li><a href="/api/estado">/api/estado</a></li>
            <li><a href="/api/jugadores">/api/jugadores</a></li>
            <li><a href="/api/fantasmas">/api/fantasmas</a></li>
            <li>/api/invocar/:id</li>
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

// ========== RUTAS DE FANTASMAS ==========
app.post('/api/fantasma', (req, res) => {
    const { nombreOriginal, estilo } = req.body;

    if (!nombreOriginal || !estilo) {
        return res.status(400).json({ error: 'Faltan datos del fantasma' });
    }

    const nuevoFantasma = {
        id: contadorFantasma++,
        nombreOriginal: nombreOriginal,
        estilo: estilo,
        nivel: 1,
        ataque: 15,
        vida: 80,
        fecha: new Date().toISOString()
    };

    fantasmas.push(nuevoFantasma);
    console.log(`👻 Fantasma creado: ${nombreOriginal} (${estilo})`);
    res.json({
        mensaje: 'Fantasma creado',
        fantasma: nuevoFantasma
    });
});

app.get('/api/fantasmas', (req, res) => {
    res.json(fantasmas);
});

// ========== RUTA DE INVOCACIÓN (LA QUE FALTA) ==========
app.post('/api/invocar/:idFantasma', (req, res) => {
    console.log(`🔍 Intentando invocar al ID: ${req.params.idFantasma}`);
    
    const id = parseInt(req.params.idFantasma);
    const fantasma = fantasmas.find(f => f.id === id);

    if (!fantasma) {
        console.log(`❌ Fantasma ID ${id} no encontrado`);
        return res.status(404).json({ error: 'Fantasma no encontrado' });
    }

    console.log(`✅ Fantasma encontrado: ${fantasma.nombreOriginal}`);

    // Calcular buff
    let buff = {};
    if (fantasma.estilo === 'agresivo') {
        buff = { ataqueExtra: 5, velocidadExtra: 2 };
    } else if (fantasma.estilo === 'curandero') {
        buff = { vidaExtra: 20, pocionesExtra: 2 };
    } else if (fantasma.estilo === 'tactico') {
        buff = { defensaExtra: 3, evasionExtra: 10 };
    } else {
        buff = { ataqueExtra: 2, defensaExtra: 2 };
    }

    res.json({
        mensaje: `Has invocado a ${fantasma.nombreOriginal} (${fantasma.estilo})`,
        buff: buff
    });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando en puerto ${PORT}`);
    console.log(`📡 Ruta de invocación: /api/invocar/:id`);
});
