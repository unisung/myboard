const dotenv = require('dotenv').config();
const mongoclient = require('mongodb').MongoClient;
const url = process.env.DB_URL;
const path = require('path');
const { ObjectId } = require('mongodb');
const express = require('express');
const { MongoClient } = require('mongodb');
const sha = require('sha256');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { serialize } = require('v8');

const app = express();
let mydb;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

MongoClient.connect(url).then((client) => {
    mydb = client.db('myboard');
    console.log("✅ MongoDB 연결 성공!");

    app.listen(process.env.PORT, function () {
        console.log("🚀 포트 8080에서 서버 대기 중...");
    });
}).catch((err) => {
    console.error("❌ DB 접속 오류:", err);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('ncvka0e39842kpfd'));
app.use(session({
    secret: 'dkufe8938493j4e08349u',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30일로 설정
    }
}));

// 자동 로그인 체크 미들웨어
app.use(function (req, res, next) {
    if (req.session.userid) {
        return next();
    }

    const autoLoginToken = req.signedCookies.autoLoginToken;
    if (!autoLoginToken) {
        return next();
    }

    mydb.collection("account").findOne({ autoLoginToken: autoLoginToken })
        .then((user) => {
            if (user) {
                req.session.userid = user.userid;
                console.log("자동 로그인 성공:", user.userid);
            }
            next();
        })
        .catch((err) => {
            console.error("자동 로그인 처리 중 오류:", err);
            next();
        });
});

function checkLogin(req, res, next) {
    console.log("세션 확인:", req.session);
    if (!req.session.userid) {
        console.log("로그인 필요: 세션에 userid 없음");
        return res.redirect("/login");
    }
    console.log("로그인 확인됨:", req.session.userid);
    next();
}

app.get('/', function (req, res) {
    res.render('login.ejs');
});

app.get('/index', checkLogin, function (req, res) {
    res.render('index.ejs', { user: req.session.userid });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/enter', checkLogin, function (req, res) {
    res.render('enter.ejs');
});

app.get('/content/:id', checkLogin, function (req, res) {
    const postId = req.params.id;
    const objectId = new ObjectId(postId);

    if (!ObjectId.isValid(postId)) {
        return res.status(400).send("유효하지 않은 ID입니다.");
    }

    mydb.collection("post").findOne({ _id: objectId })
        .then((result) => {
            if (!result) {
                return res.status(404).send("게시글을 찾을 수 없습니다.");
            }
            res.render('content.ejs', { data: result });
        })
        .catch((err) => {
            console.log("게시글 조회 실패", err);
            res.status(500).send("서버 오류로 게시글을 불러오지 못했습니다.");
        });
});

app.get("/edit/:id", checkLogin, function (req, res) {
    const postId = req.params.id;

    if (!ObjectId.isValid(postId)) {
        return res.status(400).send("유효하지 않은 ID입니다.");
    }

    const objectId = new ObjectId(postId);

    mydb.collection("post").findOne({ _id: objectId })
        .then((result) => {
            if (!result) {
                return res.status(404).send("게시글을 찾을 수 없습니다.");
            }
            console.log("조회완료", result);
            res.render('edit.ejs', { data: result });
        })
        .catch((err) => {
            console.error("게시글 조회 실패", err);
            res.status(500).send("서버 오류로 게시글을 불러오지 못했습니다.");
        });
});

app.get('/cookie', function (req, res) {
    let milk = parseInt(req.signedCookies.milk) || 0;
    milk += 1000;

    res.cookie('milk', milk, { signedmaxAge: 3600000, httpOnly: true });
    res.send("product : " + milk + "원");
});

app.get('/session', function (req, res) {
    if (isNaN(req.session.milk)) {
        req.session.milk = 0;
    }
    req.session.milk += 1000;
    res.send("product : " + req.session.milk + "원");
});

app.get("/login", function (req, res) {
    if (req.session.userid) {
        console.log("세션 유지");
        res.render("index.ejs", { user: req.session.userid });
    } else {
        res.render("login.ejs");
    }
});

app.get("/logout", function (req, res) {
    console.log("로그아웃");

    const userid = req.session.userid;

    req.session.destroy();

    res.clearCookie('autoLoginToken');

    if (userid) {
        mydb.collection("account").updateOne(
            { userid: userid },
            { $unset: { autoLoginToken: "" } }
        ).catch(err => {
            console.error("토큰 삭제 중 오류:", err);
        });
    }

    res.redirect("/");
});

app.get("/signup", function () {
    res.render("signup.ejs");
});

app.get('/search', function (req, res) {
    const searchQuery = req.query.value;

    if (!searchQuery) {
        return res.redirect('/list');
    }

    mydb.collection('post').find({ title: { $regex: searchQuery, $options: 'i' } }).toArray().then((result) => {
        console.log("검색 결과:", result);
        res.render('sresult.ejs', { data: result, searchQuery: searchQuery });
    }).catch((err) => {
        console.error("❌ 검색 실패:", err);
        res.status(500).send("데이터 조회 중 오류 발생");
    });
});

app.use('/', require('./routes/posts'));
