const dotenv = require('dotenv'); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
const express=require("express");
const bodyParser =require("body-parser");
const https= require("https");
const _=require("lodash");
//db
const mongoose = require("mongoose");
const { intersection, reject, includes, isInteger } = require("lodash");
const { resourceUsage } = require("process");
const { application } = require("express");
const { resolve } = require("path");
const { Int32 } = require("mongodb");
mongoose.connect(process.env.MONGOURL,{ useNewUrlParser: true });

// mongoose.connection.useDb('pbl');

 // schems
 const Sscema = new mongoose.Schema({
     _id:String,
     SymptomName:String,
     DiseaseID:[],
     SymptomQ:String
 });

const Symptoms = mongoose.model("symptoms1",Sscema);

const Dschema = new mongoose.Schema({
    _id:Number,
    DiseaseName:String,
    Precautions:[],
    SymptomID:[]
});


const Disease = mongoose.model("disease1",Dschema);


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
.get(async function(req,res){
    res.render("start1");
    try{
        const f = await Disease.find();
        console.log(f);
    }catch(e){
        console.log(e);
    }
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
            try{
            const b = await Symptoms.findOne({_id:mainsymp[i]});
            if(b!==null){
            var items = b.DiseaseID;
            console.log("items ",items);
            items.forEach((result)=>{
                if(!Dlist.includes(result)){
                    Dlist.push(result);
                }
            })
        }
        }
            catch(error){console.log(error)}
        };
        return;
    }

    async function findSymptomQ(){
        await createDlist();
        for(let i=0;i<Dlist.length;i++){
            try{
                let num = 0;
                //console.log(Dlist);
                var pqr = await Disease.findOne({_id:Dlist[i]});
                //console.log(pqr);
                const pq = pqr.SymptomID;
                for(let j=0;j<pq.length;j++){
                    const pqrs = await Symptoms.findOne({_id:pq[j]});
                    tempq.push(pqrs);
                }
            }
            catch(error){console.log(error)}
        }
        const key = '_id';
        //console.log(tempq);

        /*tempq = [...new Map(tempq.map(item =>
        [item[key], item])).values()];*/

        // console.log("-------------------------");
        console.log(tempq);
       

    }

    async function createQuestionPage(){
        await findSymptomQ();
        //console.log(Dlist);
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
        if(tempq[counter] !== null){
        res.render("single-ques-page",{
            question:tempq[counter].SymptomQ
            
        });
    }
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
            // console.log(index);
            // console.log(SchemaList[index].Dname);
            // console.log(SchemaList[index].length);
            // console.log(SchemaList[index].match);
            // console.log(SchemaList[index].Precautions);
            let a = SchemaList[index].match/SchemaList[index].length*100
            res.render("summary",{o:SchemaList[index].Dname,p:a,pr:SchemaList[index].Precautions});
        }

        DisplayDisease();
        

    }
    
});

// server
const PORT = process.env.PORT || 8080;
app.listen(PORT,function()
{
    console.log("server started at 3000");
});












