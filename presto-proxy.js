const http = require('http');

const PRESTO_HOST = 'localhost';
const PRESTO_PORT = 8080;
const PROXY_PORT = 9090;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Presto-User, X-Presto-Catalog, X-Presto-Schema');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Proxy the request to Presto
  const options = {
    hostname: PRESTO_HOST,
    port: PRESTO_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end('Proxy error');
  });

  req.pipe(proxyReq);
});

server.listen(PROXY_PORT, () => {
  console.log(`CORS proxy running on http://localhost:${PROXY_PORT}`);
  console.log(`Proxying to Presto at http://${PRESTO_HOST}:${PRESTO_PORT}`);
});
