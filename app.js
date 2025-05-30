const express = require('express')
const router=require('./routers')
const path=require("path")
const db=require('./db/mysqlconnect')
require('dotenv/config')
const app = express()
// burada gerekli olan kütüphaneleri çağırdık

app.use(express.static(path.join(__dirname,"/public")))

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"/public/giris.html"))
})
// slash yapınca giriş html e gidiyor

app.use(express.json({limit:'50mb',extended:true,parameterLimit:50000}))
app.use('/api',router)
app.listen(process.env.PORT)