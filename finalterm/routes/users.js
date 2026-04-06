var express = require('express');
const db = require('../db');
var router = express.Router();
var path = require('path');
var fs = require('fs');

const { time } = require('console');
const { CLIENT_RENEG_WINDOW } = require('tls');
const async = require("async");


const { hostname } = require('os');
const moment = require('moment');

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


/* GET users listing. */
router.get('/',loginCheck, function (req, res, next) {
 
    db.get('select photoname, interest1, interest2,interest3,interest4 , userid from persondata where id = ?', req.session.user.id, (err, row)=>{
      if(row){
        let chk1 = row.interest1; 
        let chk2 = row.interest2;
        let chk3 = row.interest3;
        let chk4 = row.interest4;
        let photoname=row.photoname;
        res.render('userdata', { 
          user: req.session.user,
          chk1: chk1,
          chk2: chk2,
          chk3: chk3,
          chk4: chk4,
          photoname:photoname
        });    
      }else{
        res.render('userdata', { user: req.session.user, chk1:'', chk2:'',chk3:'',chk4:'' ,photoname:''});
      }
    });
});

router.use("/save",loginCheck)

router.post('/save', function (req, res, next) {
  var user = req.session.user;
  var chk1 = req.body.chk1;
  var chk2 = req.body.chk2;
  var chk3 = req.body.chk3;
  var chk4 = req.body.chk4;
  var userage =req.body.userage;
  
  db.get(`select count(id) as rowCount from persondata where id = ?`, user.id, (err, row) => {
    var rowCount = row.rowCount;
    console.log(row)
    if (rowCount == 0) {
      db.run(`insert into persondata(userage, interest1, interest2, interest3, interest4 , lastupdatedtime, userid)
        values ( ? , ?, ?, ?, ? , ? ,?)`, [ userage,chk1, chk2, chk3, chk4 , new Date().toLocaleString(), user.id],
        (err) => {
          if (err) { res.send('新增個人資料錯誤，' + err.message); }
          else {
            
            console.log(user);
            console.log('新增成功！');            
            res.redirect('/users');
          }
        });
    } else if (rowCount == 1) {
      db.run('update persondata set userage=?,interest1=?, interest2=?, interest3=? , interest4=? , lastupdatedtime=? where id = ?',
      [userage, chk1, chk2, chk3, chk4, new Date().toLocaleString(), user.id], (err)=>{
        if (err) { res.send('更新個人資料錯誤，' + err.message); }
        else {
          
          
          console.log('更新成功！');
          res.redirect('/users');
        }
      });
    } else {
      res.send('.......寫錯了啦');
    }
  });
});
router.post('/savephoto', function (req, res, next) {
  var user = req.session.user;
  var photo = req.files.myfile;
  db.get(`select  count(id) as rowCount,photopath,photoname from persondata where id = ?`, user.id, (err, row) => {
    var rowCount = row.rowCount;
    console.log(row)
    const basepath = './public/personimage';
    var savedpath = path.join(basepath, photo.name)
    photo.mv(savedpath)
    if (rowCount == 0) {
      db.run(`insert into persondata(photoname,photo,photopath, lastupdatedtime, userid)
        values ( ? , ?, ? , ? ,?)`, [photo.name,savedpath, new Date().toLocaleString(), user.id],
        (err) => {
          if (err) { res.send('新增個人資料錯誤，' + err.message); }
          else {
            
            console.log('新增成功！');
            
            res.redirect('/users');
          }
        });
    } else if (rowCount == 1) {
      //刪除舊圖片
      fs.unlink(`public/personimage/${row.photoname}`,function() {
        console.log("已刪除圖片");
      });

      db.run('update persondata set photoname=? ,photo=? , photopath=? , lastupdatedtime=? where id = ?',
      [photo.name , photo.data, savedpath , new Date().toLocaleString(), user.id], (err)=>{
        if (err) { res.send('更新個人資料錯誤，' + err.message); }
        else {
          
          console.log('更新成功！');
          res.redirect('/users');
        }
      });
    } else {
      res.send('.......寫錯了啦');
    }
  });
});
//show image
router.get('/test', function (req, res, next) {
    db.get('select photo,photopath,photoname, userid from persondata where userid = ?', req.session.user.id, (err, row)=>{
      console.log(row.photopath); 
      console.log(row.photoname);
      res.render('test',{photo: row.photo,photoname: row.photoname,photopath:row.photopath});
    })
  
});
//
router.use("/addfriend",loginCheck)
router.route('/addfriend')
  .get((req, res, next) => {
    let user = req.session.user;
  
    db.all(`select u.id,u.username , p.photoname from users u , persondata p  where u.id=p.id`,(err,row) => {
      if(err){res.send(err.message+"friend problem")}
      if(row){
        console.log(row);
       
          res.render("addfriend",{row:row, user:user });//message:req.flash("info"),
      
      }
    })
  })
router.route("/addfriend/:friend",loginCheck)
  .get((req,res,next) => {
    let friend = req.params.friend;
    console.log(friend);
    let user = req.session.user;
    /*let friend1={id:1,name:"123",email:"aaa"}
    let friend2={id:2,name:"456",email:"bbb"}
    let friend3={id:3,name:"789",email:"ccc"}
    let friend4={id:4,name:"753",email:"ddd"}
    friend1=JSON.stringify(friend1, null, "")
    friend2=JSON.stringify(friend2, null, "")
    friend3=JSON.stringify(friend3, null, "")
    friend4=JSON.stringify(friend4, null, "")
    */
   
  
      db.get(`select uid, touid from friends where uid = ? and touid = ? `,[user.id,friend],(err,row) => {
        if(err){res.send(err.message+"friend problem")}
        if(row){
          console.log("find")
        /* let fy=JSON.parse(friend1);
          console.log(fy.id);
          console.log(row);
          */ 
        }else{
          db.run(`insert into friends(uid,touid,isaccepted,reject) values(?, ?, 0, 0)`,[user.id,friend], (err) => {
            if (err){res.send("錯誤"+err.message)}
          
           
              /*let fy=JSON.parse(friend1);
              console.log(fy.id);
              res.redirect("/addfriend");
              */
            
          })
        }
      })
    
    res.redirect('/users/addfriend');
  })

router.route("/friendreq",loginCheck)
  .get((req,res,next) => {
    let user = req.session.user;
    /*let friend1={id:1,name:"123",email:"aaa"}
    let friend2={id:2,name:"456",email:"bbb"}
    let friend3={id:3,name:"789",email:"ccc"}
    let friend4={id:4,name:"753",email:"ddd"}
    friend1=JSON.stringify(friend1, null, "")
    friend2=JSON.stringify(friend2, null, "")
    friend3=JSON.stringify(friend3, null, "")
    friend4=JSON.stringify(friend4, null, "")
    */
   
      db.all(`select  u.id ,u.username ,f.uid , f.touid , p.photoname  from friends f,users u ,persondata p where f.isaccepted =  0 and f.touid = ? and u.id == f.uid and u.id=p.id`,[user.id],(err,row) => {
        if(err){res.send(err.message+"friend problem")}
        if(row){
          console.log(row);
         
              res.render("friendreq",{row:row });
         
        }
      })
  
  })
router.route("/friendreq/:friend",loginCheck)
  .get((req,res,next) => {
    let user = req.session.user;
    let friend =req.params.friend;
    console.log(friend);
    db.run(`update friends set isaccepted = 1  where uid = ? and touid = ?`,[friend,user.id],(err) => {
      if(err){console.log(err.message)};
      res.redirect('/users/friendreq');
    })
 
   
  })
  
router.route("/friendreject/:friend",loginCheck)
  .get((req,res,next) => {
    let user = req.session.user;
    let friend =req.params.friend;
    console.log(friend);
    db.run(`update friends set isaccepted = 0 , reject = 1 where uid = ? and touid = ?`,[friend,user.id],(err) => {
      if(err){console.log(err.message)};
      res.redirect('/users/friendreq');
    })
 
   
  })
router.route("/friendlist",loginCheck)
  .get((req,res,next) => {
    let user = req.session.user;
    db.all(`select  u.id ,u.username ,f.uid , f.touid , p.photoname from friends f,users u ,persondata p  where f.isaccepted =  1 and f.touid = ? and u.id == f.uid and u.id=p.id`,[user.id],(err,row) => {
      if(err){res.send(err.message+"friend problem")}
      if(row){
        console.log(row);
            res.render("friendlist",{row:row,user:user });
      }
    })
 
   
  })

router.route('/deletefriend/:friend')
  .get((req, res, next) => {
    let user = req.session.user;
    let friend = req.params.friend;
    db.run(`delete from friends where touid = ? and uid = ? `,[user.id,friend],(err) => {
      if(err){res.send(err.message_+"delete problem")}
      res.redirect('/users/friendlist');
    })
  })
  .post((req, res, next) => {


  })
router.route("/creategroup")
  .get((req,res,next) => {
    let user = req.session.user;
    
    db.all(`select id, name ,members,hostid from groups `,(err,rows) => {
      let member =getMember(rows);
      db.all(`select  u.id ,u.username ,f.uid , f.touid , p.photoname from friends f,users u ,persondata p  where f.isaccepted =  1 and f.touid = ? and u.id == f.uid and u.id=p.id `,[user.id],(err,row) => {
        if(err){res.send(err.message+"friend problem")}
        if(row){
            
              res.render("creategroup",{row:row,rows:rows,member:member });
        }
      })
    })
  })
  .post(async(req,res,next) => {
    let user = req.session.user;
    let gname = req.body.gname;
    var members = req.body.members;
    for(i=0;i<members.length;i++){
      async.waterfall([
        function(callback){
          db.get(`select u.id,u.username,p.photoname from  users u , persondata p where u.id = p.id and  u.id=?`,[members[i]],(err,row) => {
            if(err){res.send(err.message)};
            console.log(row);
            callback(null,row.id,row.username,row.photoname)
          })
        }
      ],function (err,id,username,photoname) {
        if(err){console.log(err.message)};
        db.run(`insert into groups(name,members,username,photoname,hostid) values(?,?,?,?,?)`,[gname,id,username,photoname,user.id],(err) => {
          if(err){res.send(err.message)};
          console.log(id+username+photoname);
          
        })
      })
    }
    res.redirect("/users/grouplist")
     
    })
router.route("/getmembers") 
  .post((req,res,next) => {
    db.get(`select members from groups where id = 1`,(err,row) => {
        row.members=row.members.split(",").filter((member) => member!="");
        console.log(row.members)
        res.redirect("/users/creategroup")
   
    })
  })
  //useless
 
    
  function getMember(array) {
    const anss = [];
    array.forEach(element => {
      let ans=element.members.split(",");
      ans=ans.filter(item => item!="");
      anss.push(ans)
     
    })
    return anss;
  }
  function getText(array) {
    const anss = [];
   
    array.forEach(element => {
      let ans=element.text.split("~");
      ans=ans.filter(item => item!="");
      anss.push(ans)
     
    })
    return anss;
  }
router.use("/grouplist",loginCheck);
router.route("/grouplist")
  .get((req,res,next) => {
    //json物件建立
    const set = new Set();
    let user = req.session.user;
      db.all(`select  u.id ,u.username ,f.uid , f.touid , p.photoname from friends f,users u ,persondata p  where f.isaccepted =  1 and f.touid = ? and u.id == f.uid and u.id=p.id `,[user.id],(err,row) => {
        db.all(`select id, name ,members,hostid from groups `,(err,rows) => {
          //去重複計算出現幾次
          var repeat ={};
          rows.filter(function(element,index,arr){
            let key=element.name;
            
            if(repeat[key]){//不可使用repeat.key 因為key 為string
              repeat[key]+=1;//key值加1
            
            }else{
              repeat[key]=1//新增key值為1
            }
          })
       
          //去重複計算出現幾次
          rows=rows.filter(item => !set.has(item.name)?set.add(item.name):false);//去重複,回傳陣列
          console.log(rows)
          var newrow=[]
          for(let key in repeat){
          async.waterfall([
          function(callback){
            groupname=key;//key 名子
            callback(null,groupname)
          },
          function(name,callback){
            value=repeat[key]// value 值  
            callback(null,name,value);
          }],
          function (err,name,value) {
            if(err){console.log(err.message)};
            newrow.push({"name":name,"value":value})
          }
          )       
          } 
          for(i=0;i<newrow.length;i++){
            newrow[i]["hostid"]=rows[i].hostid;//新增hostid
          }
          console.log(newrow);
          res.render("grouplist",{rows:rows,newrow:newrow,row:row});
        })
      })
    })
router.route("/group/:groupname")
  .get((req,res,next) => {
    let groupname = req.params.groupname;
    let user = req.session.user;

      db.all(`select name,username,text,time from groupstext where name = ?`,[groupname],(err,row) =>{
          if(err){res.send(err.message+"grouptext error")}
        db.all(`select name ,username,members,  photoname , hostid from groups where name = ? `, groupname , (err,rows) => {
         
          if(err){throw err};
          console.log(rows);
          res.render("group", { rows:rows,  row:row  ,groupname:groupname });
        })
      })
    })


router.route("/grouptext/:groupname")
  .post((req,res,next) => {
    let user = req.session.user;
    let text=req.body.grouptext;
    let groupname = req.params.groupname;
    console.log(user);
      db.run(`insert into groupstext(name,username,text,time) values(?,?,?,?)`,[groupname,user.username,text,moment().format("h:mm a")],(err) =>{
        if(err){console.log(err)};
        res.redirect(`/users/group/${groupname}`)
      })
      
    })
    
router.use("/searchfriend",loginCheck);
router.route("/searchfriend")
  .post((req,res,next) =>  {
    let friendname = req.body.friendname;
    /* ajax let data =JSON.parse(JSON.stringify(req.body));
    console.log(data); */
    let user = req.session.user;
    db.all(`select  u.id ,u.username ,f.uid , f.touid , p.photoname from friends f,users u ,persondata p  where f.isaccepted =  1 and f.touid = ? and u.id == f.uid and u.id=p.id and u.username Like ? `,[user.id,"%"+friendname+"%"],(err,row) => {
      if(err){res.send(err.message+"friend problem")}
      if(row){
        console.log(row);
            res.render("friendlist",{row:row,user:user });
      }
    })
 
  })

module.exports = router;
