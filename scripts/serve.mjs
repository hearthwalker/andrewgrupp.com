import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'};
const server = http.createServer(async (req,res) => {
  try {
    const requestPath = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root,`.${requestPath}`);
    if (file !== root && !file.startsWith(root+path.sep)) {res.writeHead(403).end(); return;}
    let target = file;
    if ((await stat(target)).isDirectory()) target = path.join(target,'index.html');
    const body = await readFile(target);
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream'}).end(body);
  } catch {res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(await readFile(path.join(root,'404.html')));}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
