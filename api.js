const express=require("express")
const app=express()
const cors=require("cors")
const BodyParser=require("body-parser")
const port=3000
const axios=require("axios")

app.use(cors())
app.use(BodyParser.json());

app.get("/api",(req,res)=>{
    res.send("Momo api")
})

const momoHost='sandbox.momodeveloper.mtn.com';
const momoTokenUrl=`https://${momoHost}/collections/token`;
const momoRequestToPayUrl=`hrrps://${momoHost}.collections/v1_0/requesttopay`;

let momoToken=null;

// function to generate token
app.post('/get-momo-token',async(req,res)=>{
    try{
        const {apiKey,subscriptionKey}=req.body;
        console.log(apiKey,subscriptionKey);

        const momoTokenResponse=await axios.post(
            momoTokenUrl,{},
            {
                headers:{
                    'Content-Type':'application/json',
                    'Ocp-Apim-Subscription-Key':subscriptionKey,
                    Authorization:`Basic ${apiKey}`,
                },
            }
        );
        console.log(momoTokenResponse.data);
        momoToken=momoTokenResponse.data.access_token;
        res.json({momoToken})

    }catch(err){
        console.log(err);
        res.status(500).json({err:'Error occured in token generation'})

    }
})

app.listen(port,(err)=>{
    if(err) throw new Error("Server is aspleep");
    console.log(`Server is up on port :${port}`)
})