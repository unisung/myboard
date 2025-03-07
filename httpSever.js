const http = require('http') //importing tne http module

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200; //HTTP 상태코드 - 200: 성공
    res.setHeader('Content-Type', 'text/plain'); //헤더 설정
    res.end('Hello World\n'); //응답 데이터
});

server.listen(port, hostname, ()=>{
    console.log(`석훈's Server running at ${hostname}:${port}/`);
}); // 서버 실행