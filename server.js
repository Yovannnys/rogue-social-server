const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // ¡Render asigna el puerto automáticamente!

// Ruta principal
app.get('/', (req, res) => {
    res.send(`
        <h1>🎮 Rogue-Social Server</h1>
        <p>✅ Servidor funcionando perfeitamente!</p>
        <p>Hora atual: ${new Date().toLocaleString()}</p>
        <hr>
        <p><strong>Jogadores conectados:</strong> 0 (por enquanto)</p>
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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📡 Teste: http://localhost:${PORT}/api/estado`);
});