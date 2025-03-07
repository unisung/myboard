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

// localhost:8080/enter 요청에 대한 처리 루틴
router.get('/enter', function(req, res){
  // res.sendFile(__dirname + '/enter.html');
  res.render('enter.ejs');
});

// localhost:8080/save 요청에 대한 처리 루틴
router.post('/save',function(req,res){
  console.log(req.body.title); // 입력한 제목
  console.log(req.body.content);  // 입력한 내용
  console.log("imagepath:"+imagepath); // 이미지 경로
  
  //MongoDB에 데이터 저장
mydb.collection("post").insertOne(
  {title:req.body.title, 
    content: req.body.content, 
    date:req.body.someDate,
    path:imagepath
  }
).then((result)=>{
  console.log("저장완료", result);
});
    // res.send("데이타 추가 성공");
    res.redirect("/list"); //목록페이지로 이동
});


//이미지 업로드
let multer = require('multer');
let storage = multer.diskStorage({
  destination : function(req,file, done){
    done(null, './public/image')
  },
  filename : function(req, file, done){
    done(null, file.originalname);
  }
})
let upload = multer({storage:storage});

//이미지 경로 저장 변수
let imagepath = '';

//이미지 업로드 처리
router.post('/photo', upload.single('picture'), function(req, res){
  console.log("서버에 파일 첨부하기 : "+ req.file.path);
  imagepath = '\\' + req.file.path; //이미지 경로 저장
  console.log("이미지 경로 : "+ imagepath);
});


//모듈 내보내기
module.exports = router;