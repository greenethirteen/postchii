// Own renderer: brand-parametrized HTML/CSS -> Puppeteer screenshot -> PNG.
// Composes a marketing-grade 1080x1080 post: the user's photo (or a tone
// gradient) as the canvas, flag pill, brand chip, headline, spec row,
// price plate and a full-width CTA bar.
const fs = require('fs');
const path = require('path');
const config = require('../config');

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    const puppeteer = require('puppeteer');
    browserPromise = puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

// Accent palette per brand tone; also the fallback canvas when no photo.
const TONE_THEMES = {
  professional: {
    grad: 'linear-gradient(100deg, #2563eb, #38bdf8)',
    bg: 'radial-gradient(110% 110% at 15% 10%, rgba(37,99,235,.85), transparent 60%), radial-gradient(110% 110% at 85% 45%, rgba(56,189,248,.7), transparent 60%), #0e1524',
  },
  luxury: {
    grad: 'linear-gradient(100deg, #a3812c, #d4af37)',
    bg: 'radial-gradient(110% 110% at 15% 10%, rgba(163,129,44,.7), transparent 60%), radial-gradient(110% 110% at 85% 45%, rgba(212,175,55,.45), transparent 60%), #14120c',
  },
  friendly: {
    grad: 'linear-gradient(100deg, #ff3d77, #ff8a5c)',
    bg: 'radial-gradient(110% 110% at 15% 10%, rgba(255,61,119,.8), transparent 60%), radial-gradient(110% 110% at 85% 45%, rgba(255,138,92,.7), transparent 60%), #1b1016',
  },
};

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function logoSrc(logoPath) {
  if (!logoPath) return null;
  if (/^https?:\/\//.test(logoPath)) return logoPath;
  if (fs.existsSync(logoPath)) {
    const ext = path.extname(logoPath).slice(1).toLowerCase() || 'png';
    return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${fs
      .readFileSync(logoPath)
      .toString('base64')}`;
  }
  return null;
}

function headlineSize(text) {
  const len = (text || '').length;
  if (len <= 26) return 88;
  if (len <= 45) return 72;
  if (len <= 70) return 58;
  return 48;
}

// Spec row: beds/baths/area for properties, location/salary for jobs.
function buildSpecs(extracted) {
  if (extracted.type === 'property') {
    const parts = [];
    if (extracted.beds) parts.push(`🛏 ${extracted.beds} Beds`);
    if (extracted.baths) parts.push(`🛁 ${extracted.baths} Baths`);
    if (extracted.area) parts.push(`📐 ${extracted.area}`);
    if (parts.length === 0 && Array.isArray(extracted.features)) {
      parts.push(...extracted.features.slice(0, 3));
    }
    if (extracted.location) parts.unshift(`📍 ${extracted.location}`);
    return parts.slice(0, 4).join('  ·  ');
  }
  const parts = [];
  if (extracted.location) parts.push(`📍 ${extracted.location}`);
  if (extracted.company) parts.push(`🏢 ${extracted.company}`);
  return parts.join('  ·  ');
}

function buildHtml({ flag, headline, specs, price, cta, brandName, logo, theme, photo }) {
  const canvas = photo
    ? `background: linear-gradient(180deg, rgba(8,10,16,.38) 0%, rgba(8,10,16,.05) 38%, rgba(8,10,16,.78) 100%), url('${photo}') center / cover no-repeat;`
    : `background: ${theme.bg};`;

  return `
<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1080px; overflow: hidden; position: relative;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #fff;
    ${canvas}
  }
  .flag {
    position: absolute; top: 52px; left: 52px;
    padding: 16px 36px; border-radius: 999px;
    background: ${theme.grad};
    font-size: 30px; font-weight: 800; letter-spacing: 3px;
    box-shadow: 0 8px 30px rgba(0,0,0,.35);
  }
  .brand {
    position: absolute; top: 52px; right: 52px;
    display: flex; align-items: center; gap: 16px;
    padding: 14px 30px; border-radius: 999px;
    background: rgba(255,255,255,.94); color: #16161b;
    font-size: 27px; font-weight: 700; letter-spacing: 1.5px;
  }
  .brand img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; }
  .stack {
    position: absolute; left: 56px; right: 56px; bottom: 190px;
  }
  h1 {
    font-size: ${headlineSize(headline)}px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.12; max-width: 940px;
    text-shadow: 0 3px 24px rgba(0,0,0,.45);
  }
  .specs {
    margin-top: 22px; font-size: 32px; font-weight: 600;
    color: rgba(255,255,255,.92); text-shadow: 0 2px 14px rgba(0,0,0,.5);
  }
  .price {
    display: inline-block; margin-top: 28px;
    padding: 14px 34px; border-radius: 18px;
    background: rgba(255,255,255,.95); color: #16161b;
    font-size: 44px; font-weight: 800; letter-spacing: -1px;
  }
  .ctabar {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 38px 0; text-align: center;
    background: ${theme.grad};
    font-size: 34px; font-weight: 800; letter-spacing: 2.5px;
    text-transform: uppercase;
  }
</style></head><body>
  <div class="flag">${esc(flag)}</div>
  <div class="brand">${logo ? `<img src="${logo}" alt="">` : ''}${esc(brandName)}</div>
  <div class="stack">
    <h1>${esc(headline)}</h1>
    ${specs ? `<div class="specs">${esc(specs)}</div>` : ''}
    ${price ? `<div class="price">${esc(price)}</div>` : ''}
  </div>
  <div class="ctabar">${esc(cta)}</div>
</body></html>`;
}

async function buildPost(copy, extracted, company, { photo } = {}) {
  const theme = TONE_THEMES[company.brand_tone] || TONE_THEMES.professional;
  const isProperty = extracted.type === 'property';

  const html = buildHtml({
    flag: isProperty ? 'JUST LISTED' : "WE'RE HIRING",
    headline: copy.headline || '',
    specs: buildSpecs(extracted),
    price: isProperty ? extracted.price : extracted.salary,
    cta: copy.cta || (isProperty ? 'DM to book a viewing' : 'Apply now'),
    brandName: company.brand_name || company.name || '',
    logo: logoSrc(company.logo_path),
    theme,
    photo: photo || null,
  });

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const filePath = path.join(config.storage.postsDir, `post_${Date.now()}.png`);
    await page.screenshot({ path: filePath });
    return filePath;
  } finally {
    await page.close();
  }
}

module.exports = { buildPost };
