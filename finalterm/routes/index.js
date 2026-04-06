var express = require('express');

var router = express.Router();
var file = "msgboard.db";
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);


const bcrypt = require('bcrypt');
const saltRounds = 10;

const nodemailer = require('nodemailer');
const { error } = require('jquery');
const e = require('express');
const moment = require("moment");



/* GET home page. */
router.get('/', function (req, res, next) {

  //res.render('index', { title: 'Express', email: req.session.user.email });    
  res.redirect('/homepage');

  //res.render('index', { title: 'Express', email: '' })


});



router.route('/register')
  .get((req, res, next) => {
    res.render('register');
  })
  .post((req, res, next) => {
    var email = req.body.email;
    var password = req.body.password;
    var confirmpassword = req.body.confirmpassword;
    var username = req.body.username;

 
    if (email == "" || password == "" || confirmpassword == "") {
      res.send("帳密不能為空")
    }

    else if (password == confirmpassword) {
      db.get(`select email from users where email = ?`, [email], (err, row) => {
        if (!row) {
          /*bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                newUser.password = hash;
                newUser.save(callback);
                });
            }); */
          bcrypt.hash(password, saltRounds, function (err, hash) {
            db.run('insert into users(email,username, password, createdtime) values(?,?,?,?)',
              [email, username, hash, moment().format("h: mm a")], (err) => {
                if (err) { res.send("註冊錯誤" + err.message); }
                else { 
                  db.run(`insert into persondata(photoname,photopath, lastupdatedtime)
                    values ( ? ,? ,?)`, ["unknown.png", "public/images/unknown.png", moment().format("h: mm a")],
                    (err) => {
                      if (err) { res.send('新增個人資料錯誤，' + err.message); }
                      else {

                        console.log('新增成功！');

                        res.redirect('/login');
                      }
                  });
                }
              });

          });
        }
        else {
          res.send("帳號有人註冊");
        }
      });
    }
    else {
      res.send('兩次密碼不一樣');
    }
  });

router.route('/login')
  .get((req, res, next) => {
   
    res.render('login');
  })
  .post((req, res, next) => {
    var email = req.body.email;
    var password = req.body.password;
    if(email=="tsj@ntub.edu.tw"&& password=="123"){
      res.redirect("/mgr")
    }else{
      db.get('select id, email, username, password from users where email = ?', email, (err, user) => {
        if (err) res.send('取得帳號錯誤, ' + err.message);
        if (user) {
          var hashpwd = user.password;
          bcrypt.compare(password, hashpwd, function (err, result) {
            if (result) {
              req.session.user = user;
              //res.send('登入成功');
              res.redirect('/homepage');
            } else {
              res.status(401)
              res.send("密碼錯誤")
            }
          });
        } else {
          res.status(401).send('沒有這個使用者');
        }
      })
    }
  });



// 寄信驗證碼
function getRandom(x) {
  let confirmpwd = '';
  let random = 0
  for (i = 0; i < 6; i++) {
    random = Math.floor(Math.random() * x)
    confirmpwd += random;
  }
  return confirmpwd;
}
var emailcontent = getRandom(10)
var modifyemail = "";

router.route("/forgotpassword")
  .get((req, res, next) => {
    res.render("forgotpassword");
  })
  .post(async (req, res, next) => {
    let email = req.body.email;
    modifyemail = email;
    console.log(modifyemail);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gameforum0987',
        pass: 'abc87631'
      }
    });

    var mailOptions = {
      from: 'gameforum0987@gmail.com',
      to: `${email}`,
      subject: 'comfirm your account from game forum',
      html: `<p>${emailcontent}<p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);

      }
    });
    res.redirect("/confirmpassword")
  })

router.route("/confirmpassword")
  .get((req, res, next) => {
    console.log(emailcontent);
    res.render("confirmpassword")
  })
  .post((req, res, next) => {
    let confirmpwd = req.body.confirmpwd;
    if (confirmpwd == emailcontent) {
      res.redirect("/modifypassword")
    }
    else {
      res.send("wrong")
    }
  })

router.route("/modifypassword")
  .get((req, res, next) => {
    res.render("modifypassword")
  })
  .post((req, res, next) => {
    let email = modifyemail;
    let newpassword = req.body.newpassword;
    let confirmpassword = req.body.confirmpassword;
    if (newpassword == confirmpassword) {
      console.log(email);
      console.log(newpassword)
      bcrypt.hash(newpassword, saltRounds, function (err, hash) {
        db.run(`update  users set password = ? where email =? `,
          [hash, email], (err) => {
            if (err) { res.send("更新錯誤" + err.message); }
            if (hash) console.log("更新成功")
          });
      });
    }
    res.redirect('/login');
  })
router.route('/chat')
  .get((req, res, next) => {
    res.render('chat.ejs');
  })
  .post((req, res, next) => {

  })

router.get('/homepage', (req, res, next) => {
  let time = moment().format("h: mm a")
  res.render('homepage', { time: time });
});

router.route('/chatlogin')
  .get((req, res, next) => {
    res.render('chatlogin')
  })
  .post((req, res, next) => {

  })
router.route("/group")
  .get((req, res, next) => {
    res.render("group");
  })
module.exports = router;
