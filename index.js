require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

// Endpoint universal
app.all('/proxy', async (req, res) => {
    try {
        // URL de destino
        const targetUrl = req.query.url || process.env.DEFAULT_API_URL;

        // Método HTTP
        const method = req.method;

        // Datos del body o predeterminados
        const body = Object.keys(req.body).length > 0
            ? req.body
            : JSON.parse(process.env.DEFAULT_PAYLOAD);

        // Construir request
        const fetchOptions = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        if (method !== 'GET' && method !== 'HEAD') {
            fetchOptions.body = JSON.stringify(body);
        }

        // Llamar a la API de destino
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mediador corriendo en http://localhost:${PORT}`));
