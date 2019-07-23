var express = require('express');
var session = require('express-session'); // session 부분 -> 지워도 되는지?
var mysql = require('mysql');
var router = express.Router();
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'nodejs',
  password : '00000000', // 각자 nodejs가 사용할 user, password로 변경 후 작업
  // port : 3306,
  database : 'project',
  charset  : 'utf8'
});

router.use(session({
  secret: '12345',
  resave: false,
  saveUninitialized: true
})); // session 부분-> 지워도 되는지?

/* mysql 접속 및 이용할 데이터베이스 설정 */
connection.connect();
connection.query('USE project', function(err,rows,fields){
  if(!err)
    console.log('Select DB : ', rows);
  else
    consile.log('ERR_', err);
});

/* GET home page */
router.get('/', function(req, res) {
  res.render('main_search', { title: 'Express' });
});

/* GET auth pages */
router.get('/login', function(req, res) {
  if(req.session.user){
    //이미 로그인되어 있을 경우
    res.redirect('/contents');
  }
  else{
    res.render('login', { title: 'Express', ecode: 0 });
  }
});
router.get('/register', function(req, res) {
  if(req.session.user){
    //이미 로그인되어 있을 경우
    res.redirect('/contents');
  }
  else{
    res.render('register', { title: 'Express', ecode: 0 });
  }
});
router.get('/finder', function(req, res) {
  if(req.session.user){
    //이미 로그인되어 있을 경우
    res.redirect('/contents');
  }
  else{
    res.render('finder', { title: 'Express' });
  }
});

/* GET contents pages */
router.get('/contents', function(req, res) {
  res.render('contents', { title: 'Express' });
});

router.get('/profile', function(req, res) {
  if(req.session.user){
    res.render('profile', { title: 'Express' });
  }
  else{
    //로그인하지 않은 경우
    res.send('<script>alert("로그인 해주세요!"); location.href = "/login";</script>');
  }
});

/* GET search pages */
router.get('/search', function(req, res) {
  var sql = "SELECT member_id, member_nick, member_msg FROM member";
  // 회원 추천 및 검색 위해 현재 가입된 회원들의 정보 전달
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.render('sub_search', {
        rows: rows
      });
    }
  });
});

router.post('/sendMessage', function(req, res) {

  if (!req.session.user) {
    res.send('<script>alert("로그인해야 사용할 수 있는 기능입니다!"); location.href = "/search";</script>');
    return;
  } // 로그아웃 시 기능 사용 제한

  var msgInfo = {
    "r_nick": req.body.r_nick, // 받는 사람 임시로
    "s_nick": req.session.user.nick,
    "contents": req.body.msg_cont
  } // DB에 삽입할 쪽지 내용

  if (msgInfo.contents==="") {
    res.send('<script>alert("보낼 내용을 입력해주세요!"); location.href = "/search";</script>');
    return;
  } // 내용이 없을 때 예외 처리
   
  var params_ins = [msgInfo.s_nick, msgInfo.r_nick, msgInfo.contents];
  var sql_ins = 'INSERT INTO message(s_nick, r_nick, contents) values(?, ?, ?)';
  connection.query(sql_ins, params_ins, function (err, rows, fields) {
    if (err) {
      console.log(err);
    }
    else { // msg_info 내용을 message table에 삽입
      console.log(msgInfo);
      console.log('삽입 성공!');
    }
  });

  var sql_udt1 = "ALTER TABLE message AUTO_INCREMENT = 1";
  connection.query(sql_udt1, function (err, rows, fields) {
    if (err) {
      console.log(err);
    }
    else {
      var sql_udt2 = "SET @count=0";
      connection.query(sql_udt2, function (err, rows, fields) {
        if (err) {
          console.log(err);
        }
        else {
          var sql_udt3 = "UPDATE message SET num = @count:=@count+1";
          connection.query(sql_udt3, function (err, rows, fields) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
  }); // 쪽지 삭제 구현 전 임시로 num 갱신 (회원 탈퇴 에서도 쓰임)

  res.send ('<script>alert("쪽지를 보냈습니다!"); location.href = "/search";</script>');
}); // 쪽지 보내기 구현

router.post('/search', function(req, res) {
  res.redirect('/search');
});

/* 로그인, 로그아웃, 회원가입, 회원탈퇴 처리 */

//로그인 처리 알고리즘
router.post('/login', function(req, res){
  /* 변수 선언 */
  var auth = {
    "id": req.body.id,
    "pw": req.body.pw
  } //양식을 임시 저장할 객체
  var sql = 'SELECT * FROM member'; //Mysql 쿼리 양식

  /* 알고리즘 */

  //DB에서 회원정보 읽어와서 사용자가 입력한 내용과 대조
  connection.query(sql, function(err, rows, fields){
	  if(err){
      console.log(err);
    }
    else {
      for(var i=0; i<rows.length; i++){
        if(rows[i].member_id == auth.id && rows[i].member_pw == auth.pw){
          //세션 생성
          req.session.user = {
            "id" : rows[i].member_id,
            "nick" : rows[i].member_nick,
            "name" : rows[i].member_name
          }
          console.log('로그인 처리 - 세션 저장');
          res.send ('<script>alert("로그인 되었습니다!"); location.href = "/contents";</script>');
        }
      }
      //일치하는 id,pw가 없음
      //추후 로그인 에러 페이지로 리다이렉트하는 것으로 변경을 검토
      res.send ('<script>alert("ID와 PW를 다시 확인하여 주십시오!"); location.href = "/login";</script>');
	  }
  });
  //디버깅용 로그
  console.log(auth);
});

//로그아웃 처리 알고리즘
router.get('/logout', function(req, res){
  req.session.destroy();
  console.log('로그아웃 처리 - 세션 삭제');
  res.redirect('/');
});

//회원가입 처리 알고리즘
router.post('/register', function(req, res){
  /* 변수 선언 */
  //양식을 임시 저장할 객체
  var info = {
    "id": req.body.id,
    "pw": req.body.pw,
    "pwck": req.body.pwck,
    "name": req.body.name,
    "nick": req.body.nick,
    "mail": req.body.mail,
    "phone": req.body.phone
  }
  //양식 검증용 정규식
  var RegExp1 = /^[0-9]*$/;
  var RegExp2 = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{1,5}$/;
  //Mysql 쿼리 양식
  var sql = 'INSERT INTO member (member_id, member_pw, member_name, member_nick, member_email, member_phone) VALUES(?, ?, ?, ?, ?, ?)';
  var params = [info.id,info.pw,info.name,info.nick,info.mail,info.phone];

  /* 알고리즘 */
  //사용자가 입력한 회원가입 양식 검증
  if(info.id==""||info.pw==""||info.pwck==""||info.name==""||info.nick==""||info.mail==""||info.phone==""){
    res.send ('<script>alert("회원가입 양식의 모든 필드를 채워주셔야 합니다. 빈 칸은 허용되지 않습니다!"); location.href = "/register";</script>');
  }
  if(info.pw!=info.pwck){
    res.send ('<script>alert("비밀번호와 비밀번호 확인 필드의 값이 서로 다릅니다!"); location.href = "/register";</script>');
  }
  if(!RegExp1.test(info.phone)){
    res.send ('<script>alert("전화번호는 숫자만 입력하여 주십시오! ( - 는 생략해 주십시오.)"); location.href = "/register";</script>');
  }
  if(!RegExp2.test(info.mail)){
    res.send ('<script>alert("이메일 양식이 올바르지 않습니다! ( example@service.com 형식으로 입력해 주십시오)"); location.href = "/register";</script>');
  }

  //양식에 문제 없으면 DB에 저장
  else{
    connection.query(sql, params, function(err, rows, fields){
	    if(err){
        console.log(err);
        res.send ('<script>alert("서버측 사정으로 DB오류가 발생하였습니다. 다음에 다시 이용해 주십시오."); location.href = "/register";</script>');
      }
      else {
        console.log(rows.insertId);
        res.send ('<script>alert("회원가입 되었습니다! 로그인 하여 주십시오."); location.href = "/login";</script>');
	    }
    });
  }
  //디버깅용 로그
  console.log(info);
});

//회원탈퇴 처리 알고리즘
router.post('/resign', function(req, res){
  /* 변수 선언 */
  //양식을 임시 저장할 객체
  var user = req.session.user;
  var auth = {
    "id": req.body.id,
    "pw": req.body.pw
  }
  //Mysql 쿼리 양식
  var sql = 'SELECT member_id FROM member WHERE member_id = ? AND member_pw = ?';
  var params_s = [auth.id, auth.pw];
  var params_d;
  /* 알고리즘 */
  //세션정보 검증 (세션정보의 id값으로 DB에서 비밀번호 조회)
  connection.query(sql, params_s, function(err, rows, fields){
	  if(err || rows[0]==undefined){
      console.log(err);
      res.send ('<script>alert("2차 인증이 실패했습니다. ID와 PW를 다시 확인해 주십시오!"); location.href = "/profile";</script>');
    } //일치하는 id,pw가 없음
    else {
          console.log('회원탈퇴 처리 시작');
          //회원탈퇴 쿼리
          sql = 'DELETE FROM member WHERE member_id = ?';
          params_d = auth.id;
          connection.query(sql, params_d, function(err, result){
            if(err){
              console.log('회원탈퇴 처리 실패 - ', err);
              res.send ('<script>alert("서버측 사정으로 DB오류가 발생하였습니다. 다음에 다시 이용해 주십시오."); location.href = "/profile";</script>');
            } else {
              var sql_udt1 = "ALTER TABLE member AUTO_INCREMENT = 1";
              connection.query(sql_udt1, function (err, rows, fields) {
                if (err) {
                  console.log(err);
                }
              }); // 회원 탈퇴 후 회원 번호 갱신
              
              console.log('회원탈퇴 처리 완료' + result);
              req.session.destroy();
              res.send ('<script>alert("회원탈퇴 되었습니다!"); location.href = "/";</script>');
            }
          });
        }
      });
  //디버깅용 로그
  console.log(auth);
});

module.exports = router;
