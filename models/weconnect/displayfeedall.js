
var jwt = require('jsonwebtoken');
var secret = require('../../secret');
function mySort(a, b) {  
    var dateA = new Date(a.date).getTime(); 
    var dateB = new Date(b.date).getTime(); 
    return dateA < dateB ? 1 : -1;  
};  
module.exports = function (req, res) {
    var dbo=req.app.locals.db;
    var client_data = req.body.data;
    var decodedData = Buffer.from(client_data, 'base64').toString('ascii');
    var request = JSON.parse(decodedData);
    var userid = request.userid;

    var token = request.token;
    jwt.verify(token, secret.secret, (err, decoded) => {
        if (err) {
            res.json({
                status: 400,
                success: "Token Expired. Please try again"
            });
            console.log("decdcooamo", decoded);
        }
        else {
                    dbo.collection("newsfeed").aggregate(
                        [
                            {$unwind: '$liked'},   
                            {
                            $project:{ 
                                "_id":1,
                                "feedid":1,  
                                "userid":1,
                                "feed":1,
                                "url":1,
                                "category":1,
                                "comments":1,
                                "Locations":1,
                                "date":1,
                                "profile_pic":1,
                                "username":1,
                                "no_of_likes":1,
                           "like":{ $cond:{
                                 if:{"$eq": [ "$liked", userid ] },
                                // if:{"liked":userid},
                                then:true,
                                else:false
                            }
                        }
                    
                    }},
                    {$group: {
                        _id: '$_id',
                        "feedid": {$first: '$feedid'},
                        "userid": {$first: '$userid'},
                        "feed":{$first: '$feed'},
                        "url":{$first:'$url'},
                        "category":{$first:'$category'},
                        "comments":{$first:'$comments'},
                        "Locations":{$first:'$Locations'},
                        "date":{$first:'$date'},
                        "profile_pic":{$first:'$profile_pic'},
                        "no_of_likes":{$first:'$no_of_likes'},
                        "username":{$first:'$username'},
                        "like": {$max: '$like'}
                    }},
                   { $project:{ 
                        "_id":1,
                        "feedid":1,  
                        "userid":1,
                        "feed":1,
                        "url":1,
                        "category":1,
                        "comments":1,
                        "Locations":1,
                        "date":1,
                        "profile_pic":1,
                        "no_of_likes":1,
                        "username":1,
                   "like":"$like"}
            }
            
                ]
             ).toArray((err, results) =>{
                        if (err) {
                            res.json({
                                status: 400,
                                success: false
                            })
                            console.log(err);
    
                        }
                        else {
                            var arr=[];
                            arr = results;
                           
                               arr.sort(mySort);
                                res.json(arr);
                            }
                        })
                    }
                    })                 
}
