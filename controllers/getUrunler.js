const dbConn = require('../db/mysqlconnect')

const getUrunler = (req, res) => {
    dbConn.query("CALL urunler(?)",[req.query.name],(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const toplam_urun = (req,res)=>{
    dbConn.query("CALL toplam_urun()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const urun_depo_dagilim = (req,res)=>{
    dbConn.query("CALL urun_depo_dagilimi_g3()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const tum_urunler = (req, res) => {
    dbConn.query("CALL tum_urunler()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

module.exports = {getUrunler,toplam_urun,urun_depo_dagilim, tum_urunler}