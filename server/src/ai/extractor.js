// Turns raw business updates (text, screenshots, PDF text) into structured JSON.
const OpenAI = require('openai');
const config = require('../config');
const { EXTRACTION_SYSTEM, UPDATE_SYSTEM } = require('./prompts');

const client = new OpenAI({ apiKey: config.openai.apiKey });

async function extract(rawText, imageDataUri) {
  const userContent = imageDataUri
    ? [
        { type: 'text', text: rawText || 'Extract the details from this image.' },
        { type: 'image_url', image_url: { url: imageDataUri } },
      ]
    : rawText;

  const response = await client.chat.completions.create({
    model: config.openai.model,
    response_format: { type: 'json_object' },
    temperature: 0,
    messages: [
      { role: 'system', content: EXTRACTION_SYSTEM },
      { role: 'user', content: userContent },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}

// Merges a user's plain-language answer into previously extracted data.
async function updateExtraction(extracted, userAnswer) {
  const response = await client.chat.completions.create({
    model: config.openai.model,
    response_format: { type: 'json_object' },
    temperature: 0,
    messages: [
      { role: 'system', content: UPDATE_SYSTEM },
      { role: 'user', content: `Current JSON:\n${JSON.stringify(extracted)}\n\nUser says: ${userAnswer}` },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}

module.exports = { extract, updateExtraction };
