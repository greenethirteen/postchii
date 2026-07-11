// Generates headline/captions/CTA/hashtags from extracted data + brand settings.
const OpenAI = require('openai');
const config = require('../config');
const { COPY_SYSTEM, EDIT_SYSTEM } = require('./prompts');

const client = new OpenAI({ apiKey: config.openai.apiKey });

const INDUSTRY_LABELS = { recruitment: 'recruitment', real_estate: 'real estate' };

async function writeCopy(extractedData, company) {
  const system = COPY_SYSTEM.replace('{{industry}}', INDUSTRY_LABELS[company.industry] || company.industry)
    .replace('{{brandName}}', company.brand_name || company.name)
    .replace('{{tone}}', company.brand_tone || 'professional')
    .replace('{{contentType}}', extractedData.type || 'business update');

  const response = await client.chat.completions.create({
    model: config.openai.model,
    response_format: { type: 'json_object' },
    temperature: 0.7,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify(extractedData) },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}

// Applies a natural-language edit ("shorter headline", "remove salary")
// to the post. Returns { extracted, copy }.
async function editContent(extracted, copy, instruction) {
  const response = await client.chat.completions.create({
    model: config.openai.model,
    response_format: { type: 'json_object' },
    temperature: 0.3,
    messages: [
      { role: 'system', content: EDIT_SYSTEM },
      {
        role: 'user',
        content: `${JSON.stringify({ extracted, copy })}\n\nInstruction: ${instruction}`,
      },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}

module.exports = { writeCopy, editContent };
