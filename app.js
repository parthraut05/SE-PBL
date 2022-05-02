const express=require("express");
const bodyParser =require("body-parser");
const https= require("https");
const _=require("lodash");
//db
const mongoose = require("mongoose");
const { intersection, reject, includes } = require("lodash");
const { resourceUsage } = require("process");
const { application } = require("express");
const { resolve } = require("path");
mongoose.connect("mongodb://localhost:27017/pbl1");
 // schems
 const Sscema = mongoose.Schema({
     _id:String,
     SymptomName:String,
     DiseaseID:[],
     SymptomQ:String
 });

const Symptoms = mongoose.model("Symptoms1",Sscema);

const Dschema = mongoose.Schema({
    _id:String,
    DiseaseName:String,
    Precautions:[],
    SymptomID:[]
});


const Disease = mongoose.model("Disease1",Dschema);


//imp
const app= express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');


// req decleration
const schema ={
    Disease:String,
    length:Number,
    matched:Number
}
var mainsymp=[];
let Dlist=[];
var tempq = [];
var counter=0;
var finalSymptoms = [];
var SchemaList = [];

// get request

app.route("/")
.get(function(req,res){
    res.render("start1");
})
.post(function(req,res){
    res.render("form1");
})
app.route("/forms-p-2")
    .get((req,res)=>{
        res.render("forms-p-2");
    })


app.route("/start")
.post(function(req,res){
    res.render("start");
})

app.route("/questionPage")
.post(function(req,res){
    
    var list = req.body.list;
    mainsymp=list.split(',');
    console.log(mainsymp);
    



    async function createDlist(){
        for(let i=0;i<mainsymp.length;i++)
        {
            try{const b = await Symptoms.findOne({_id:mainsymp[i]});
            if(b.DiseaseID!==null) var items = b.DiseaseID;
            items.forEach((result)=>{
                if(!Dlist.includes(result)) Dlist.push(result);
            })}
            catch(error){console.log(error)}
        };
        return;
    }

    async function findSymptomQ(){
        await createDlist();
        for(let i=0;i<Dlist.length;i++){
            try{
                let num = 0;
                var pqr = await Disease.findOne({_id:Dlist[i]});
                const pq = pqr.SymptomID;
                for(let j=0;j<pq.length;j++){
                    const pqrs = await Symptoms.findOne({_id:pq[j]});
                    tempq.push(pqrs);
                }
            }
            catch(error){console.log(error)}
        }
        const key = '_id';

        tempq = [...new Map(tempq.map(item =>
        [item[key], item])).values()];

        console.log("-------------------------");
        //console.log(tempq);
       

    }

    async function createQuestionPage(){
        await findSymptomQ();
        console.log(Dlist);
        //console.log(tempq.SymptomQ);
        res.render("single-ques-page",{question:tempq[counter].SymptomQ});
        counter++;
    }

    createQuestionPage();
    
})

app.route("/nextQuestion")
.post((req,res)=>{
    let yesno = req.body.sub;
    if(yesno==="1"){
        finalSymptoms.push(tempq[counter-1]._id);
        console.log(finalSymptoms);
    }
    if(counter<tempq.length) {
        
        res.render("single-ques-page",{
            question:tempq[counter].SymptomQ
            
        });
        counter++;
    }
    else{

        async function prepareSchema(){
            for(let i=0;i<Dlist.length;i++){
                var num=0;
                var schema={
                    Dname:"",
                    length:0,
                    match:0,
                    Precautions:[]
                }
                
                const found = await Disease.findOne({_id:Dlist[i]})
                {
                    var list=found.SymptomID;
                    schema.Dname=found.DiseaseName;
                    schema.length=list.length;
                    schema.Precautions=found.Precautions;
                    for(let j=0;j<list.length;j++){
                        if(finalSymptoms.includes(list[j]))
                        {
                            num++;
                        }
                    };
                    schema.match = num;
                    SchemaList.push(schema);
                    
                    num = 0;
                };
            };
        }
        
        
        //console.log(SchemaList);
        var index;

        async function PredictDisease(){
            await prepareSchema();
            console.log(SchemaList);
            var prediction = 0;
            for(let p=0;p<SchemaList.length;p++){
                var percentMatched = SchemaList[p].match/SchemaList[p].length;
                if(percentMatched>prediction){
                    prediction = percentMatched;
                    index = p;
                }
            }
        }

        async function DisplayDisease(){
            await PredictDisease();
            console.log(index);
            console.log(SchemaList[index].Dname);
            console.log(SchemaList[index].length);
            console.log(SchemaList[index].match);
            console.log(SchemaList[index].Precautions);
            res.send(SchemaList);
        }

        DisplayDisease();
        

    }
    
})




// SchemaList=[];
// MSList=[];
// Dlist.forEach(function(i){
//   var counter=0;
//   var schema={
//     Dname:"",
//     length:0,
//     match:0,
//     Precautions:[]
//   }
  
//   Disease.findOne({_id:i},(err,found)=>
// {
//     var list=found.SymptomID;
//     schema.Dname=found.DiseaseName;
//     schema.length=list.length;
//     schema.Precautions=found.Precautions;
//     list.forEach((j)=>{
//       if(MSList.includes(j))
//       {
//         couter++;
//       }
//     });
//     SchemaList.push(schema);
// });
// });













// app.get("/",function(req,res)
// {
//     res.render("start1");//start1
//     app.post("/start1",function(req,res)
//     {
//         res.render("form1");
//     });
//     app.post("/form1",function(req,res)
//     {
//         res.render("start");
//     });
//     app.post("/",function(req1,res1){
//         var list = req.body.list;
//         //setTimeout(myFunction, 500);
//         // console.log(typeof list);
//         mainsymp=list.split(',');
//         console.log(mainsymp);
//         mainsymp.forEach(function(symp)
//         {
//             Symptoms.findOne({_id:symp},function(err,found){
//                 if(err)
//                 {
//                     console.log(err);
//                 }
//                 else
//                 {
//                     var item= found.DiseaseID;
//                     //  console.log(item);
//                     item.forEach(function(i){
//                         if(!Dlist.includes(i))
//                         {
//                              Dlist.push(i);
//                              //console.log(Dlist);
//                         }
//                     });
//                 }
//             });
//         });
        
//         // function myFunction()
//         // {

//             console.log(Dlist);
//             Dlist.forEach(function(i){
//                 let counter=0;
//                 Disease.findOne({_id:i},async function(err,fou){
//                     if(err)
//                     {
//                         console.log(err);
//                     }
//                     else
//                     {
//                         fou.SymptomID.forEach(function(i){
//                             Symptoms.findOne({_id:i},function(err,found){
//                                 if(err)
//                                 {
//                                     console.log(err);
//                                 }
//                                 else
//                                 {
//                                     //console.log(found.SymptomQ);
//                                     tempq.push(found.SymptomQ);
//                                     //console.log(tempq);
//                                 }
//                             })
//                         });
//                         //().then(console.log(tempq);
                        
//                     }
//                 });
                
//             });
//            // console.log("LLLL");
            
//            setTimeout(()=>{
//                var num =0;
//                res1.render("single-ques-page",{question:tempq[0]});
//                app.post("/yes",function(req2,res2)
//                             {
//                                 num++;
//                                 var temp=req2.body.sub;
//                                 if(temp==1)
//                                 {
//                                     counter++;
//                                 }
//                                 if(num<tempq.length)
//                                 {
//                                     res2.render("single-ques-page",{
//                                         quest:tempq[num]
//                                     });
//                                 }
//                             });
//            },500);

//         //}
       
//     });
    
//     // app.post("/yes",function(req,res){
//     //     var foundDisease;
//     //     counter++;
//     //     Disease.findOne({id:tempq[counter].DiseaseID},function(err,found){
//     //         if(!err) foundDisease = found;
//     //     })
//     //     // const first = {
//     //     //     Disease: foundDisease.DiseaseName,
//     //     //     length: foundDisease.SymptomID.length,
//     //     //     matched:
//     //     // }
//     //     setTimeout(()=>{console.log(found),500});
//     // })
    
// });


// server
app.listen(3000,function()
{
    console.log("server started at 3000");
});












