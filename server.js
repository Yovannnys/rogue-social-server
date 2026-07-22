const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(express.json());

// ========== BASE DE DATOS EN MEMORIA ==========
const jugadores = {};
let contadorId = 1;

// ========== RUTAS ==========

// Ruta principal
app.get('/', (req, res) => {
    res.send(`
        <h1>🎮 Rogue-Social Server</h1>
        <p>✅ Servidor funcionando perfeitamente!</p>
        <p>Hora atual: ${new Date().toLocaleString()}</p>
        <hr>
        <p><strong>Jogadores conectados:</strong> ${Object.keys(jugadores).length}</p>
        <p><strong>Fantasmas criados:</strong> 0 (por enquanto)</p>
    `);
});

// Ruta para testar JSON
app.get('/api/estado', (req, res) => {
    res.json({
        estado: 'online',
        mensagem: 'Servidor funcionando corretamente',
        timestamp: new Date().toISOString()
    });
});

// ========== CREAR UN NUEVO JUGADOR ==========
app.post('/api/jugador', (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'Nombre es obligatorio' });
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

    console.log(`✅ Nuevo jugador: ${nombre} (ID: ${id})`);
    res.json({
        mensaje: 'Jugador creado con éxito',
        jugador: jugadores[id]
    });
});

// ========== OBTENER TODOS LOS JUGADORES ==========
app.get('/api/jugadores', (req, res) => {
    res.json(Object.values(jugadores));
});

// ========== OBTENER UN JUGADOR POR ID ==========
app.get('/api/jugador/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const jugador = jugadores[id];

    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    res.json(jugador);
});

// ========== ACTUALIZAR POSICIÓN DEL JUGADOR ==========
app.put('/api/jugador/:id/posicion', (req, res) => {
    const id = parseInt(req.params.id);
    const { x, y } = req.body;

    if (!jugadores[id]) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    jugadores[id].x = x;
    jugadores[id].y = y;

    console.log(`📍 ${jugadores[id].nombre} movido a (${x}, ${y})`);
    res.json({
        mensaje: 'Posición actualizada',
        jugador: jugadores[id]
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📡 Teste: http://localhost:${PORT}/api/estado`);
});
