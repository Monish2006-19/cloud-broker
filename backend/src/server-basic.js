const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);
  
  try {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Basic HTTP server working!',
      url: req.url,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Response error:', error);
  }
});

server.listen(5000, () => {
  console.log('🚀 Basic HTTP server running on port 5000');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});