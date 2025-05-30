const dbConn = require('../db/mysqlconnect')

const getKategori = (req, res) => {
    dbConn.query("CALL kategori_dagilim()",(err,rows)=>{
        if(!err){
            res.json(rows[0])
        }else{
            console.log(err)
        }
    })
}

module.exports = {getKategori}