const themes = {
  finclass: {
    bg: '#0a0e27',
    boxBg: '#141a3d',
    accent: '#FFD400',
    fg: '#ffffff',
    label: '#00e7f9',
  },
  finclassLight: {
    bg: '#ffffff',
    boxBg: '#f4f7fb',
    accent: '#0a0e27',
    fg: '#0a0e27',
    label: '#00b3c2',
  },
  dark: {
    bg: '#000000',
    boxBg: '#1a1a1a',
    accent: '#ffffff',
    fg: '#ffffff',
    label: '#aaaaaa',
  },
};

const norm = (v) => v ? '#' + String(v).replace(/^#/, '') : null;

function getTheme(opts = {}) {
  const base = themes[opts.theme] || themes.finclass;
  return {
    bg: norm(opts.bg) || base.bg,
    boxBg: norm(opts.box) || base.boxBg,
    accent: norm(opts.accent) || base.accent,
    fg: norm(opts.fg) || base.fg,
    label: norm(opts.label) || base.label,
  };
}

module.exports = { getTheme, themes };
