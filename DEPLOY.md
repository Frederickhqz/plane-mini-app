# Plane Mini App - Hostinger Deployment Configuration

## Architecture

```
User (HTTPS) 
    ↓
Hostinger (pink-flamingo-276740.hostingersite.com)
    ↓ index.php (proxy)
VPS Proxy (168.231.69.92:3000)
    ↓
Plane API (168.231.69.92:54617)
```

## Deployment Steps

### 1. Build the Mini App

```bash
cd /data/.openclaw/workspace/plane-mini-app
npm install
npm run build
```

### 2. Deploy to Hostinger

Upload these files to your Hostinger hosting:

1. **All files from `dist/` folder** → Upload to `public_html/`
2. **Copy `hostinger-proxy.php`** → Rename to `index.php` in `public_html/`
3. **Create `.htaccess`** → In `public_html/` with the content below:

```apache
RewriteEngine On

# If the request is for a real file/directory, serve it
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# If the request starts with /api/, route to index.php (proxy)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ index.php [L,QSA]

# For all other requests, serve index.html (SPA fallback)
RewriteRule ^ index.html [L]
```

### 3. Start the VPS Proxy Server

On the VPS (168.231.69.92), run:

```bash
cd /data/.openclaw/workspace/plane-mini-app
node server.js
```

Or use PM2 for production:

```bash
cd /data/.openclaw/workspace/plane-mini-app
pm2 start server.js --name plane-mini-app-proxy
pm2 save
```

### 4. Verify Deployment

Test these URLs:
- Mini App: https://pink-flamingo-276740.hostingersite.com/
- API via Proxy: https://pink-flamingo-276740.hostingersite.com/api/projects

## Troubleshooting

### Projects not displaying
1. Check if VPS proxy is running: `curl http://168.231.69.92:3000/api/projects`
2. Check Hostinger proxy: Open browser dev tools → Network tab → Look for API errors
3. Check CORS errors in browser console

### CORS Errors
Make sure `server.js` has CORS enabled (already configured).

### Mixed Content Errors
The fix in `api.js` uses relative URLs (`/api`) instead of absolute (`http://...`).

## Files Changed

1. **src/composables/api.js** - Changed API_BASE from hardcoded IP to `/api`
2. **hostinger-proxy.php** - PHP proxy for Hostinger → VPS
3. **server.js** - Node proxy for VPS → Plane API
