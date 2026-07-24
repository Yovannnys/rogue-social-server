const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ========== BASES DE DATOS ==========
const jugadores = {};
const fantasmas = {};
const recursos = {};
const inventario = {};
const misiones = {};
let contadorId = 1;
let contadorFantasma = 1;

// ========== RECURSOS Y MUNDOS ==========
const mundos = {
    'fuego': {
        nombre: 'Mundo de Fuego',
        recursos: ['Mineral de Fuego', 'Carbon', 'Azufre']
    },
    'hielo': {
        nombre: 'Mundo de Hielo',
        recursos: ['Cristal de Hielo', 'Agua Pura', 'Plata']
    },
    'bosque': {
        nombre: 'Mundo del Bosque',
        recursos: ['Madera Elfica', 'Piedra Lunar', 'Hierbas Curativas']
    },
    'desierto': {
        nombre: 'Mundo del Desierto',
        recursos: ['Oro del Desierto', 'Esencia Solar', 'Metal de Arena']
    }
};

// ========== RECETAS DE FABRICACION ==========
const recetas = {
    'Pocion de Fuerza': {
        descripcion: 'Aumenta el ataque temporalmente',
        costo: { 'Mineral de Fuego': 10, 'Hierbas Curativas': 5 },
        efecto: { ataqueExtra: 5 }
    },
    'Armadura de Hielo': {
        descripcion: 'Protege contra ataques fisicos',
        costo: { 'Cristal de Hielo': 15, 'Plata': 5 },
        efecto: { defensaExtra: 10 }
    },
    'Elixir de Vida': {
        descripcion: 'Restaura la vida del heroe',
        costo: { 'Energia Espectral': 20, 'Oro del Desierto': 10 },
        efecto: { vidaExtra: 50 }
    },
    'Hacha de Guerra': {
        descripcion: 'Aumenta el dano en batalla',
        costo: { 'Mineral de Fuego': 20, 'Madera Elfica': 10 },
        efecto: { ataqueExtra: 15 }
    }
};

// ========== MISIONES ==========
const misionesDisponibles = {
    'recolectar_mineral': {
        nombre: 'Recolector de Minerales',
        descripcion: 'Recolecta 20 Minerales de Fuego',
        objetivo: { tipo: 'recolectar', recurso: 'Mineral de Fuego', cantidad: 20 },
        recompensa: { 'Energia Espectral': 30, 'Monedas Premium': 5 }
    },
    'viajero': {
        nombre: 'Explorador de Mundos',
        descripcion: 'Viaja a 2 mundos diferentes',
        objetivo: { tipo: 'viajar', cantidad: 2 },
        recompensa: { 'Monedas Premium': 10 }
    },
    'fabricante': {
        nombre: 'Artesano',
        descripcion: 'Fabrica 3 objetos',
        objetivo: { tipo: 'fabricar', cantidad: 3 },
        recompensa: { 'Energia Espectral': 50 }
    }
};

// ========== INICIALIZAR ==========
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

function inicializarInventario(idJugador) {
    if (!inventario[idJugador]) {
        inventario[idJugador] = {};
    }
    return inventario[idJugador];
}

function inicializarMisiones(idJugador) {
    if (!misiones[idJugador]) {
        misiones[idJugador] = {};
        for (let key in misionesDisponibles) {
            misiones[idJugador][key] = {
                progreso: 0,
                completada: false,
                reclamada: false
            };
        }
    }
    return misiones[idJugador];
}

// ========== RUTAS ==========
app.get('/', (req, res) => {
    res.send(`
        <h1> Rogue-Social Server</h1>
        <p>Jugadores: ${Object.keys(jugadores).length}</p>
        <p>Fantasmas: ${Object.keys(fantasmas).length}</p>
        <hr>
        <p>Recetas: ${Object.keys(recetas).join(', ')}</p>
        <p>Misiones: ${Object.keys(misionesDisponibles).join(', ')}</p>
    `);
});

app.get('/api/estado', (req, res) => {
    res.json({
        estado: 'online',
        mundos: mundos,
        recetas: recetas,
        misiones: misionesDisponibles,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/jugador', (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    const id = contadorId++;
    jugadores[id] = {
        id: id,
        nombre: nombre,
        vida: 100,
        nivel: 1,
        mundoActual: 'fuego',
        energiaEspectral: 100,
        monedasPremium: 0,
        misionesCompletadas: 0
    };

    inicializarRecursosJugador(id);
    inicializarInventario(id);
    inicializarMisiones(id);

    res.json({
        mensaje: 'Jugador creado',
        jugador: jugadores[id],
        recursos: recursos[id],
        inventario: inventario[id],
        misiones: misiones[id]
    });
});

app.get('/api/jugador/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const jugador = jugadores[id];
    if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' });
    res.json({
        jugador: jugador,
        recursos: recursos[id] || {},
        inventario: inventario[id] || {},
        misiones: misiones[id] || {}
    });
});

app.get('/api/jugadores', (req, res) => {
    res.json(Object.values(jugadores));
});

app.get('/api/mundos', (req, res) => {
    res.json(mundos);
});

app.post('/api/cambiar-mundo', (req, res) => {
    const { idJugador, nuevoMundo } = req.body;
    if (!idJugador || !nuevoMundo) return res.status(400).json({ error: 'Faltan datos' });

    const jugador = jugadores[idJugador];
    if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' });
    if (!mundos[nuevoMundo]) return res.status(400).json({ error: 'Mundo no encontrado' });

    if (misiones[idJugador] && misiones[idJugador]['viajero'] && !misiones[idJugador]['viajero'].completada) {
        misiones[idJugador]['viajero'].progreso += 1;
        if (misiones[idJugador]['viajero'].progreso >= misionesDisponibles['viajero'].objetivo.cantidad) {
            misiones[idJugador]['viajero'].completada = true;
        }
    }

    jugador.mundoActual = nuevoMundo;
    res.json({
        mensaje: `Viajaste a ${mundos[nuevoMundo].nombre}`,
        jugador: jugador,
        recursos: recursos[idJugador],
        misiones: misiones[idJugador]
    });
});

app.post('/api/recolectar', (req, res) => {
    const { idJugador, recurso, cantidad } = req.body;
    if (!idJugador || !recurso || !cantidad) return res.status(400).json({ error: 'Faltan datos' });

    const jugador = jugadores[idJugador];
    if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' });

    const mundoActual = mundos[jugador.mundoActual];
    if (!mundoActual || !mundoActual.recursos.includes(recurso)) {
        return res.status(400).json({ error: `El recurso ${recurso} no existe en este mundo` });
    }

    if (!recursos[idJugador]) inicializarRecursosJugador(idJugador);

    if (misiones[idJugador] && misiones[idJugador]['recolectar_mineral'] && !misiones[idJugador]['recolectar_mineral'].completada) {
        if (recurso === 'Mineral de Fuego') {
            misiones[idJugador]['recolectar_mineral'].progreso += cantidad;
            if (misiones[idJugador]['recolectar_mineral'].progreso >= misionesDisponibles['recolectar_mineral'].objetivo.cantidad) {
                misiones[idJugador]['recolectar_mineral'].completada = true;
            }
        }
    }

    recursos[idJugador][recurso] = (recursos[idJugador][recurso] || 0) + cantidad;
    res.json({
        mensaje: `Recolectaste ${cantidad} de ${recurso}`,
        recursos: recursos[idJugador],
        misiones: misiones[idJugador]
    });
});

app.post('/api/fabricar', (req, res) => {
    const { idJugador, recetaNombre } = req.body;
    if (!idJugador || !recetaNombre) return res.status(400).json({ error: 'Faltan datos' });

    const jugador = jugadores[idJugador];
    if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' });

    const receta = recetas[recetaNombre];
    if (!receta) return res.status(400).json({ error: 'Receta no encontrada' });

    for (let recurso in receta.costo) {
        const cantidadNecesaria = receta.costo[recurso];
        const cantidadActual = recursos[idJugador]?.[recurso] || 0;
        if (cantidadActual < cantidadNecesaria) {
            return res.status(400).json({ error: `No tienes suficientes ${recurso}` });
        }
    }

    for (let recurso in receta.costo) {
        recursos[idJugador][recurso] -= receta.costo[recurso];
    }

    if (!inventario[idJugador]) inicializarInventario(idJugador);
    inventario[idJugador][recetaNombre] = (inventario[idJugador][recetaNombre] || 0) + 1;

    if (misiones[idJugador] && misiones[idJugador]['fabricante'] && !misiones[idJugador]['fabricante'].completada) {
        misiones[idJugador]['fabricante'].progreso += 1;
        if (misiones[idJugador]['fabricante'].progreso >= misionesDisponibles['fabricante'].objetivo.cantidad) {
            misiones[idJugador]['fabricante'].completada = true;
        }
    }

    res.json({
        mensaje: `Has fabricado ${recetaNombre}`,
        recursos: recursos[idJugador],
        inventario: inventario[idJugador],
        misiones: misiones[idJugador]
    });
});

app.post('/api/reclamar-mision', (req, res) => {
    const { idJugador, misionKey } = req.body;
    if (!idJugador || !misionKey) return res.status(400).json({ error: 'Faltan datos' });

    const jugador = jugadores[idJugador];
    if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' });

    if (!misiones[idJugador] || !misiones[idJugador][misionKey]) {
        return res.status(400).json({ error: 'Mision no encontrada' });
    }

    const mision = misiones[idJugador][misionKey];
    if (!mision.completada) return res.status(400).json({ error: 'Mision no completada' });
    if (mision.reclamada) return res.status(400).json({ error: 'Mision ya reclamada' });

    const recompensa = misionesDisponibles[misionKey].recompensa;
    for (let recurso in recompensa) {
        if (recursos[idJugador][recurso] !== undefined) {
            recursos[idJugador][recurso] += recompensa[recurso];
        } else {
            recursos[idJugador][recurso] = recompensa[recurso];
        }
    }

    mision.reclamada = true;
    jugador.misionesCompletadas += 1;

    res.json({
        mensaje: 'Mision reclamada!',
        recompensa: recompensa,
        recursos: recursos[idJugador],
        misiones: misiones[idJugador]
    });
});

// ========== FANTASMAS ==========
app.post('/api/fantasma', (req, res) => {
    const { nombreOriginal, estilo, jugadorId } = req.body;
    if (!nombreOriginal || !estilo) return res.status(400).json({ error: 'Faltan datos' });

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

    res.json({ mensaje: 'Fantasma creado', fantasma: fantasmas[id] });
});

app.get('/api/fantasmas', (req, res) => {
    res.json(Object.values(fantasmas));
});

app.get('/api/invocar/:idFantasma', (req, res) => {
    const id = parseInt(req.params.idFantasma);
    const fantasma = fantasmas[id];
    if (!fantasma) return res.status(404).json({ error: 'Fantasma no encontrado' });

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

app.listen(PORT, () => {
    console.log(` Servidor con FABRICACION y MISIONES en puerto ${PORT}`);
});
