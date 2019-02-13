const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

app.use(bodyParser.json());
app.use(methodOverride('_method'))
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


const mongoURI ='mongodb://jkette01:Gue55wh0@ds127864.mlab.com:27864/mongouploads';
const conn = mongoose.createConnection(mongoURI);

let gfs;

conn.once('open', () => {
    // init stream
     gfs = Grid(conn.db, mongoose.mongo);
     gfs.collection('uploads');
  })
//create storage engin
  const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });




// route loads form
app.get('/',(req, res)=>{
    res.render('index');
});

// route pst/upload
app.post('/upload', upload.single('file'), (req, res)=>{
//   res.json({file: req.file});
    console.log(req.file)
    res.redirect('/');
});

// route get request to / files
app.get('/files', (req, res)=>{
   gfs.files.find().toArray((err, files) => {
     if(!files || files.length === 0){
         return res.status(404).json({
             err: 'no files exist'
         })
     }

     return res.json(files);
   });
});
const port = 5000;

app.listen(port, ()=> console.log(`Server started on port ${port}`));


