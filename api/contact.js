export default async function handler(req, res) {
  // CORS для локальной разработки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const CHAT_ID = process.env.TG_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TG_BOT_TOKEN or TG_CHAT_ID env variables');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const text =
    `🆕 <b>Новое ТЗ с сайта PageX</b>\n\n` +
    `👤 <b>Имя:</b> ${escapeHtml(name)}\n` +
    `📧 <b>Email:</b> ${escapeHtml(email)}\n\n` +
    `📝 <b>Сообщение:</b>\n${escapeHtml(message)}`;

  const tgRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    }
  );

  if (!tgRes.ok) {
    const err = await tgRes.text();
    console.error('Telegram API error:', err);
    return res.status(502).json({ error: 'Telegram error' });
  }

  return res.status(200).json({ ok: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
