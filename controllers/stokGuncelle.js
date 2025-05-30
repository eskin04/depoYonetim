const db = require('../db/mysqlconnect');

const stokGuncelle = (req, res) => {
  const { urun_adi, depo_adi, yeni_miktar } = req.body;

  if (!urun_adi || !depo_adi || yeni_miktar == null) {
    return res.status(400).json({ error: "Eksik veri gönderildi." });
  }

  const getIDsSql = `
    SELECT 
      u.urun_id, d.depo_id, s.stok_sayisi 
    FROM urunler u
    JOIN stoklar s ON s.urun_id = u.urun_id
    JOIN depolar d ON s.depo_id = d.depo_id
    WHERE u.urun_adi = ? AND d.depo_adi = ?
    LIMIT 1
  `;

  db.query(getIDsSql, [urun_adi, depo_adi], (err, results) => {
    if (err || results.length === 0) {
      console.error("Stok çekme hatası:", err);
      return res.status(500).json({ error: "Ürün veya depo bulunamadı." });
    }

    const { urun_id, depo_id, stok_sayisi } = results[0];
    const fark = yeni_miktar - stok_sayisi;

    const hareket_tipi = fark > 0 ? 'giriş' : 'çıkış';
    const miktar = Math.abs(fark);

    const updateStokSql = `UPDATE stoklar SET stok_sayisi = ? WHERE urun_id = ? AND depo_id = ?`;

    db.query(updateStokSql, [yeni_miktar, urun_id, depo_id], (err) => {
      if (err) {
        console.error("Stok güncelleme hatası:", err);
        return res.status(500).json({ error: "Stok güncellenemedi." });
      }

      // Stok hareketini ekle
      const hareketSql = `
        INSERT INTO stok_hareketleri (urun_id, depo_id, hareket_tipi, miktar)
        VALUES (?, ?, ?, ?)
      `;

      db.query(hareketSql, [urun_id, depo_id, hareket_tipi, miktar], (err) => {
        if (err) {
          console.error("Hareket kaydı hatası:", err);
          return res.status(500).json({ error: "Hareket kaydı eklenemedi." });
        }

        res.json({ success: true, message: "Stok ve hareket başarıyla güncellendi." });
      });
    });
  });
};

module.exports = { stokGuncelle };
