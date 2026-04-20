const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const GIFEncoder = require('gif-encoder-2');
const { getTheme } = require('./themes');

GlobalFonts.loadSystemFonts();
const HAS_INTER = GlobalFonts.has('Inter');
const FONT_FAMILY = HAS_INTER ? 'Inter, sans-serif' : 'sans-serif';

const WIDTH = 600;
const HEIGHT = 180;
const FRAMES = 60;
const FRAME_DELAY_MS = 1000;

const BOX_W = 120;
const BOX_H = 130;
const GAP = 16;

function diff(target, now) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: ms === 0,
  };
}

const pad = (n) => String(n).padStart(2, '0');

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFrame(ctx, parts, theme) {
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const totalW = BOX_W * 4 + GAP * 3;
  const startX = (WIDTH - totalW) / 2;
  const startY = (HEIGHT - BOX_H) / 2;

  const items = [
    { value: pad(parts.days), label: 'DIAS' },
    { value: pad(parts.hours), label: 'HORAS' },
    { value: pad(parts.minutes), label: 'MIN' },
    { value: pad(parts.seconds), label: 'SEG' },
  ];

  items.forEach((item, i) => {
    const x = startX + i * (BOX_W + GAP);
    const y = startY;

    // Box background
    ctx.fillStyle = theme.boxBg;
    roundedRect(ctx, x, y, BOX_W, BOX_H, 10);
    ctx.fill();

    // Top accent stripe (rounded top)
    ctx.fillStyle = theme.accent;
    roundedRect(ctx, x, y, BOX_W, 6, 3);
    ctx.fill();

    // Number
    ctx.fillStyle = theme.fg;
    ctx.font = `900 56px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.value, x + BOX_W / 2, y + BOX_H / 2 - 4);

    // Label
    ctx.fillStyle = theme.label;
    ctx.font = `700 11px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Letter-spacing manual (canvas API has no letter-spacing in older versions)
    drawSpacedText(ctx, item.label, x + BOX_W / 2, y + BOX_H - 18, 1.5);
  });
}

function drawSpacedText(ctx, text, cx, cy, spacing) {
  const widths = text.split('').map(ch => ctx.measureText(ch).width);
  const totalW = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let x = cx - totalW / 2;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x + widths[i] / 2, cy);
    x += widths[i] + spacing;
  }
}

async function renderCountdownGif(opts) {
  const theme = getTheme(opts);
  const encoder = new GIFEncoder(WIDTH, HEIGHT, 'octree');
  encoder.setRepeat(-1); // -1 = play once, freeze on last frame
  encoder.setDelay(FRAME_DELAY_MS);
  encoder.setQuality(10);
  encoder.start();

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const startNow = new Date();
  for (let i = 0; i < FRAMES; i++) {
    const now = new Date(startNow.getTime() + i * 1000);
    const parts = diff(opts.target, now);
    drawFrame(ctx, parts, theme);
    encoder.addFrame(ctx);
    if (parts.expired) break;
  }

  encoder.finish();
  return encoder.out.getData();
}

module.exports = { renderCountdownGif, WIDTH, HEIGHT };
