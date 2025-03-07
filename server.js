//환경 변수 설정
const dotenv = require('dotenv').config();

// 몽고디비 연결
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;

const express = require('express');
const app = express();
const mysql2 = require('mysql2');
const sha = require('sha256');

app.set('view engine', 'ejs'); //ejs 뷰 엔진 사용

//body-parser 라이브러리(미들웨어) 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); //json 형식의 데이터를 받기 위한 설정
//정적파일(css, js, image) 위치 설정 -> 아래 설정 후static 폴더 생성하기
app.use(express.static('public'));

//라우터 추가
app.use('/', require('./routes/post.js'));
app.use('/', require('./routes/add.js'));
app.use('/', require('./routes/auth.js'));

// process.env.환경변수명
const url = process.env.DB_URL;

let mydb; // 데이터베이스 객체 참조변수 선언

mongoclient.connect(url).then((client)=>{
  mydb = client.db('myboard');
  app.listen(process.env.PORT, function(){
    console.log("포트 번호 8081으로 서버 대기중 ... ")
  });
}).catch((err)=>{
   console.log("DB 접속 오류", err);
});

const conn = mysql2.createConnection({

    host:process.env.HOST,
    user:process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

conn.connect(function(err){
    if(err){
        console.log("접속 오류", err);
        return;
    }
    console.log("접속 성공");
});



app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
});
app.get('/welcome', function(req, res){
  res.send('<html><body> <h1>/welcome<h1> <marquee>사용자님 환영합니다!.<marquee/></body></html>');
});


app.get('/', function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs', {user:null});
});
        

let cookieParser = require('cookie-parser');
app.use(cookieParser('ncvka0e39842kpfd'));

app.get('/cookie', function(req, res){
  let milk = parseInt(req.signedCookies.milk)+ 1000;
  if(isNaN(milk)){
    milk=0;
  }
  //res.cookie('milk', '1000원'); //response객체에 실어서 브라우저로 전달
  res.cookie('milk', milk, {signed : true }); //response객체에 실어서 브라우저로 전달
  //res.send('product :' +req.cookies.milk);//요청을 받으면 request로 넘어옴
  res.send("product : " + milk+"원");
});

let session = require('express-session');
app.use(session({
  secret : 'dkufe8938493j4e08349u',
  resave : false,
  saveUninitialized : true
}));

app.get('/session', function(req, res){
  if(isNaN(req.session.milk)){
    req.session.milk = 0;
  }
  req.session.milk += 1000;
  res.send("product : " + req.session.milk+"원");
});



  //검색요청 기능
  app.get('/search', function(req, res){
    console.log(req.query); // 127.0.0.1:8080/search?value=서시 로 넘어온 값,query속성에서 구함.
    //몽고디비에서 데이터 조회
    mydb.collection("post").find({title:req.query.value}).toArray().then((result)=>{
      console.log(result);
      //검색결과 페이지로 이동
      res.render("sresult.ejs", {data:result});
     });
  });