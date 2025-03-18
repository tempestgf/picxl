const { createServer } = require('https');
const { readFileSync } = require('fs');
const next = require('next');
const { parse } = require('url');
const { disconnectPrisma } = require('./lib/prisma');

const dev = process.env.NODE_ENV !== 'production';
const app = require('next')({ dev });
const handle = app.getRequestHandler();

// Cambia estas rutas por las rutas reales de tus certificados
const options = {
  key: require('fs').readFileSync('/etc/letsencrypt/live/tickets.tempestgf.es/privkey.pem'),
  cert: require('fs').readFileSync('/etc/letsencrypt/live/tickets.tempestgf.es/fullchain.pem'),
};

app.prepare().then(() => {
  const server = createServer(options, (req, res) => {
    const parsedUrl = require('url').parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(443, (err) => {
    if (err) throw err;
    console.log('> Servidor HTTPS escuchando en https://localhost');
  });
});

// Add a graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  
  // Close Prisma connections
  await disconnectPrisma();
  
  // Close your HTTP server
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
