require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '50mb' })); // soporta payload grande

app.get('/', (req, res) => res.send('API mediadora corriendo ✅'));

app.all('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url || process.env.DEFAULT_API_URL;

        if (!/^https?:\/\//i.test(targetUrl)) {
            return res.status(400).send('URL debe ser absoluta con http o https');
        }

        const fetchOptions = {
            method: req.method,
            headers: { ...req.headers }, // pasar todos los headers originales
            redirect: 'manual',
        };

        // Pasar body si aplica
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);

        // Pasar todos los headers excepto algunos que pueden romper la respuesta
        response.headers.forEach((value, key) => {
            const skip = ['content-encoding', 'transfer-encoding', 'content-length'];
            if (!skip.includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        // Enviar el status exacto
        res.status(response.status);

        // Enviar el body como buffer para no alterar nada
        const buffer = await response.buffer();
        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mediador corriendo en el puerto ${PORT}`));
