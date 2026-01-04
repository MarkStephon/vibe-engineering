const axios = require('axios');

async function callOpenRouter(prompt, model = "anthropic/claude-3-5-sonnet") {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vibekanban.com', // 官方建议
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter Error:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

module.exports = { callOpenRouter };
