const e = require('express');
var express = require('express');
var router = express.Router();
const db = require('../db');
var fs = require('fs');
var path = require('path');

const moment = require("moment");
const { title } = require('process');
const async = require("async");

function getTime() {
    let time = moment().format("h: mm a")
    return time
}
var loginCheck = (req, res, next) => {
    if (req.session.user) {
        var user = req.session.user;
        console.log('current user: ' + user.email);
        next();
    } else {
        console.log('請重新登入');
        res.redirect('/login');
    }
}
router.route("/board/:id")
    .get((req, res, next) => {
        let id = req.params.id;
        db.all(`select p.photoname from persondata p , messages${id} m where   m.author = p.id`, (err, row) => {
            console.log(row);
        

            db.all(`select  m.title, m.content  from messages${id} m`, (err, rows) => {
                if (err) { console.log("board有錯誤！" + err.message); }
               
                res.render(`board${id}`, { id: id  ,rows : rows, row : row });
            });
        });
        
    });
router.get('/msglist/:id', (req, res, next) => {
    var id  = req.params.id;
    
    db.all(`select r.click from messages${id} m ,rate r where r.articleid = m.id and r.boardid  = m.boardid`, (err, rate) => {
        if (rate) {
            db.all(`select m.id,m.title, m.content, m.lastupdatedtime, m.author,m.authorname, u.email,u.username
                from messages${id} m, users u
                where m.author = u.id`, (err, rows) => {
                console.log(rows);
                if (err) { return console.log('msg list有錯誤！' + err.message); }
                if (rows) {
                    res.render('msglist', { rows: rows, rate: rate ,id: id});
                } else {
                    res.render('msglist', { rows: "", rate: rate, id: id })
                }
            });
        } else {
            db.all(`select m.id,m.title, m.content, m.lastupdatedtime, m.author,m.authorname, u.email,u.username
                from messages${id} m, users u
                where m.author = u.id`, (err, rows) => {
                if (err) { return console.log('msg list有錯誤！' + err.message); }
                if (rows) {

                    res.render('msglist', { rows: rows, rate: "" ,id : id});
                } else {
                    res.render('msglist', { rows: "", rate: "" , id : id})
                }
            });
        }
    })
});
router.use("/search/:id", loginCheck)
router.route("/search/:id")
    .post((req, res, next) => {
        let id = req.params.id;
        var user = req.session.user;
        var titlevalue = req.body.titlevalue;
        db.all(`select r.click from messages${id} m ,rate r where r.articleid = m.id`, (err, rate) => {
            if(err){res.send(err.message+"星星問題")}
            db.all(`select m.id,m.title, m.content, m.lastupdatedtime, m.author,m.authorname, u.email,u.username
                from messages${id} m, users u
                where m.author = u.id and m.title LIKE ? `, ["%" + titlevalue + "%"], (err, rows) => {
                if (err) { return console.log('msg list有錯誤！' + err.message); }
                if (rows) {
                    console.log(rows);
                    res.render('msglist', { rows: rows, rate:rate,id:id});
                } else {
                    res.render('msglist', { rows: rows,rate:rate,id:id })
                }
            });
        })
    });
router.use("/create/:id",loginCheck)

router.get('/create/:id', function (req, res, next) {
    var user = req.session.user;
    let id =req.params.id;
    console.log(id);
    res.render('create', { user: user,id : id });
});

router.post('/create/:id', function (req, res, next) {
    let id =req.params.id;
    var user = req.session.user;
    var title = req.body.title;
    var content = req.body.content;
    title=title.trim();
    content=content.trim();
    db.run(`insert into messages${id}(title, content, lastupdatedtime, author,authorname,boardid,report)
        values (?, ?, ? ,?,?,?,?)`, [title, content, getTime(), user.id, user.username,id,0],
        (err) => {
            if (err) { res.send('新增留言錯誤，' + err.message); }
            else {
                console.log(`messages${id}`)
                console.log('新增成功！');
                res.redirect(`/msgs/msglist/${id}`);
            }
        });
});

router.post('/articlephoto/:id', function (req, res, next) {
    let id = req.params.id;
    let user = req.session.user;
    let myfile = req.files.myfile;
    const basepath = "./public/articlepicture";
    let savepath = path.join(basepath, myfile.name)
    myfile.mv(savepath);
    db.get(`select count(articlephotoname) as rowCount from messages${id} where `)
    db.run(`insert into messages(articlephotoname , articlephotopath) values (?, ? )`, [myfile.name, savepath], (err, row) => {
        if (err) { res.send('新增留言錯誤，' + err.message) }
        else {
            console.log("new picture")
            res.redirect(`/msgs/create/${id}`);
        }
    })

});

var permissionCheck = (req, res, next) => {
    var user = req.session.user;
    var id = req.params.id;
    let board =req.params.board;
    db.get(`select id from messages${board} where id = ? and author=?`, [id, user.id],
        (err, data) => {
            if (err) { return console.log('選擇訊息資料錯誤！' + err.message); }
            if (data) {
                next();
            } else {
                res.send('你沒有權限！');
            }
        });
}



router.get('/edit/:board/:id',permissionCheck, function (req, res, next) {
    let board = req.params.board;
    var user = req.session.user;
    var id = req.params.id;
   
    db.get(`select id,title, content from messages${board} where id = ?`, id,
        (err, data) => {
            if (err) { return console.log('選擇訊息資料錯誤！' + err.message); }
            res.render('edit', { data: data, user: user,board:board});
        });
});

router.post('/edit/:board/:id', function (req, res, next) {
    let board = req.params.board;
    var id = req.params.id;
    var title = req.body.title;
    var content = req.body.content;
    var user = req.session.user;
    title=title.trim();
    content=content.trim();
    db.run(`update messages${board} set title = ? , content = ?, lastupdatedtime=? 
    where id=? and author=?`,
        [title, content, getTime(), id, user.id], (err) => {
            if (err) { res.send('update error, ' + err.message); }
            res.redirect(`/msgs/lookarticle/${board}/${id}`);
        });
}); 

router.use("/delete/:board/:id",permissionCheck)

router.get('/delete/:board/:id', permissionCheck, (req, res, next) => {
    let board =req.params.board;
    var id = req.params.id;
    var user = req.session.user;
    db.run(`delete from messages${board} where id=?  and author=?`,
        [id, user.id], (err) => {
            if (err) { res.send('delete error, ' + err.message); }
            res.redirect(`/msgs/msglist/${board}`);
    });
});
router.get('/report/:board/:id' , async(req, res, next) => {
    let board =req.params.board;
    var id = req.params.id;
    var user = req.session.user;
    async.waterfall([
        function(callback){
          db.get(`select report from  messages${board} where id=?`,[id],(err,row) => {
            
            row.report+=1;
            callback(null,row.report)
          })
        }
      ],function (err,report) {
        db.run(`update messages${board} set report = ? where id = ? `,[report,id],(err) => {
            if(err){res.send(err.message+"report problem")}
          
        })
      })
   
   
    res.redirect(`/msgs/lookarticle/${board}/${id}`);
});


router.use("/lookarticle/:board/:id", loginCheck)
router.route("/lookarticle/:board/:id")
    .get((req, res, next) => {
        let board =req.params.board;
        var user = req.session.user;
        var id = req.params.id;
        db.serialize(function () {
            db.get(`select  photoname from persondata where id = ?`,[user.id],(err,photo) => {
                if(err){res.send(err.message+"照片問題")}
                db.get(`select m.id ,m.title, m.content , m.lastupdatedtime , m.author from messages${board} m  where m.id = ? `, [id ], (err, row) => {
                    console.log(row)
                    //顯示平均星星分數跟點擊次數跟文章
                    db.get(`select username , createdtime from users where id = ?`,[row.author],(err,writer) => {
                        if(err){res.send(err.message+"authot problem")};
                        db.all(`select r.rating ,r.click ,r.articleid from rate r where r.articleid = ? and boardid = ?`, [id , board], (err, allrate) => {
                            let totalrate = 0;
                            let totalclick = 0;
                            if (allrate) {
                             
                                for (i = 0; i < allrate.length; i++) {
                                    totalrate += allrate[i].rating;
                                }
                                for (i = 0; i < allrate.length; i++) {
                                    totalclick += allrate[i].click;
                                }
                             
                                res.render("lookarticle", { id: row.id, userid: user.id, title:row.title , content: row.content, lastupdatedtime: row.lastupdatedtime, author: row.author, rating: totalrate, click: totalclick, allrate: allrate,  board:board,photo:photo,writer:writer });
                            } else {
                                res.render("lookarticle", { id: row.id, userid: user.id, title:row.title , content: row.content, lastupdatedtime: row.lastupdatedtime, author: row.author, rating: "", click: "", allrate: "" ,board:board,photo:photo,writer:writer})
                            }
                        })
                    })
                })
            })
        })
    })


    .post((req, res, next) => {
        let board =req.params.board;
        let id = req.params.id;
        var rating = parseInt(req.body.rating, 10);
        var click = parseInt(req.body.click, 10);
        var articleid = req.params.id;
        var critic = req.session.user.id;
        console.log(rating);
        console.log(click);
        console.log(articleid);
        console.log(critic);
        //輸入星星分數跟點擊次數
        db.serialize(function () {
            db.get(`select  r.rating , r.click ,r.critic, r.articleid, r.boardid from rate r where r.critic = ? and r.articleid = ? and r.boardid = ? `, [critic, articleid, board], (err, row) => {
                if (row) {
                    var newclick = row.click + click;

                    db.run(`update rate set rating = ? , click = ?  where articleid = ? and critic = ?`, [rating, newclick, articleid, critic], (err) => {
                        if (err) { res.send('update error, ' + err.message); }
                        else {
                            console.log("更新成功")
                        }
                    })
                } else {
                    db.run(`insert into rate( rating, click , critic , articleid , boardid ) values (  ?, ?, ? ,? ,?)`, [rating, click, critic, articleid, board],
                        (err) => {
                            if (err) { res.send('新增個人資料錯誤，' + err.message); }
                            else {
                                console.log('新增成功！');

                            }
                        });
                }
                res.redirect(`/msgs/lookarticle/${board}/${id}`);
            })
        })
    });

/* 準確搜尋值
function searchKeyValue(database,key,value){
    let result = [];
    let res =database.filter(item =>  item[key]==value )
    result.push(res)
    console.log(result) 
}
*/

router.route("/respond/:board/:id")
    .get((req,res,next) => {
        
    })
module.exports = router;
