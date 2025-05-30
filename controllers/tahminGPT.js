require("dotenv").config();
const OpenAI = require("openai");
const db = require("../db/mysqlconnect");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const stokTahmin = (req, res) => {
  const { urun_id } = req.body;

  if (!urun_id) {
    return res.status(400).json({ error: "Ürün ID eksik." });
  }

  // 1. Ürün adı
  const urunSorgu = "SELECT urun_adi FROM urunler WHERE urun_id = ?";
  db.query(urunSorgu, [urun_id], (err, urunSonuc) => {
    if (err || urunSonuc.length === 0) {
      return res.status(500).json({ error: "Ürün bulunamadı." });
    }

    const urunAdi = urunSonuc[0].urun_adi;

    // 2. Stok hareketleri
    const hareketSorgu = `
      SELECT hareket_tipi, miktar, DATE_FORMAT(tarih, '%Y-%m-%d') as tarih
      FROM stok_hareketleri
      WHERE urun_id = ?
      ORDER BY tarih ASC
    `;
    db.query(hareketSorgu, [urun_id], (err, hareketler) => {
      if (err) {
        return res.status(500).json({ error: "Hareketler çekilemedi." });
      }

      // 3. Mevcut stok
      const stokSorgu = "SELECT SUM(stok_sayisi) as toplam FROM stoklar WHERE urun_id = ?";
      db.query(stokSorgu, [urun_id], async (err, stokSonuc) => {
        if (err) {
          return res.status(500).json({ error: "Stok bilgisi alınamadı." });
        }

        const mevcutStok = stokSonuc[0]?.toplam || 0;

        if (hareketler.length === 0) {
          return res.json({ result: "Bu ürün için geçmiş stok hareketi bulunamadı. Tahmin yapılamaz." });
        }

        // GPT metni
        const hareketMetni = hareketler.map(h => `- ${h.tarih}: ${h.hareket_tipi} ${h.miktar}`).join("\n");

        const prompt = `
Aşağıda "${urunAdi}" adlı ürünün geçmiş stok hareketleri tarih sırasına göre verilmiştir.

${hareketMetni}

Bu ürün şu anda depoda toplam ${mevcutStok} adet bulunmaktadır.

Senin görevin:
- Bu hareketlerin ritmine bakarak ürünün ortalama ne kadar sürede ne kadar tükendiğini analiz et.
- Mevcut stok bu hızla giderse yaklaşık ne zaman tükenir?
- Analitik ama sade bir açıklama yap. Gereksiz tekrar ve süsleme olmasın.
`;

        try {
          const gptRes = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "Bir depo stok tahmin sistemisin." },
              { role: "user", content: prompt }
            ],
            max_tokens: 500
          });

          const resultText = gptRes.choices[0].message.content;
          res.json({ result: resultText });
        } catch (error) {
          console.error("GPT hatası:", error?.response?.data || error.message);
          res.status(500).json({ error: "GPT analizinde hata oluştu." });
        }
      });
    });
  });
};

module.exports = { stokTahmin };
