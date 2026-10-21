const express = require('express');
const { getFinanceContext } = require('../services/finance');
const { analyze } = require('../services/analysis');
const { isAiEnabled, generateComment } = require('../services/llm');
const { saveMessage } = require('../services/chat');

const router = express.Router();

router.get('/insight', async (req, res, next) => {
  try {
    const ctx = await getFinanceContext();
    const analysis = analyze(ctx);
    res.json({
      ...analysis,
      budget: ctx.budget,
      ym: ctx.ym,
      today: ctx.today,
      aiEnabled: isAiEnabled(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/analyze', async (req, res, next) => {
  try {
    const ctx = await getFinanceContext();
    const analysis = analyze(ctx);

    let comment = analysis.message;
    if (isAiEnabled()) {
      try {
        comment = await generateComment(ctx, analysis);
      } catch (err) {
        console.error('LLM comment gagal, fallback rule-based:', err.message);
      }
    }

    const chatMessage = await saveMessage('assistant', comment);

    res.json({
      ...analysis,
      budget: ctx.budget,
      ym: ctx.ym,
      today: ctx.today,
      aiEnabled: isAiEnabled(),
      chatMessage,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
