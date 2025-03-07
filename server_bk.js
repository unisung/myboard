const express = require('express');  // Import express
const path = require('path');
const app = express(); // Initialize express

app.use(express.static('assets'));// 서버에 접속시 public 폴더를 루트로 설정

const bodyParser = require('body-parser'); // Import body-parser
app.use(bodyParser.urlencoded({extended: true})); // Use body parser

app.listen(8080, function(){
    console.log('포트 8080으로 서버 대기중 ...');
}); // Listen to a port

//클라이언트에서 get방식으로 요청시 처리하는 메소드 get()
app.get('/book',function(request, response){
  response.send('도서 목록 관련 페이지입니다.'); //응답으로 데이타 전송
});

//클라이언트에서 get방식으로 요청시 처리하는 메소드 get()
// app.get('/',function(request, response){
//   response.send('/ 홈경로입니다.');
// });

//클라이언트에서 get방식으로 요청시 처리하는 메소드 get()
app.get('/welcome',function(request, response){
  response.send('<html><body> <h1>/welcome</h1> <marquee>홍길동님 환영합니다..</marquee></body></html>');
});

app.get('/', (request,response)=>{
  console.log(__dirname);
  response.sendFile(__dirname + '/index.html'); //파일을 읽어 응답으로 전송 'c:\Servers\index.html'
});

app.get('/signin', (request,response)=>{
  console.log(request.params.id, request.query.password);
  console.log(__dirname);
  response.sendFile(path.join(__dirname , '/signin.html')); //파일을 읽어 응답으로 전송 'c:\Servers\signin.html'
});


app.post('/signin', (request,response)=>{
  console.log(__dirname);
  response.send('<html><body><h1>환영합니다.</h1></body></html>'); //파일을 읽어 응답으로 전송 'c:\Servers\signin.html'
});

//'/enter'로 요청시 처리하는 메소드
app.get('/enter', (req,res)=>{
  res.sendFile(__dirname + '/enter.html'); //파일을 읽어 응답으로 전송 'c:\Servers\enter.html'
}); 

app.post('/save', (req,res)=>{
  console.log(req);
  console.log("저장완료");
  console.log(req.body.title, req.body.content);
}); 


