const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();

// Настройка CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://postdeep.vercel.app' : 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const proxyUrl = process.env.PROXY_URL;

if (!OPENROUTER_API_KEY || !proxyUrl) {
    console.error('Ошибка: OPENROUTER_API_KEY или PROXY_URL не заданы в переменных окружения');
    throw new Error('Необходимы переменные окружения OPENROUTER_API_KEY и PROXY_URL');
}

const agent = new HttpsProxyAgent(proxyUrl);

// Экспорт функции для Vercel
module.exports = async (req, res) => {
    console.log('Получен запрос на /api/openrouter:', req.body);
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', req.body, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NODE_ENV === 'production' ? 'https://postdeep.vercel.app' : 'http://127.0.0.1:5500',
                'X-Title': 'Cosmic AI Agent'
            },
            httpsAgent: agent
        });
        console.log('Успешный ответ от OpenRouter:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Ошибка API:', error.message, error.response ? error.response.data : '');
        res.status(500).json({ error: 'API Error', details: error.message });
    }
};
