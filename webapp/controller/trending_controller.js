//  trending will only consider the donated fundraisers
// also considered the case with No donations => it will not consider it 
const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const { ShareLink } = require('social-media-sharing');
const fundraiserdb = model.Fundraiser;
const category = model.Category;
const User = model.User
donationArray = []; // donationArray to compute all the required fields

router.get('/trending', (req, res) => {
    // current working is sort is based on the number of donations.  

    // ---- Sorting Method 1 ------
    // queey based on number of donations greater than n // here n is 1
    // writing the mongo query
    // var mysort_one = { donations: {$gt: {$size: 3  } }};
    
    // ----- Sorting method 2  ------
   // sorting wrt to amount
    // writing the mongo query
  //  var mysort_two = {amount: -1};
   // sorting wrt to length of document
   
   // -------- Sorting method 3 --------------
   // sorting wrt to number of donations for each fundraiser // considering the scenarios
    // writing the mongodb query. 
   mysort = [
    {
    $unwind :  
    {
            "path": "$donations",
            "preserveNullAndEmptyArrays": false  //This is needed.. to only show the donated 
    } 
    },
    {
    $group : {
            _id: "$_id",
            count: { $sum: 1 },
            "doc":{"$first":"$$ROOT"},
 
    },
    }, 
    {
    $sort : {
        count : -1   // change -1 to 1 , if u want in descending order.
    }
    }];

 // -------- Sorting method 4 --------------
   
   var limitcount = 4;
       
// mysort is the variable based on which we have sorted
fundraiserdb.aggregate(mysort).limit(limitcount)
    .then(function(sample){
       // console.log(sample);
        sample1 = [];
       // console.log(sample);
        category1 = [];
        users = [];
        let total; 
            for(var i =0 ; i < sample.length; i++) {
             //   console.log("------"+sample[i]);
                sample1.push(sample[i].doc);
                //donation._id = sample1[i]._id;
                console.log(sample1);
                category.findById({"_id":sample1[i].categoryId}).then(function(cat){ 
                    category1.push(cat);
                }).catch(err => {
                    console.log(err);
                });   
                User.findById({"_id":sample1[i].createdBy}).then(function(user){
                    users.push(user);
                }).catch(err=> {
                    console.log(err);
                })
        }
       
    }).catch(err => {
        console.log(err);
    });

    // aggregating all the users. 
    fundraiserdb.aggregate([
      // matching wrt to fund_id
      //  { $match: {categoryId: mongoose.Types.ObjectId(req.params.categoryId)}},
     {$unwind: {
        "path": "$donations", 
                  "preserveNullAndEmptyArrays": false  // to consider only the donated 
      },
    },
      {
            $group : {
                _id: "$description",
                        count: { $sum: "$donations.amount" },
                        "doc":{"$first":"$$ROOT"}, /// considering the root
            }
        }
    ]).then(d=> {
        for(var i =0; i < d.length; i++) {
            let total = d[i].count;
            let numberofDaysLeft = getDaysLeft(d[i].doc.targetDate);
                console.log(d[i].count);
               
                 donationObject = {
                    totalDonations : total , // finding the total sum of donations for specific fundraiser
                    fid : d[i].doc._id,  // finding the fundraiser id 
                    numberofDonations : d[i]._id.length, // finding the number of donations
                    daysLeft : numberofDaysLeft // finding the number of days left;
                }
                console.log(donationArray);
            donationArray.push(donationObject);                      
    }
        });
       // console.log(donationArray);
     //  console.log(users);
        res.render('../view/index', {sample1});
});
// change to sharing controller [lines 105 to 123]
router.get('/share/twitter', function(req, res) {
    let socialMediaLinks = new ShareLink("twitter");
    let x =   socialMediaLinks.get({url:"https:www.facebook.com"});    
  //  console.log(x);

   //  res.render('../view/share');
});

router.get('/share/facebook', function(req, res) {
    let socialMediaLinks = new ShareLink("facebook");
    let x =   socialMediaLinks.get({url:"https:www.twitter.com"});    
    console.log(x);
    res.render('../view/share');
});

router.get('/share/', function(req, res) {
    res.render('../view/share');
});

module.exports = router;


function getSum(total, num) {
    total =  (d[i]._id).reduce(getSum) ;
    return total + Math.round(num);
}

// will use future sorting method(will be used later)
function donation() {
    Donation.aggregate([
        {
            $match : {}
        },
        {
            $group : {
                _id : "$fundraiserId", 
                totalDonated : {$sum : "$amount"}
            }
        }
    ]).then();
}

function getDaysLeft(target) {
    let date1 = new Date();
    let date2 = new Date(target);
    let diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
    return diffDays;
}