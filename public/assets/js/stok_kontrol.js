let allData = [];

function renderTable(data) {
  const tableBody = document.getElementById("stokTableBody");
  const kritikFilter = document.getElementById("kritikFilter");

  tableBody.innerHTML = "";
  data.forEach(item => {
    const isKritik = item.stok_sayisi < 50;
    const kritikMod = kritikFilter?.checked;

    let buttonHTML = "";

    if (kritikMod && isKritik) {
      // Sadece "Stok Artır" butonu
      buttonHTML = `
        <button class="btn-kritik-guncelle"
          data-urun="${item.urun_adi}" 
          data-depo="${item.depo_adi}" 
          data-mevcut="${item.stok_sayisi}">
          <ion-icon name="arrow-up-outline"></ion-icon>
          <span>Sipariş Ver</span>
        </button>`;
    } else {
      // Sadece "Düzenle" butonu
      buttonHTML = `
        <button class="edit-icon-btn open-modal-btn"
          data-urun="${item.urun_adi}" 
          data-depo="${item.depo_adi}" 
          data-miktar="${item.stok_sayisi}">
          <ion-icon name="create-outline"></ion-icon>
        </button>`;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.urun_adi}</td>
      <td>${item.kategori_adi || "-"}</td>
      <td>${item.depo_adi}</td>
      <td style="color:${isKritik ? 'red' : 'inherit'}">${item.stok_sayisi}</td>
      <td>${buttonHTML}</td>
    `;
    tableBody.appendChild(row);
  });
}


function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const kategoriFilter = document.getElementById("kategoriFilter");
  const depoFilter = document.getElementById("depoFilter");
  const kritikFilter = document.getElementById("kritikFilter");

  const search = searchInput.value.toLowerCase();
  const kategori = kategoriFilter.value;
  const depo = depoFilter.value;
  const kritik = kritikFilter.checked;

  const filtered = allData.filter(item => {
    const matchSearch = item.urun_adi.toLowerCase().includes(search);
    const matchKategori = kategori === "" || item.kategori_adi.includes(kategori);
    const matchDepo = depo === "" || item.depo_adi === depo;
    const matchKritik = !kritik || item.stok_sayisi < 50;
    return matchSearch && matchKategori && matchDepo && matchKritik;
  });

  renderTable(filtered);
}

function showToast(message = "Stok başarıyla güncellendi ✅") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function closeModal() {
  document.getElementById("stokModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const kategoriFilter = document.getElementById("kategoriFilter");
  const depoFilter = document.getElementById("depoFilter");
  const kritikFilter = document.getElementById("kritikFilter");

  function groupData(data) {
    const map = new Map();
    data.forEach(item => {
      const key = `${item.urun_adi}-${item.depo_adi}`;
      if (!map.has(key)) {
        map.set(key, {
          urun_adi: item.urun_adi,
          depo_adi: item.depo_adi,
          stok_sayisi: item.stok_sayisi,
          kategori_adi: new Set()
        });
      }
      map.get(key).kategori_adi.add(item.kategori_adi);
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      kategori_adi: Array.from(item.kategori_adi).join(', ')
    }));
  }

  function fillDropdowns(data) {
    const kategoriler = new Set();
    const depolar = new Set();

    data.forEach(item => {
      if (item.kategori_adi) {
        item.kategori_adi.split(",").forEach(k => kategoriler.add(k.trim()));
      }
      if (item.depo_adi) {
        depolar.add(item.depo_adi);
      }
    });

    kategoriFilter.innerHTML = '<option value="">Kategori (Tümü)</option>' +
      [...kategoriler].map(k => `<option value="${k}">${k}</option>`).join('');
    depoFilter.innerHTML = '<option value="">Depo (Tümü)</option>' +
      [...depolar].map(d => `<option value="${d}">${d}</option>`).join('');
  }

  fetch("/api/urun_stok_detay")
    .then(res => res.json())
    .then(data => {
      allData = groupData(data);
      fillDropdowns(allData);
      renderTable(allData);
    })
    .catch(err => {
      console.error("Veri çekme hatası:", err);
      showToast("Stok verisi yüklenemedi ❌");
    });

  searchInput.addEventListener("input", applyFilters);
  kategoriFilter.addEventListener("change", applyFilters);
  depoFilter.addEventListener("change", applyFilters);
  kritikFilter.addEventListener("change", applyFilters);
});

document.addEventListener("click", (e) => {
  const modalBtn = e.target.closest(".open-modal-btn");
  if (modalBtn) {
    const urun = modalBtn.dataset.urun;
    const depo = modalBtn.dataset.depo;
    const miktar = modalBtn.dataset.miktar;

    document.getElementById("modalUrun").textContent = `${urun} (${depo})`;
    document.getElementById("modalInput").value = miktar;
    const saveBtn = document.getElementById("saveBtn");
    saveBtn.dataset.urun = urun;
    saveBtn.dataset.depo = depo;
    document.getElementById("stokModal").style.display = "flex";
  }

  const kritikBtn = e.target.closest(".btn-kritik-guncelle");
  if (kritikBtn) {
    const urun = kritikBtn.dataset.urun;
    const depo = kritikBtn.dataset.depo;
    const mevcut = Number(kritikBtn.dataset.mevcut);
    const yeniMiktar = 60;

    fetch("/api/stok_guncelle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urun_adi: urun, depo_adi: depo, yeni_miktar: yeniMiktar })
    })
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(() => {
        showToast(`${yeniMiktar - mevcut} adet ${urun} siparişi verildi ✅`);
        const updated = allData.find(item => item.urun_adi === urun && item.depo_adi === depo);
        if (updated) updated.stok_sayisi = yeniMiktar;
        applyFilters();
      })
      .catch(err => {
        console.error("HATA:", err);
        showToast("Stok güncellenemedi ❌");
      });
  }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const yeniMiktar = document.getElementById("modalInput").value;
  const urun = document.getElementById("saveBtn").dataset.urun;
  const depo = document.getElementById("saveBtn").dataset.depo;

  fetch("/api/stok_guncelle", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urun_adi: urun, depo_adi: depo, yeni_miktar: Number(yeniMiktar) })
  })
    .then(res => res.json())
    .then(() => {
      closeModal();
      showToast();
      const updated = allData.find(item => item.urun_adi === urun && item.depo_adi === depo);
      if (updated) updated.stok_sayisi = Number(yeniMiktar);
      applyFilters();
    })
    .catch(err => {
      console.error("Stok güncelleme hatası:", err);
      showToast("Stok güncellenemedi ❌");
    });
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#stokTableBody tr");
  const excelData = [["Ürün Adı", "Kategori", "Depo", "Miktar"]];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    excelData.push([
      cells[0]?.innerText,
      cells[1]?.innerText,
      cells[2]?.innerText,
      cells[3]?.innerText
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stok Listesi");
  XLSX.writeFile(wb, "stok_listesi.xlsx");

  showToast("Excel'e aktarıldı ✅");
});
