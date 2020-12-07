
var jwt = require('jsonwebtoken');
var secret = require('../../secret');
var NodeCache = require( "node-cache" );
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

    var myCache2 = new NodeCache({
        stdTTL: 0,
        checkperiod: 300
    });
    app.locals.myCache2 = myCache2;

    //var allfeeds = [];
    var allfeeds = myCache2.get("allfeeds"); //get allfeeds from node-cache
    var lastupdatedDB = myCache2.get("lastupdatedDB"); //HERE get the time of last post or last time the DB was updated from node-cache

    var presentTime = Date.now();
    var lastVisited = myCache2.get("lastVisited"); //get the lastVisited time
    if ( lastVisited == undefined ){
        lastVisited = presentTime;
    }
    myCache2.del( "lastVisited" );
    myCache2.set( "lastVisited", presentTime,0);

    var token = request.token;
    jwt.verify(token, secret.secret, (err, decoded) => {
        if (err) {
            res.json({
                status: 400,
                success: "Token Expired. Please try again"
            });
            console.log("decdcooamo", decoded);
        }
        //if there is no update in db compared to last visit,lastupdatedDB!=undefined and allfeeds!=undefined
        //give feeds from the cache
        else if(lastupdatedDB!=undefined && lastupdatedDB < lastVisited && allfeeds!=undefined){ 
            allfeeds.sort(mySort);
            res.json(allfeeds);
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

                                myCache2.del("lastupdatedDB");
                                var lastdbupdatetime =  arr[0][8]; //get the time of last post
                                myCache2.set( "lastupdatedDB", lastdbupdatetime);

                                myCache2.del( "allfeeds" );
                                myCache2.set( "allfeeds", arr);
                                
                                res.json(arr);
                            }
                        })
                    }
                    })                 
}
