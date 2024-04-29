We know that it is possible to upload a file into DMBS like Mysql or MSSQL.
Today we will explore how to upload file to mongodb.

First create a express application as follows

express --view=ejs express-mongoose-gridfs

run 
  npm i 

to install packageds.

Now we need

crypto,mongodb,mongoose,multer-gridfs-storage install them one by one.

Here is my package.json

{
  "name": "express-mongoose-gridfs",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www"
  },
  "dependencies": {
    "cookie-parser": "~1.4.4",
    "crypto": "^1.0.1",
    "debug": "~2.6.9",
    "ejs": "~2.6.1",
    "express": "~4.16.1",
    "http-errors": "~1.6.3",
    "mongodb": "^5.9.1",
    "mongoose": "^8.3.2",
    "morgan": "~1.9.1",
    "multer-gridfs-storage": "^5.0.2"
  }
}

Note that  "mongodb": "^5.9.1", is essential for higher version code failed.

create connection.js at root of project with following content

let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const GridFsStorage = require("multer-gridfs-storage");

const mongoURI =
  "mongodb://sangram:sangram%2381@127.0.0.1:27017
/phenixDb?directConnection=true&serverSelectionTimeoutMS=2000
&authSource=admin&appName=mongosh+2.2.3";

const conn = mongoose.createConnection(mongoURI, { maxPoolSize: 10 });

//initialize gridfs
let bucket = new mongoose.mongo.GridFSBucket(conn, {
  bucketName: "uploads",
});

module.exports = {
  mongoose: mongoose,
  connection: conn,
  Schema: Schema,
  mongoURI: mongoURI,
  bucket: bucket,
};


create upload.js in root of project with following content.

const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
const crypto = require("crypto");
const {mongoURI} = require("./connection")
const path = require("path");

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname == "profilePic") {
        if ((file.mimetype).includes('jpeg') 
       || (file.mimetype).includes('png') 
       || (file.mimetype).includes('jpg')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
    if (file.fieldname == "resume") {
        if ((file.mimetype).includes('doc')  
        || (file.mimetype).includes('openxmlformats')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
};

var upload = multer({ storage: storage, fileFilter: fileFilter, 
    limits: { fileSize: 1 * 1024 * 1024 } })

module.exports = {
    upload: upload,
    storage:storage
}

create foodItem.js in models folder at root of project with following
content

const {mongoose,Schema,connection} = require("../connection")

let foodItemSchema = new Schema({
  name: String,
  price: Number,
  description: String,
  picture : String,
  createdOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

//last one is actual collection name in db and its essential
let FoodItem = connection.model("FoodItem", foodItemSchema, "foodItem");

module.exports = {
  FoodItem: FoodItem,
  FoodItemSchema: foodItemSchema,
};


create demo.js in route folder with following content.

let express = require("express");
let router = express.Router();
let FoodItem = require("../models/foodItem").FoodItem;
let FoodItemSchema = require("../models/foodItem").FoodItemSchema;
let mongoose = require("mongoose");
let {upload} = require("../upload");
const path = require('path')
const fs = require('fs')
let {bucket} = require("../connection")

/* insert a new food item */
router.post("/insert",upload.single('resume'), async function (req, res, next) {
    let foodItemName = req.body.name;
    let foodItemDesc = req.body.description;
    let foodItemPrice = req.body.price;

    console.log("Files",)

    try {
      let foodItem = await FoodItem.create({
        name: foodItemName,
        description: foodItemDesc,
        price: foodItemPrice,
        picture:req.file.filename
      });
   
      res.json({
        message: "food item added successfully",
        error: "",
        data: foodItem,
        success: true,
      });
    } catch (err) {
      res.json({
        message: "unable to save food items",
        error: err.message.toString(),
        data: [],
        success: false,
      });
    }
});



router.get("/image/:filename", (req, res) => {
  bucket.openDownloadStreamByName(req.params.filename).
  pipe(res);
});


module.exports = router;


inside app.js

add 
var demoRouter = require('./routes/demo');

and
app.use('/demo', demoRouter);

at suitable place

You can start your application using

npm start

Now you can test your application using postman

Testing Insert API:

curl --location 'http://localhost:3000/demo/insert' \
--form 'name=" Anda Burji\""' \
--form 'description=" made up of smashed eggs"' \
--form 'price=" 40"' \
--form 'resume=@"/home/sangram/Downloads/Cv-Sangram.docx"'

Output:
{
    "message": "food item added successfully",
    "error": "",
    "data": {
        "name": " Anda Burji\"",
        "price": 40,
        "description": " made up of smashed eggs",
        "picture": "2dc4d730d659e9cd14d6c0506ada7ef9.docx",
        "isDeleted": false,
        "_id": "662f6c080fd2bdd1e18990bf",
        "createdOn": "2024-04-29T09:44:40.222Z",
        "__v": 0
    },
    "success": true
}

Please note picture value though its not image but file.

Testing Download API:
here we are using value of picture noted above,this should download the file

curl --location 
'http://localhost:3000/demo/image/2dc4d730d659e9cd14d6c0506ada7ef9.docx'


Code of this application is available at 
https://github.com/gitsangramdesai/express-mongoose-gridfs.