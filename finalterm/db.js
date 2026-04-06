var file = "msgboard.db";

//載入 sqlite3
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

const bcrypt = require('bcrypt');
const saltRounds = 10;




db.serialize(function () {
	
	db.run(`CREATE TABLE if not exists "users" (
		"id"	INTEGER NOT NULL,
		"email" TEXT NOT NULL,
		"username" TEXT NOT NULL,
		"password" TEXT NOT NULL, 
		"createdtime" datetime NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT));`);
	
	db.run(`CREATE TABLE if not exists "friends" (
			"uid" INTEGER,
			"touid" INTEGER,
			"isaccepted" INTEGER,
			"reject" INTEGER
	)`)
	db.run(`CREATE TABLE if not exists "messages1" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages2" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages3" (
				"id"	INTEGER NOT NULL,
				"title" TEXT,			
				"content" TEXT, 
				"lastupdatedtime" datetime ,
				"author" INTEGER ,
				"authorname" TEXT,
				"boardid" INTEGER,
				"report" INTEGER,
				PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages4" (
				"id"	INTEGER NOT NULL,
				"title" TEXT,			
				"content" TEXT, 
				"lastupdatedtime" datetime ,
				"author" INTEGER ,
				"authorname" TEXT,
				"boardid" INTEGER,
				"report" INTEGER,
				PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages5" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages6" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);		
	db.run(`CREATE TABLE if not exists "messages7" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages8" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages9" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages10" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages11" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages12" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "messages13" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);	
	db.run(`CREATE TABLE if not exists "messages14" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);			
	db.run(`CREATE TABLE if not exists "messages15" (
			"id"	INTEGER NOT NULL,
			"title" TEXT,			
			"content" TEXT, 
			"lastupdatedtime" datetime ,
			"author" INTEGER ,
			"authorname" TEXT,
			"boardid" INTEGER,
			"report" INTEGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);									
	db.run(`CREATE TABLE if not exists "persondata" (
				"id"	INTEGER NOT NULL,
				"userage" TEXT ,
				"photo" BLOB ,
				"photoname" TEXT,
				"photopath" TEXT, 
				"lastupdatedtime" datetime NOT NULL,
				"interest1" TEXT,
				"interest2" TEXT,
				"interest3" TEXT,
				"interest4" TEXT,
				"userid" INTEGER ,
				PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "rate" (
			"id"	INTEGER NOT NULL,			
			"rating" INTEGER ,
			"click" INTEGER ,
			"critic" INTEGER ,
			"articleid" INTEGER ,
			"boardid" INTERGER,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "groups" (
			"id"	INTEGER NOT NULL,			
			"name" TEXT ,
			"username" TEXT NOT NULL,
			"members" INTEGER ,
			"photoname" TEXT,
			"hostid" INTEGER ,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "groupstext" (
			"id"	INTEGER NOT NULL,	
			"name"	TEXT NOT NULL,			
			"username" TEXT ,
			"text" INTEGER ,
			"time" INTEGER  ,
			PRIMARY KEY("id" AUTOINCREMENT));`);
	db.run(`CREATE TABLE if not exists "blowtable" (
			"id"	INTEGER NOT NULL,			
			"blow" INTEGER,
			PRIMARY KEY("id" ));`);
	/*db.run(`insert into blowtable(blow)  values(?)`,[0],(err) =>{
		if(err){
			console.log(err.message);
		}
	})*/
});

module.exports = db;