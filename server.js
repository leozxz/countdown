const express = require('express');
const { renderCountdownGif } = require('./render');
const { themes } = require('./themes');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

app.get('/', (req, res) => {
  const sample = encodeURIComponent('2026-04-23T23:59:59-03:00');
  res.type('html').send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Countdown Email</title>
<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1a1a1a;background:#fafafa}h1{margin:0 0 8px}code{background:#eee;padding:2px 6px;border-radius:4px;font-size:13px}pre{background:#0a0e27;color:#fff;padding:16px;border-radius:8px;overflow:auto;font-size:13px}img{max-width:100%;border:1px solid #ddd;margin-top:8px}</style>
</head><body>
<h1>Countdown Email Generator</h1>
<p>Endpoint: <code>GET /cd.gif?to=&lt;ISO 8601&gt;</code></p>

<h3>Query params</h3>
<ul>
<li><code>to</code> — deadline ISO 8601 (ex: <code>2026-04-23T23:59:59-03:00</code>) <strong>obrigatório</strong></li>
<li><code>theme</code> — ${Object.keys(themes).map(t => `<code>${t}</code>`).join(' / ')} (default: <code>finclass</code>)</li>
<li><code>bg</code>, <code>box</code>, <code>accent</code>, <code>fg</code>, <code>label</code> — overrides de cor (hex sem #, ex: <code>0a0e27</code>)</li>
</ul>

<h3>Preview</h3>
<p><code>/cd.gif?to=${sample}</code></p>
<img src="/cd.gif?to=${sample}" alt="preview">

<h3>Uso no email (HTML)</h3>
<pre>&lt;img src="https://SEU-APP.up.railway.app/cd.gif?to=2026-04-23T23%3A59%3A59-03%3A00"
     alt="Countdown" border="0"
     style="display:block;width:100%;max-width:520px;height:auto;" /&gt;</pre>

<h3>Aviso sobre cache do Gmail</h3>
<p>O proxy de imagens do Gmail cacheia agressivamente — o GIF roda os 60 segundos a partir da primeira abertura, depois congela. Reabertura tardia pode mostrar versão cacheada. Outlook/Apple Mail respeitam melhor os headers <code>no-cache</code>.</p>
</body></html>`);
});

app.get('/cd.gif', async (req, res) => {
  try {
    const to = req.query.to;
    if (!to) return res.status(400).type('text').send('missing "to" param (ISO 8601, ex: 2026-04-23T23:59:59-03:00)');
    const target = new Date(to);
    if (isNaN(target.getTime())) return res.status(400).type('text').send('invalid "to" date');

    const opts = {
      target,
      theme: req.query.theme,
      bg: req.query.bg,
      box: req.query.box,
      accent: req.query.accent,
      fg: req.query.fg,
      label: req.query.label,
    };

    const buf = await renderCountdownGif(opts);
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(buf);
  } catch (err) {
    console.error('render error:', err);
    res.status(500).type('text').send('render error');
  }
});

app.get('/healthz', (req, res) => res.type('text').send('ok'));

app.listen(PORT, () => console.log(`countdown-email listening on :${PORT}`));
