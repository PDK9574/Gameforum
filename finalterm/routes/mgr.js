var express = require('express');
var router = express.Router();
const db = require("../db");
var path = require('path');
var fs = require('fs');
const app = require('../app');
const async = require("async");
const { strictEqual } = require('assert');
const { stringify } = require('querystring');
const { data } = require('jquery');


router.route("/")
    .get((req,res,next) => {
        db.get(`select count(*) as count , blow from blowtable where id = 1`,(err,row) => {
            if(row.count==0){
                db.run(`insert into blowtable(id,blow) values(?,?)`,[1,0],(err) =>{
                    console.log("ssss")
                }) 
            }
            res.render("tsj",{rows:"",boardid:"",row:row});
        })
    })
    .post((req,res,next) => {
        let boardid = req.body.boardid;
        console.log(boardid);
            db.get(`select blow from blowtable where id = 1`,(err,row) => {
             
                db.all(`select id ,title , content,report from messages${boardid} `,(err,rows) =>{
                    if(err){res.send(err.message)};
                
                    res.render("tsj",{rows:rows,boardid:boardid,row:row});
                })
            })
    })
router.route("/delete/:boardid/:messageid")
    .get((req,res,next) =>{
        let messageid = req.params.messageid;
        let boardid = req.params.boardid;
            db.get(`select blow from blowtable where id = 1`,(err,row) => {
                if(row.blow>=15){
                    row.blow-=15;
                    db.run(`delete from  messages${boardid} where id = ?`,[messageid],(err) =>{});
                    db.run(`update blowtable set blow = ? where id= 1  `,[row.blow],(err) =>{});
                   
                }else{
                   
                }
            })    
        res.redirect("/mgr");
    })
router.route("/blow")
    .post(async(req,res,next) => {
        let data=req.body;  
        
        console.log(data.blow);
       
        setTimeout(function(){
            db.get(`select blow,count(*)  as count from blowtable where id = 1`,(err,row) => {
                if(err){res.send("select problem"+err.message)}
                if(row.count==0){
                    db.run(`insert into blowtable(blow) values(?)`,[1],(err) =>{})
                }else{
                    let blow=row.blow+1;
                    db.run(`update blowtable set blow = ? where id= 1  `,[blow],(err) =>{
                        console.log("succes")
                    })
                }
            }),4000
        })
        res.render("tsj",{rows:"",boardid:""});
    })

module.exports=router;