const express = require('express');
const { getFinanceContext } = require('../services/finance');
const { analyze } = require('../services/analysis');
const { isAiEnabled, generateChatReply } = require('../services/llm');
const { saveMessage, getMessages, ruleBasedReply } = require('../services/chat');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = req.query.limit || 30;
    if (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100) {
      return res.status(400).json({ error: 'limit harus angka 1-100' });
    }
    const messages = await getMessages(Number(limit));
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'message wajib diisi' });
    }
    const text = String(message).trim().slice(0, 1000);

    const userMessage = await saveMessage('user', text);

    const ctx = await getFinanceContext();
    const analysis = analyze(ctx);

    let reply;
    if (isAiEnabled()) {
      try {
        const history = await getMessages(10);
        reply = await generateChatReply(text, ctx, analysis, history);
      } catch (err) {
        console.error('LLM chat gagal, fallback rule-based:', err.message);
        reply = ruleBasedReply(text, ctx, analysis, { mode: 'llm_error' });
      }
    } else {
      reply = ruleBasedReply(text, ctx, analysis, { mode: 'no_key' });
    }

    const assistantMessage = await saveMessage('assistant', reply);

    res.status(201).json({ userMessage, assistantMessage });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
