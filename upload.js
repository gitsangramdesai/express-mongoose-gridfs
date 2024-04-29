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
        if ((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
    if (file.fieldname == "resume") {
        if ((file.mimetype).includes('doc')  || (file.mimetype).includes('openxmlformats')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
};

var upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1 * 1024 * 1024 } })

module.exports = {
    upload: upload,
    storage:storage
}

