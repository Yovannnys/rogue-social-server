const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ========== BASES DE DATOS ==========
const jugadores = {};
const fantasmas = {};
const recursos = {};
const inventario = {}; // Objetos fabricados
const misiones = {};
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

function inicializarInventario(idJugador) {
    if (!inventario[idJugador]) {
        inventario[idJugador] = {};
    }
    return inventario[idJugador];
}

function inicializarMisiones(idJugador) {
    if (!misiones[idJugador]) {
        misiones[idJugador] = {};
        // Inicializar misiones disponibles
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

// ========== RUTAS PRINCIPALES ==========
app.get('/', (req, res) => {
    res.send(`
        <h1> Rogue-Social Server</h1>
        <p> Sistema de FABRICACION y MISIONES activo</p>
        <p>Jugadores: ${Object.keys(jugadores).length}</p>
        <p>Fantasmas: ${Object.keys(fantasmas).length}</p>
        <hr>
        <p><strong>Mundos disponibles:</strong></p>
        <ul>
            ${Object.values(mundos).map(m => `<li>${m.nombre}: ${m.recursos.join(', ')}</li>`).join('')}
        </ul>
        <hr>
        <p><strong>Recetas de fabricacion:</strong></p>
        <ul>
            ${Object.keys(recetas).map(r => `<li>${r}: ${recetas[r].descripcion}</li>`).join('')}
        </ul>
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
        monedasPremium: 0,
        misionesCompletadas: 0
    };

    inicializarRecursosJugador(id);
    inicializarInventario(id);
    inicializarMisiones(id);

    console.log(` Jugador creado: ${nombre} (ID: ${id})`);
    res.json({
        mensaje: 'Jugador creado',
        jugador: jugadores[id],
        recursos: recursos[id],
        inventario: inventario[id],
        misiones: misiones[id]
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
        recursos: recursos[id] || {},
        inventario: inventario[id] || {},
        misiones: misiones[id] || {}
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

// ========== RUTA PARA VIAJAR ==========
app.post('/api/cambiar-mundo', (req, res) => {
    const { idJugador, nuevoMundo } = req.body;

    if (!idJugador || !nuevoMundo) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    const jugador = jugadores[idJugador];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    if (!mundos[nuevoMundo]) {
        return res.status(400).json({ 
            error: 'Mundo no encontrado',
            mundosDisponibles: Object.keys(mundos)
        });
    }

    // ========== ACTUALIZAR MISION ==========
    if (misiones[idJugador] && misiones[idJugador]['viajero'] && !misiones[idJugador]['viajero'].completada) {
        misiones[idJugador]['viajero'].progreso += 1;
        if (misiones[idJugador]['viajero'].progreso >= misionesDisponibles['viajero'].objetivo.cantidad) {
            misiones[idJugador]['viajero'].completada = true;
            console.log(` Mision 'viajero' completada por ${jugador.nombre}`);
        }
    }

    jugador.mundoActual = nuevoMundo;
    
    console.log(` Viaje: ${jugador.nombre} viajo a ${mundos[nuevoMundo].nombre}`);
    res.json({
        mensaje: `Viajaste a ${mundos[nuevoMundo].nombre}`,
        jugador: jugador,
        recursos: recursos[idJugador],
        misiones: misiones[idJugador]
    });
});

// ========== RUTA DE RECOLECCION ==========
app.post('/api/recolectar', (req, res) => {
    const { idJugador, recurso, cantidad } = req.body;
    
    if (!idJugador || !recurso || !cantidad) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    const jugador = jugadores[idJugador];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const mundoActual = mundos[jugador.mundoActual];
    if (!mundoActual || !mundoActual.recursos.includes(recurso)) {
        return res.status(400).json({ 
            error: `El recurso ${recurso} no existe en ${mundoActual?.nombre || 'este mundo'}`
        });
    }

    if (!recursos[idJugador]) {
        inicializarRecursosJugador(idJugador);
    }

    // ========== ACTUALIZAR MISION ==========
    if (misiones[idJugador] && misiones[idJugador]['recolectar_mineral'] && !misiones[idJugador]['recolectar_mineral'].completada) {
        if (recurso === 'Mineral de Fuego') {
            misiones[idJugador]['recolectar_mineral'].progreso += cantidad;
            if (misiones[idJugador]['recolectar_mineral'].progreso >= misionesDisponibles['recolectar_mineral'].objetivo.cantidad) {
                misiones[idJugador]['recolectar_mineral'].completada = true;
                console.log(` Mision 'recolectar_mineral' completada por ${jugador.nombre}`);
            }
        }
    }

    recursos[idJugador][recurso] = (recursos[idJugador][recurso] || 0) + cantidad;
    
    console.log(` ${jugador.nombre} recolecto ${cantidad} de ${recurso} en ${mundoActual.nombre}`);
    res.json({
        mensaje: `Recolectaste ${cantidad} de ${recurso} en ${mundoActual.nombre}`,
        recursos: recursos[idJugador],
        misiones: misiones[idJugador]
    });
});

// ========== RUTA DE FABRICACION ==========
app.post('/api/fabricar', (req, res) => {
    const { idJugador, recetaNombre } = req.body;

    if (!idJugador || !recetaNombre) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    const jugador = jugadores[idJugador];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const receta = recetas[recetaNombre];
    if (!receta) {
        return res.status(400).json({ 
            error: 'Receta no encontrada',
            recetasDisponibles: Object.keys(recetas)
        });
    }

    // Verificar si tiene suficientes recursos
    for (let recurso in receta.costo) {
        const cantidadNecesaria = receta.costo[recurso];
        const cantidadActual = recursos[idJugador]?.[recurso] || 0;
        if (cantidadActual < cantidadNecesaria) {
            return res.status(400).json({ 
                error: `No tienes suficientes ${recurso}. Necesitas ${cantidadNecesaria}`,
                faltante: recurso
            });
        }
    }

    // Gastar recursos
    for (let recurso in receta.costo) {
        recursos[idJugador][recurso] -= receta.costo[recurso];
    }

    // Añadir objeto al inventario
    if (!inventario[idJugador]) {
        inicializarInventario(idJugador);
    }
    inventario[idJugador][recetaNombre] = (inventario[idJugador][recetaNombre] || 0) + 1;

    // ========== ACTUALIZAR MISION ==========
    if (misiones[idJugador] && misiones[idJugador]['fabricante'] && !misiones[idJugador]['fabricante'].completada) {
        misiones[idJugador]['fabricante'].progreso += 1;
        if (misiones[idJugador]['fabricante'].progreso >= misionesDisponibles['fabricante'].objetivo.cantidad) {
            misiones[idJugador]['fabricante'].completada = true;
            console.log(` Mision 'fabricante' completada por ${jugador.nombre}`);
        }
    }

    console.log(` ${jugador.nombre} fabrico ${recetaNombre}`);
    res.json({
        mensaje: `Has fabricado ${recetaNombre}`,
        receta: receta,
        recursos: recursos[idJugador],
        inventario: inventario[idJugador],
        misiones: misiones[idJugador]
    });
});

// ========== RUTA PARA RECLAMAR MISION ==========
app.post('/api/reclamar-mision', (req, res) => {
    const { idJugador, misionKey } = req.body;

    if (!idJugador || !misionKey) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    const jugador = jugadores[idJugador];
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    if (!misiones[idJugador] || !misiones[idJugador][misionKey]) {
        return res.status(400).json({ error: 'Mision no encontrada' });
    }

    const mision = misiones[idJugador][misionKey];
    if (!mision.completada) {
        return res.status(400).json({ error: 'Mision no completada' });
    }
    if (mision.reclamada) {
        return res.status(400).json({ error: 'Mision ya reclamada' });
    }

    // Entregar recompensa
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

    console.log(` ${jugador.nombre} reclamo mision '${misionKey}'`);
    res.json({
        mensaje: `Mision reclamada!`,
        recompensa: recompensa,
        recursos: recursos[idJugador],
        misiones: misiones[idJugador]
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

// ========== RUTA DE INVOCACION ==========
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
    console.log(` Servidor con FABRICACION y MISIONES rodando en puerto ${PORT}`);
    console.log(` Recetas disponibles: ${Object.keys(recetas).join(', ')}`);
    console.log(` Misiones disponibles: ${Object.keys(misionesDisponibles).join(', ')}`);
});
