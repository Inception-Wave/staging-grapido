var jwt = require('jsonwebtoken');
var secret = require('../../secret');

function mySort(a, b) {
    var dateA = new Date(a.Sdate).getTime();
    var dateB = new Date(b.Sdate).getTime();
    return dateA < dateB ? 1 : -1;
};

module.exports = function (req, res) {
    var dbo = req.app.locals.db;
    var client_data = req.body.data;
    var decodedData = Buffer.from(client_data, 'base64').toString('ascii');
    var request = JSON.parse(decodedData);
    var userid = request.userid;
    var token = request.token;
    var date = request.Date;
    jwt.verify(token, secret.secret, (err, decoded) => {
        if (err) {
            res.json({
                status: 400,
                success: "Token Expired. Please try again"
            });
            console.log("decdcooamo", decoded);
        } else {


            console.log("user id", userid, date);
            dbo.collection("eventDetails").aggregate(
                [{
                    $match: {

                        'approved': 1

                    }
                },
                {
                    $unwind: '$liked'
                },
                {
                    $unwind: '$going'
                },
                {
                    $project: {
                        "_id": 1,
                        "Ename": 1,
                        "userid": 1,
                        "Location": 1,
                        "Sdate": 1,
                        "Efee": 1,
                        "Etype": 1,
                        "Stime": 1,
                        "Edate": 1,
                        "Details": 1,
                        "Duration": 1,
                        "rdate": 1,
                        "rfdate": 1,
                        "Purl": 1,
                        "no_of_likes": 1,
                        "no_of_going": 1,
                        "accept": {
                            $cond: {
                                if: {
                                    "$eq": ["$going", userid]
                                },
                                then: true,
                                else: false
                            }
                        },
                        "like": {
                            $cond: {
                                if: {
                                    "$eq": ["$liked", userid]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        "Ename": {
                            $first: '$Ename'
                        },
                        "userid": {
                            $first: '$userid'
                        },
                        "Location": {
                            $first: '$Location'
                        },
                        "Sdate": {
                            $first: '$Sdate'
                        },
                        "Details": {
                            $first: '$Details'
                        },
                        "Efee": {
                            $first: '$Efee'
                        },
                        "Etype": {
                            $first: '$Etype'
                        },
                        "Stime": {
                            $first: '$Stime'
                        },
                        "Edate": {
                            $first: '$Edate'
                        },
                        "Duration": {
                            $first: '$Duration'
                        },
                        "rdate": {
                            $first: '$rdate'
                        },
                        "rfdate": {
                            $first: '$rfdate'
                        },
                        "Purl": {
                            $first: '$Purl'
                        },
                        "no_of_likes": { $first: '$no_of_likes' },
                        "no_of_going": { $first: '$no_of_going' },
                        "like": {
                            $max: '$like'
                        },
                        "accept": {
                            $max: '$accept'
                        }
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "Ename": 1,
                        "userid": 1,
                        "Location": 1,
                        "Sdate": 1,
                        "Efee": 1,
                        "Etype": 1,
                        "Stime": 1,
                        "Edate": 1,
                        "Details": 1,
                        "Duration": 1,
                        "rdate": 1,
                        "rfdate": 1,
                        "Purl": 1,
                        "no_of_likes": 1,
                        "no_of_going": 1,
                        "like": "$like",
                        "accept": "$accept"
                    }
                }
                ]).toArray((err, results) => {
                    if (err) throw err;
                    else {
                        var arr = [];
                        arr = results;
                        arr.sort(mySort);
                        res.json(arr);
                    }
                })
        }
    })
}