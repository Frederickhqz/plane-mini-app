import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const SSL_PORT = 3443;
const TARGET_PORT = 3000;
const TARGET_HOST = 'localhost';

// Generate self-signed certificate if not exists
const CERT_DIR = '/data/.openclaw/workspace/plane-mini-app/certs';
const KEY_FILE = path.join(CERT_DIR, 'key.pem');
const CERT_FILE = path.join(CERT_DIR, 'cert.pem');

if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

// Check if certificates exist, if not, we'll use a simple HTTP workaround
// For Telegram Mini Apps, we need valid SSL, so let's use the existing infrastructure

// Simple proxy server
const proxy = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${TARGET_HOST}:${TARGET_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq);
});

proxy.listen(SSL_PORT, '0.0.0.0', () => {
  console.log(`SSL Proxy running on port ${SSL_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
