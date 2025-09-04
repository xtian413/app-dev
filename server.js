const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const publicDir = path.join(__dirname, 'public');
const server = http.createServer((req, res) => {
    // If the URL is just '/', serve index.html from the public directory.
    // Otherwise, serve the requested file from the public directory.
    let filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            // Check for file not found error
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf8');
            } else {
                // Handle other server errors
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // If the file is found, send it with the correct content type.
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
            res.end(content, 'utf8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));