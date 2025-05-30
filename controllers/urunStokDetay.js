const db = require('../db/mysqlconnect');

const getUrunStokDetay = (req, res) => {
  const sql = `
SELECT 
  u.urun_adi,
  k.kategori_adi,
  d.depo_adi,
  s.stok_sayisi
FROM stoklar s
JOIN urunler u ON s.urun_id = u.urun_id
JOIN depolar d ON s.depo_id = d.depo_id
LEFT JOIN kategori_urun ku ON ku.urun_id = u.urun_id
LEFT JOIN kategoriler k ON k.kategori_id = ku.kategori_id
ORDER BY u.urun_adi;

  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("SQL Hatası:", err);
      return res.status(500).json({ error: "Veri alınamadı." });
    }

    res.json(rows);
  });
};

module.exports = { getUrunStokDetay };
