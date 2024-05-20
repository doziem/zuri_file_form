const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  
    res.end('Set up completed');
  
});

server.listen(PORT, () => {
  console.log(`Server is running on:${PORT}`);
});
