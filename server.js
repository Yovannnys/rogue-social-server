const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ========== BASES DE DATOS EN MEMORIA ==========
const jugadores = {};
const fantasmas = [];
let contadorId = 1;
let contadorFantasma = 1;

// ========== RUTAS PRINCIPALES ==========
app.get('/', (req, res) => {
    res.send(`
        <h1>🎮 Rogue-Social Server</h1>
        <p>✅ Servidor con sistema de FANTASMAS!</p>
        <p>Jugadores: ${Object.keys(jugadores).length} | Fantasmas: ${fantasmas.length}</p>
    `);
});

app.get('/api/estado', (req, res) => {
    res.json({ estado: 'online', mensagem: 'Servidor con fantasmas!', timestamp: new Date().toISOString() });
});

// ========== RUTAS DE JUGADORES ==========
app.post('/api/jugador', (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es obligatorio' });

    const id = contadorId++;
    jugadores[id] = { id, nombre, vida: 100, oro: 50, x: 0, y: 0 };
    console.log(`✅ Nuevo jugador: ${nombre} (ID: ${id})`);
    res.json({ mensaje: 'Jugador creado', jugador: jugadores[id] });
});

app.get('/api/jugadores', (req, res) => {
    res.json(Object.values(jugadores));
});

// ========== RUTAS DE FANTASMAS ==========
app.post('/api/fantasma', (req, res) => {
    const { nombreOriginal, estilo, nivel, ataque, vida } = req.body;

    if (!nombreOriginal || !estilo) {
        return res.status(400).json({ error: 'Faltan datos del fantasma' });
    }

    const nuevoFantasma = {
        id: contadorFantasma++,
        nombreOriginal: nombreOriginal,
        estilo: estilo,
        nivel: nivel || 1,
        ataque: ataque || 10,
        vida: vida || 80,
        fecha: new Date().toISOString()
    };

    fantasmas.push(nuevoFantasma);
    console.log(`👻 Nuevo fantasma: ${nombreOriginal} (${estilo})`);
    res.json({ mensaje: 'Fantasma creado con éxito', fantasma: nuevoFantasma });
});

app.get('/api/fantasmas', (req, res) => {
    res.json(fantasmas);
});

// ========== RUTA PARA INVOCAR UN FANTASMA ==========
// ¡¡¡ESTA ES LA RUTA QUE DEBE ESTAR EN EL SERVIDOR!!!
app.post('/api/invocar/:idFantasma', (req, res) => {
    const id = parseInt(req.params.idFantasma);
    const fantasma = fantasmas.find(f => f.id === id);

    if (!fantasma) {
        return res.status(404).json({ error: 'Fantasma no encontrado' });
    }

    // Calcular buff según el estilo
    let buff = {};
    switch (fantasma.estilo) {
        case 'agresivo': buff = { ataqueExtra: 5, velocidadExtra: 2 }; break;
        case 'curandero': buff = { vidaExtra: 20, pocionesExtra: 2 }; break;
        case 'tactico': buff = { defensaExtra: 3, evasionExtra: 10 }; break;
        default: buff = { ataqueExtra: 2, defensaExtra: 2 };
    }

    res.json({
        mensaje: `Has invocado a ${fantasma.nombreOriginal} (${fantasma.estilo})`,
        buff: buff
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor con FANTASMAS rodando en puerto ${PORT}`);
    console.log(`📡 Ruta de invocación: /api/invocar/:id`);
});
