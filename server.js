const { createServer } = require('https');
const { readFileSync } = require('fs');
const next = require('next');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = require('next')({ dev });
const handle = app.getRequestHandler();

// Cambia estas rutas por las rutas reales de tus certificados
const options = {
  key: require('fs').readFileSync('/etc/letsencrypt/live/tickets.tempestgf.es/privkey.pem'),
  cert: require('fs').readFileSync('/etc/letsencrypt/live/tickets.tempestgf.es/fullchain.pem'),
};

app.prepare().then(() => {
  createServer(options, (req, res) => {
    const parsedUrl = require('url').parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(443, (err) => {
    if (err) throw err;
    console.log('> Servidor HTTPS escuchando en https://localhost');
  });
});
