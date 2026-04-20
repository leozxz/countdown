# countdown-email

Gerador de countdown animado em GIF para emails marketing. Renderiza dinamicamente no servidor (Node + canvas) e devolve uma imagem GIF que roda 60 segundos a partir da abertura do email.

## Como usa

```html
<img src="https://SEU-APP.up.railway.app/cd.gif?to=2026-04-23T23:59:59-03:00"
     alt="Countdown"
     border="0"
     style="display:block;width:100%;max-width:520px;height:auto;" />
```

### Query params

| Param | Obrigatório | Default | Descrição |
|---|---|---|---|
| `to` | sim | — | Deadline em ISO 8601 (ex: `2026-04-23T23:59:59-03:00`) |
| `theme` | não | `finclass` | `finclass`, `finclassLight`, `dark` |
| `bg` | não | tema | Cor de fundo (hex sem `#`) |
| `box` | não | tema | Cor das caixas |
| `accent` | não | tema | Stripe superior das caixas |
| `fg` | não | tema | Cor dos números |
| `label` | não | tema | Cor dos rótulos (DIAS/HORAS/MIN/SEG) |

## Rodar local

```bash
npm install
npm start
# abre http://localhost:3000
```

## Deploy no Railway (via GitHub)

1. Cria repo no GitHub e faz push deste projeto.
2. Em [railway.app](https://railway.app), `New Project` → `Deploy from GitHub repo` → seleciona o repo.
3. Railway detecta Node, usa `nixpacks.toml` (instala fonts-inter via apt) e roda `npm start`.
4. Em `Settings` → `Networking`, gera o domínio público (`*.up.railway.app`).
5. Pronto — usa a URL do passo 4 no `<img src>` do email.

### Domínio custom (opcional)

Em `Settings` → `Networking` → `Custom Domain`, aponta um CNAME para o domínio Railway. Útil pra branding (ex: `cd.finclass.com`).

## Cache do Gmail

O proxy de imagens do Gmail cacheia a primeira request. O GIF de 60 frames roda do momento da primeira abertura por 60s e congela no último frame. Reabertura tardia pode mostrar versão cacheada — não há jeito de contornar isso completamente. Outlook e Apple Mail respeitam melhor o `Cache-Control: no-store`.

## Stack

- `@napi-rs/canvas` — rendering 2D rápido sem dependência de Cairo
- `gif-encoder-2` — encoding GIF com paleta octree
- `express` — HTTP

## Estrutura

```
.
├── server.js        # Express + endpoint /cd.gif
├── render.js        # Composição de frames + GIF
├── themes.js        # Presets de cor (finclass, dark, light)
├── nixpacks.toml    # Config Railway (fonts via apt)
├── package.json
└── .gitignore
```
