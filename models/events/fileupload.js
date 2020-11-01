var express = require('express'); //imports express js
app = express();

const fileupload = require('express-fileupload');
app.use(fileupload());

module.exports = app.post('/upload',(req,res)=>{
    if(req.files){
        var file = req.files.file;
        file.mv('./uploads/'+file.name,function(err,result){
            if(err){
                res.json({
                    status:400,
                    success:false,
                    message:err
                });
            }
            else{
                res.json("FILE UPLOADED SUCCESSFULLY!!!");
            }
        })
    }
});