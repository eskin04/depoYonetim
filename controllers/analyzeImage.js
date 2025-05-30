require("dotenv").config();
const OpenAI = require("openai");
const axios = require("axios");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeImage = async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Görsel verisi eksik." });
  }

  try {
    // 1. Ürün-depo-stok verilerini al
    const stockRes = await axios.get(`http://localhost:${process.env.PORT}/api/urun_stok_detay`);
    const stockData = stockRes.data;

    // 2. GPT için uygun formatta metne çevir
    const stockText = stockData
      .map(item => `• ${item.urun_adi} (${item.kategori_adi}) - Depo: ${item.depo_adi}, Stok: ${item.stok_sayisi}`)
      .join("\n");

    // 3. GPT'ye bilgi + görsel gönder
    const gptRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
               `Aşağıda sistemde kayıtlı ürünlerin adı, ait oldukları kategoriler ve hangi depoda kaç adet bulundukları bilgisi yer almaktadır.\n\n${stockText}\n\n` +
    `Kullanıcı bir ürün görseli yüklüyor. Görevin:\n` +
    `1. Görseldeki ürünün hangi ürün olduğunu belirlemek.\n` +
    `2. Eşleşen ürün sistemde varsa, ürün adını, kategorisini ve bulunduğu depolardaki stok bilgisini kısa ve açık cümlelerle kullanıcıya sunmak. Eğer sistemde o ürün varsa bu bilgilerin hiçbirini atlamadan ver. Eğer ki ürünün birden fazla kategorisi varsa bütün kategorilerini de yazdır.\n` +
    `3. Bilgileri mümkünse madde madde yerine bir akış cümlesi olarak ver\n` +
    `4. Aynı bilginin tekrarını yapma. Gereksiz detaylardan kaçın.\n`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Görseldeki ürün bu listedekilerden biri mi? Varsa detaylı açıkla." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const resultText = gptRes.choices[0].message.content;
    res.json({ result: resultText });
  } catch (error) {
    console.error("GPT veya veri hatası:", error?.response?.data || error.message);
    res.status(500).json({ error: "Analiz sırasında hata oluştu." });
  }
};

module.exports = { analyzeImage };
