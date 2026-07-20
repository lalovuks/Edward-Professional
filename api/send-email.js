export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Email service not configured' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: ['ect.mavungah@gmail.com'],
        reply_to: email,
        subject: `[Portfolio] ${subject || 'New Message'} — from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050507;color:#f0f0f5;padding:32px;border-radius:16px">
            <h2 style="color:#c9a84c;margin-top:0">New Portfolio Message</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#a0a0b8;font-size:.875rem;width:80px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#a0a0b8;font-size:.875rem">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#c9a84c">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#a0a0b8;font-size:.875rem">Subject</td><td style="padding:8px 0">${subject || '—'}</td></tr>
            </table>
            <hr style="border:1px solid #1e1e2e;margin:24px 0"/>
            <p style="color:#a0a0b8;font-size:.875rem;margin:0 0 8px">Message</p>
            <p style="line-height:1.7;white-space:pre-wrap">${message}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
