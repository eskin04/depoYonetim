const dbConn = require('../db/mysqlconnect')

const stoklar_en_az = (req,res)=>{
    dbConn.query("CALL stoklar_en_az()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const stoklar_en_cok = (req,res)=>{
    dbConn.query("CALL stoklar_en_fazla()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

module.exports = {stoklar_en_az,stoklar_en_cok}