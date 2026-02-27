# Plane Telegram Mini App

A lightweight Telegram Mini App to view and manage Plane projects and tasks.

## 🚀 Features

- 📊 **Projects View**: See all projects with stats and quick access
- 📋 **Issues View**: Browse issues across all projects or filter by project
- 📈 **Stats Dashboard**: Overview of project metrics
- 🔄 **Real-time**: Auto-refreshes on load

## 🔧 Setup

### 1. Deploy the Mini App

```bash
cd /data/.openclaw/workspace/projects/plane-mini-app
npm install
npm run build
# Copy dist/ to your web server
cp -r dist/* /var/www/plane-mini-app/
```

### 2. Register with BotFather

1. Message [@BotFather](https://t.me/BotFather)
2. Create a new bot or use existing
3. Run `/mybots` → Select bot → **Menu Button** → **Configure menu button**
4. Set button text: "Open Plane"
5. Set URL: `http://168.231.69.92:54618/` (or your domain)

### 3. Configure Web App

- **URL**: `http://168.231.69.92:54618/index.html`
- **Short name**: Plane Mini
- **Description**: View Plane projects and tasks

## 🔌 API Configuration

Edit `src/App.vue` to update:

```javascript
const API_URL = 'http://168.231.69.92:54617/api/v1'
const API_KEY = 'your-api-key'
const WORKSPACE = 'agents'
```

## 📁 Projects Tracked

| Project | Identifier | Description |
|---------|-----------|-------------|
| QR Code Generator | QRGEN | QR code generation tool |
| Agent CRM | CRM | Customer relationship management |
| Agent Framework | FRAME | Core agent infrastructure |

## 🛠️ Development

```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run preview # Preview production build
```

## 📱 Screenshots

*Coming soon...*

---

Built with Vue 3 + Vite for Telegram Mini Apps
