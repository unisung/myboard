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

//localhost:127.0.0.1:8080/list 요청에 대한 처리 루틴
  // 데이터 조회 query("SQL문", 콜백함수(err,rows,fields){})
  router.get("/list",function(req,res){
    mydb.collection("post").find().toArray().then((result)=>{
       console.log(result);     
      //ejs파일을 이용하여 데이터 전송
     res.render('list.ejs', {data:result});
  
    }).catch((err)=>{
      console.log("데이터 조회 실패", err);
    });
     //client로 결과 페이지 전송
     //res.sendFile(__dirname + '/list.html');
  });

//클라이언트에서 ajax로 localhost:8080/delete 요청에 대한 처리 루틴
router.post("/delete", function(req, res){
  console.log("1:",req.body._id);

  if (!req.body._id || !ObjId.isValid(req.body._id)) {
   console.log('2.error: ',"유효하지 않은 ID 값입니다." );
  }
 //몽고디비의 _id값으로 id객체 생성하기
  req.body._id = new ObjId(req.body._id);
  console.log('3.삭제할 번호:', req.body); //삭제할 번호

  //삭제할 데이터의 _id값을 이용하여 삭제
  mydb.collection("post").deleteOne({_id:req.body._id}).then((result)=>{
    console.log("삭제완료", result);//4.삭제완료
    //클라이언트에게 응답
    res.status(200).send(); //ok
  }).catch((err)=>{
    console.log("삭제실패", err);
    res.status(500).send(); //server error
  });
});

// '/content' 요청에 대한 처리 루틴
router.get('/content/:id', function(req, res){
  // 파라미터로 전달된 id값 출력
  console.log("id:", req.params.id);

  //몽고디비의 _id값으로 id객체 생성하기
  req.params.id = new ObjId(req.params.id);
  //_id에 해당하는 내용 조회
  mydb.collection("post").findOne({_id:req.params.id}).then((result)=>{
    console.log("조회완료", result);
    //ejs파일을 이용하여 데이터 전송
    res.render('content.ejs', {data:result});
  }).catch((err)=>{
    console.log("조회실패", err);
  });
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


//수정페이지
router.get("/edit/:id", function(req, res){
   req.params.id = new ObjId(req.params.id);
   mydb.collection("post").findOne({_id:req.params.id}).then((result)=>{
     console.log("조회완료", result);
     res.render('edit.ejs', {data:result});
   });
});
//수정처리
router.post("/edit",function(req,res){
  console.log(req.body);
  req.body.id = new ObjId(req.body.id);
  mydb.collection("post").updateOne(
    {_id:req.body.id},
    {$set:{title:req.body.title, 
           content:req.body.content, 
           date:req.body.someDate,
          path:imagepath}}
     ).then((result)=>{
    console.log("수정완료", result);
    res.redirect("/list"); //목록페이지로 이동
  }).catch((err)=>{
    console.log("수정실패", err);
  });
});



  module.exports = router;