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

app.post("/request-to-pay",async(req,res)=>{
    try{
        if(!momoToken){
            return res.status(400).json({error:"Momo token is not available"});
        }
        const {total,phone,currency}=req.body;

        const body={
            amount:total,
            currency:currency,
            externalId:'',
            payer:{
                partyIdType:'MSISDN',
                partyId:'46733123454',
            },
            payerMessage:'Payment for order',
            payeeNote:'Payment for order',

        };


        const momoResponse=await axios.post(
            momoRequestToPayUrl,
            body,
            {
                headers:{
                    'X-Reference-Id': 'c8f060db-5126-47a7-a67b-2fee08c0f30c',
										'X-Target-Environment': 'sandbox',
										'Ocp-Apim-Subscription-Key':'5b158c87ce9b495fb64dcac1852d745b',
										Authorization: `Bearer ${momoToken}`,
										'Content-Type': 'application/json',
                }
            }
        );

        res.status(201).json({momoResponse:momoResponse.data});

    }catch(err){
        console.error(err)
        res.status(500).json({err:"An error occured at payment request route"});

    }
})

app.listen(port,(err)=>{
    if(err) throw new Error("Server is aspleep");
    console.log(`Server is up on port :${port}`)
})