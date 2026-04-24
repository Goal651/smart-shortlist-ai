const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');
const path = require('path');

const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 10000;

console.log('🏗️ Starting Monolithic Deployment...');

// Start Backend
const backend = spawn('node', [path.join(__dirname, 'backend/dist/index.js')], {
  env: { ...process.env, PORT: 5000 },
  stdio: 'inherit'
});

// Start Frontend
// Note: Next.js standalone server.js is in the root of the standalone folder
const frontend = spawn('node', [path.join(__dirname, 'frontend/server.js')], {
  env: { ...process.env, PORT: 3000, HOSTNAME: '0.0.0.0' },
  stdio: 'inherit'
});

// Proxy Server
const server = http.createServer((req, res) => {
  // Route /api to Backend
  if (req.url.startsWith('/api')) {
    proxy.web(req, res, { target: 'http://localhost:5000' }, (err) => {
      console.error('Backend Proxy Error:', err);
      res.writeHead(502);
      res.end('Backend is starting up or unreachable.');
    });
  } 
  // Route everything else to Frontend
  else {
    proxy.web(req, res, { target: 'http://localhost:3000' }, (err) => {
      console.error('Frontend Proxy Error:', err);
      res.writeHead(502);
      res.end('Frontend is starting up or unreachable.');
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Monolithic Proxy Server running on port ${PORT}`);
  console.log(`👉 Routing /api requests to Backend (Port 5000)`);
  console.log(`👉 Routing all other requests to Frontend (Port 3000)`);
});

// Handle termination
process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
