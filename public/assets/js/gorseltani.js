function previewAndAnalyze() {
  const input = document.getElementById("imageInput");
  const image = document.getElementById("analyzedImage");
  const text = document.getElementById("analysisText");
  const section = document.getElementById("analysisSection");

  if (!input.files.length) {
    alert("Lütfen bir görsel seçin.");
    return;
  }

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async function (e) {
    const base64Image = e.target.result.split(',')[1]; // sadece base64 verisi

    // Görseli ekrana getir
    image.src = e.target.result;
    section.style.display = "flex";
    text.innerHTML = "<em>Analiz ediliyor, lütfen bekleyin...</em>";

    try {
      // GPT + stok verisi entegre endpoint'e gönder
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: base64Image })
      });

      const data = await response.json();

      if (data.result) {
        text.innerHTML = data.result;
      } else {
        text.innerHTML = `<strong>Analiz başarısız:</strong> ${data.error || "Bilinmeyen bir hata oluştu."}`;
      }
    } catch (error) {
      console.error("İstek hatası:", error);
      text.innerHTML = "<strong>Sunucuya ulaşılamadı.</strong> Lütfen daha sonra tekrar deneyin.";
    }
  };

  reader.readAsDataURL(file);
}
