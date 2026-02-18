const http = require('http');

const PORT = 3333;

const server = http.createServer((req, res) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    if (body) {
      try {
        const parsed = JSON.parse(body);
        console.log('Body:', JSON.stringify(parsed, null, 2));
      } catch {
        console.log('Body (raw):', body);
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  });
});

server.listen(PORT, () => {
  console.log(`Webhook test server running on http://localhost:${PORT}`);
  console.log(`\nNext steps:`);
  console.log(`1. In another terminal, run: ngrok http ${PORT}`);
  console.log(`2. Copy the https URL from ngrok`);
  console.log(`3. Update your webhook in Twenty to use that URL`);
  console.log(`4. Create/update/delete an object and watch the webhooks come in!\n`);
});
