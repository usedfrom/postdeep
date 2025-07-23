const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();

// Настройка CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://webinnovator.vercel.app' : 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Экспорт функции для Vercel
module.exports = async (req, res) => {
    console.log('Получен запрос на /api/openai:', req.body);

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const proxyUrl = process.env.PROXY_URL;

    if (!DEEPSEEK_API_KEY || !proxyUrl) {
        console.error('Ошибка: DEEPSEEK_API_KEY или PROXY_URL не заданы в переменных окружения');
        return res.status(500).json({
            error: 'Server Configuration Error',
            details: 'DEEPSEEK_API_KEY or PROXY_URL environment variables are not set'
        });
    }

    try {
        const agent = new HttpsProxyAgent(proxyUrl);
        const response = await axios.post('https://api.deepseek.com/chat/completions', req.body, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            httpsAgent: agent
        });
        console.log('Успешный ответ от DeepSeek:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Ошибка API:', error.message, error.response ? error.response.data : '');
        res.status(500).json({ error: 'API Error', details: error.message });
    }
};
