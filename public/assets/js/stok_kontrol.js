document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("stokTableBody");
  const searchInput = document.getElementById("searchInput");
  const kategoriFilter = document.getElementById("kategoriFilter");
  const depoFilter = document.getElementById("depoFilter");
  const kritikFilter = document.getElementById("kritikFilter");

  let allData = [];

  // 1. Gruplama Fonksiyonu (kategori birleştir)
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

  // 2. Dropdown'ları doldur
  function fillDropdowns(data) {
    const kategoriler = new Set();
    const depolar = new Set();

data.forEach(item => {
    if (item.kategori_adi) {
      item.kategori_adi.split(",").forEach(k => {
        kategoriler.add(k.trim());
      });
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

  // 3. Tabloda filtreleme uygula
  function applyFilters() {
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

  // 4. Tabloyu bastır
  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.urun_adi}</td>
        <td>${item.kategori_adi || "-"}</td>
        <td>${item.depo_adi}</td>
        <td style="color:${item.stok_sayisi < 50 ? 'red' : 'inherit'}">${item.stok_sayisi}</td>
        <td>
          <button class="edit-icon-btn open-modal-btn"
            data-urun="${item.urun_adi}" 
            data-depo="${item.depo_adi}" 
            data-miktar="${item.stok_sayisi}">
            <ion-icon name="create-outline"></ion-icon>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // 5. Veriyi çek
  fetch("/api/urun_stok_detay")
    .then(res => res.json())
    .then(data => {
      allData = groupData(data);
      fillDropdowns(allData);
      renderTable(allData);
    });

  // 6. Filtre olayları
  searchInput.addEventListener("input", applyFilters);
  kategoriFilter.addEventListener("change", applyFilters);
  depoFilter.addEventListener("change", applyFilters);
  kritikFilter.addEventListener("change", applyFilters);
});

// ✏️ Modalı aç
document.addEventListener("click", e => {
  const button = e.target.closest(".open-modal-btn");
  if (button) {
    const urun = button.dataset.urun;
    const depo = button.dataset.depo;
    const miktar = button.dataset.miktar;

    document.getElementById("modalUrun").textContent = `${urun} (${depo})`;
    document.getElementById("modalInput").value = miktar;
    document.getElementById("saveBtn").dataset.urun = urun;
    document.getElementById("saveBtn").dataset.depo = depo;
    document.getElementById("stokModal").style.display = "flex";
  }
});

function closeModal() {
  document.getElementById("stokModal").style.display = "none";
}

// 💾 Stok güncelle
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
    setTimeout(() => location.reload(), 1500); // Güncel verileri çek
  });
});

// ✅ Toast fonksiyonu
function showToast(message = "Stok başarıyla güncellendi") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

document.getElementById("exportBtn").addEventListener("click", () => {
  // Şu anda filtrelenmiş tabloyu al
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