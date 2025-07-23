const express = require('express');
const axios = require('axios');
const cors = require('cors');

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

    if (!DEEPSEEK_API_KEY) {
        console.error('Ошибка: DEEPSEEK_API_KEY не задан в переменных окружения');
        return res.status(500).json({
            error: 'Server Configuration Error',
            details: 'DEEPSEEK_API_KEY environment variable is not set'
        });
    }

    try {
        const response = await axios.post('https://api.deepseek.com/chat/completions', req.body, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Успешный ответ от DeepSeek:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Ошибка API:', error.message, error.response ? error.response.data : '');
        res.status(500).json({ error: 'API Error', details: error.message });
    }
};
