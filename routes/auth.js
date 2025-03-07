var router = require('express').Router();

const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
// process.env.환경변수명
const url = process.env.DB_URL;

let mydb; // 데이터베이스 객체 참조변수 선언

mongoclient.connect(url).then((client)=>{
  mydb = client.db(process.env.DATABASE);
}).catch((err)=>{
   console.log("DB 접속 오류", err);
});

const sha = require('sha256');
let session = require('express-session');
router.use(session({
  secret : 'dkufe8938493j4e08349u',
  resave : false,
  saveUninitialized : true
}));

//로그인 폼페이지 요청
router.get("/login", function(req, res){
  if(req.session.userid){
    console.log("세션 유지");
    //res.send("이미 로그인 되어있습니다.");
    res.render('index.ejs', {user : req.session.user});
  }else{
    res.render("login.ejs"); //로그인 페이지로 이동
  }
});

//로그인 처리 요청
router.post("/login", function(req, res){
  console.log("아이디 :" + req.body.userid);
  console.log("비밀번호 :" + req.body.userpw);

 // 몽고디비에서 데이터 조회
 mydb.collection("account").findOne({userid:req.body.userid}).then((result)=>{
  //id가 db에 존지하지않을 경우 발생하는 오류 처리 로직 추가
   if(!result){ // id에 해당하는 데이타가 없는 경우 null 처리
      res.send("아이디가 존재하지 않습니다.");
   }else if(result.userpw == sha(req.body.userpw)){ //id와 비번 둘다 맞는 경우
    req.session.userid = req.body; //세션에 로그인 정보 저장
    console.log('새로운 로그인')
    //res.send("로그인 되었습니다.");
    res.render('index.ejs', {user : req.session.userid});
   }else{
    res.send("비밀번호가 일치하지 않습니다."); //id는 맞고, 비번이 틀린 겨우
   }
 });
});

router.get("/logout", function(req, res){
  console.log("로그아웃");
  req.session.destroy(); //세션 삭제
  //res.redirect("/"); //메인페이지로 이동 (index.ejs)
  res.render('index.ejs', {user:null});
});

//회원가입 폼페이지 요청
router.get('/signup',function(req,res){
  res.render('signup.ejs');
});
//회원가입 처리 요청
router.post('/signup',function(req,res){
  console.log(req.body.userid);
  console.log(sha(req.body.userpw));
  console.log(req.body.usergroup);
  console.log(req.body.useremail);
  //몽고디비에 데이터 저장
  mydb.collection('account').insertOne({
    userid:req.body.userid,
    userpw:sha(req.body.userpw),
    usergroup:req.body.usergroup,
    useremail:req.body.useremail
  }).then((result)=>{
    console.log("저장완료-회원가입 성공", result);
   });
   res.render('index.ejs', {user:null});
  });





//모듈 내보내기
module.exports = router;

