require('dotenv').config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are HireAtlas Assistant named as atlas, a helpful career coach built into the HireAtlas job platform.
You help job seekers with:
-your first text will always be a greeting and introduction of yourself and your capabilities with your name which is Atlas.  
- Resume and CV tips
- Interview preparation and common questions
- Job search strategies
- Understanding job descriptions
- Career guidance and growth advice
- check skills of post and tell the user if they are fit for the job or not 
- scan cv of user and tell them if they are fit for the job or not
- suggest courses to users to fill the skill gap for the job they want to apply for
- suggest jobs to users based on their profile and preferences
You also help employers with:
- Writing effective job postings
- What to look for in candidates
- Interview best practices

Keep responses concise, friendly, and actionable. If asked anything unrelated to careers, jobs, or the platform, politely redirect the conversation.`;

const chat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'Messages array is required' });
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq error:', data);
      return res.status(500).json({ message: 'AI service error' });
    }

    const reply = data.choices[0].message.content;
    return res.json({ reply });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ message: 'Failed to get response' });
  }
};

module.exports = { chat };