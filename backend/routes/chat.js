const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../utils/chatbot');

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    console.log('Received chat request with', messages?.length, 'messages');

    if (!messages) {
      return res.status(400).json({ message: 'Messages are required' });
    }
    const reply = await getChatResponse(messages);
    res.json({ reply });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ message: 'Error communicating with AI' });
  }
});

module.exports = router;
