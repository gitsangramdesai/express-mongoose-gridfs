let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const GridFsStorage = require("multer-gridfs-storage");

const mongoURI =
  "mongodb://sangram:sangram%2381@127.0.0.1:27017/phenixDb?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin&appName=mongosh+2.2.3";

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
