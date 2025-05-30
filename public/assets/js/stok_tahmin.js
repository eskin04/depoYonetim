document.addEventListener("DOMContentLoaded", () => {
  const urunArama = document.getElementById("urunArama");
  const sonucListesi = document.getElementById("sonucListesi");
  const tahminBtn = document.getElementById("tahminBtn");
  const resultBox = document.getElementById("resultBox");

  let tumUrunler = [];
  let secilenUrunId = null;

  // Ürünleri çek
  fetch("/api/tum_urunler")
    .then(res => res.json())
    .then(data => {
      tumUrunler = data;
    });
   console.log(tumUrunler);
  // Arama kutusunda yazdıkça filtrele
  urunArama.addEventListener("input", () => {
    const arama = urunArama.value.toLowerCase();
    sonucListesi.innerHTML = "";
    secilenUrunId = null;

    if (!arama) return;

    const filtrelenmis = tumUrunler.filter(urun =>
      urun.urun_adi.toLowerCase().includes(arama)
    );

    filtrelenmis.slice(0, 5).forEach(urun => {
      const li = document.createElement("li");
      li.textContent = urun.urun_adi;
      li.style.padding = "8px";
      li.style.border = "1px solid #ccc";
      li.style.marginBottom = "5px";
      li.style.cursor = "pointer";
      li.style.borderRadius = "6px";
      li.addEventListener("click", () => {
        urunArama.value = urun.urun_adi;
        secilenUrunId = urun.urun_id;
        sonucListesi.innerHTML = "";
      });
      sonucListesi.appendChild(li);
    });
  });

  tahminBtn.addEventListener("click", () => {
    if (!secilenUrunId) {
      resultBox.innerHTML = "Lütfen geçerli bir ürün seçiniz.";
      return;
    }

    resultBox.innerHTML = "Tahmin yapılıyor... ⏳";

    fetch("/api/stok_tahmin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urun_id: secilenUrunId })
    })
      .then(res => res.json())
      .then(data => {
      resultBox.innerHTML = (data.result || "Tahmin alınamadı.").replace(/\n|\\n/g, "<br>");
      })
      .catch(() => {
        resultBox.innerHTML = "Sunucu hatası. Lütfen tekrar deneyin.";
      });
  });
});
