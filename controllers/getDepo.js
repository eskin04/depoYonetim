const dbConn = require('../db/mysqlconnect')
// mysql ile bağlantıyı sağlar

const getDepo = (req, res) => {
    // mysqli request ile bağlantı sağlayarak depolar yordamını çağırır
    dbConn.query("CALL depolar()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const depo_orani = (req,res)=>{
    let depo_id = req.query.depo_id
    dbConn.query("CALL depo_orani(?)",[depo_id],(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const depo_stok_sayisi = (req,res)=>{
    dbConn.query("CALL depo_stok_sayisi()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const depo_toplam_fiyat = (req,res)=>{
    dbConn.query("CALL depo_toplam_fiyat()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const depoda_bulunan_urunler = (req,res)=>{
    dbConn.query("CALL depoda_bulunan_urunler()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

const toplam_depo= (req,res)=>{
    dbConn.query("CALL toplam_depo()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

module.exports = {getDepo,depo_orani,depo_stok_sayisi,depo_toplam_fiyat,depoda_bulunan_urunler,toplam_depo}
// tüm fonksiyonlerı dışarda kullanmak için export ile çağrılmış