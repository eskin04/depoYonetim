fetch('http://localhost:3000/api/toplam_depo')
.then(res=>res.json())
.then(data=>{
    console.log(data)
    document.getElementById("deposayi").innerHTML=data[0].toplam
})

function depo_oran(depo_id){
    fetch('http://localhost:3000/api/depo_orani?depo_id='+depo_id)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        document.getElementById("depo"+depo_id).innerHTML=data[0].depo_orani+"%"

    })
}
depo_oran(1)
depo_oran(2)

fetch('http://localhost:3000/api/depo_toplam_fiyat')
.then(res=>res.json())
.then(data=>{
    console.log(data)
    let toplam_fiyat=data[0].toplam
    // toplam_fiyatı her 3 basamakta bir virgül koyarak yazdırma
    toplam_fiyat=toplam_fiyat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    document.getElementById("deger").innerHTML="₺"+toplam_fiyat
})


fetch('http://localhost:3000/api/depo_stok_sayisi?')
.then(res=>res.json())
.then(data=>{
    console.log(data)
    istdepodoluluk=data[0].sayi
    izmdepodoluluk=data[1].sayi
    google.charts.setOnLoadCallback(depodolulukorani);
})

fetch('http://localhost:3000/api/kategori')
.then(res=>res.json())
.then(data=>{
    console.log(data)
    for(let i=0;i<data.length;i++){
        kategoriListe.push([data[i].kategori_adi,data[i].sayi])
    }
    google.charts.setOnLoadCallback(kategoriDagilim);
})

google.charts.load('current', {'packages':['corechart']});

let kategoriListe=[['Kategori Adı','Ürün Sayısı']]

function kategoriDagilim() {

var data = google.visualization.arrayToDataTable(
    kategoriListe
);

var options = {
    title: 'Ürünlerin Kategorilere Göre Dağılımı',
    legend: { position: 'bottom' },
    width: 728,
    height: 500,
    titleTextStyle: {
        fontSize: 20,
        bold: true,
        position: 'center',
    },
};

var chart = new google.visualization.PieChart(document.getElementById('piechart'));

chart.draw(data, options);
}

let istdepodoluluk=0
let izmdepodoluluk=0

function depodolulukorani() {
var data = google.visualization.arrayToDataTable([
    ["Element", "Density", { role: "style" } ],
    ["İstanbul Deposu \n max 10,000", istdepodoluluk, "#b87333"],
    ["İzmir Deposu \n max 7,500", izmdepodoluluk, "silver"],
    ["", 0, "silver"],




]);

var view = new google.visualization.DataView(data);
view.setColumns([0, 1,
                    { calc: "stringify",
                    sourceColumn: 1,
                    type: "string",
                    role: "annotation" },
                    2]);

var options = {
    title: "Depo Doluluk Durumu",
    width: 600,
    height: 400,
    bar: {groupWidth: "95%"},
    legend: { position: "none" },
};
var chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
chart.draw(view, options);
}

fetch('http://localhost:3000/api/urun_depo_dagilim')
.then(res=>res.json())
.then(data=>{
    console.log(data)
    let tesisatnum=0
    let insaatnum=2
    let ahsapnum=1
    let deponum=0

    for(let i=0;i<2;i++){
        urunListe.push([data[deponum].depo_adi,data[tesisatnum].sayi,data[ahsapnum].sayi,data[insaatnum].sayi])
        tesisatnum+=3
        ahsapnum+=3
        insaatnum+=3
        deponum+=3
    }
    google.charts.setOnLoadCallback(urundagilim);
})

google.charts.load('current', {'packages':['bar']});

let urunListe=[['Depo','Tesisat','Ahşap','İnşaat']]

function urundagilim() {
    var data = google.visualization.arrayToDataTable(
        urunListe
    );

    var options = {
    chart: {
        title: 'Ürünlerin Depolara Göre Dağılımı',
        subtitle: 'Tesisat, İnşaat ve Ahşap Ürünlerin Depolara Göre Dağılımı',
    },
    bars: 'horizontal' // Required for Material Bar Charts.
    };

    var chart = new google.charts.Bar(document.getElementById('barchart_material'));

    chart.draw(data, google.charts.Bar.convertOptions(options));
}

fetch('http://localhost:3000/api/stoklar_en_az')
.then(res=>res.json())
.then(data=>{
    console.log(data[0].urun_adi)
    let html = ''
    for(let i=0;i<data.length;i++){
        html += `
        <tr>
            <td>
                <h3>${data[i].urun_adi} <span>${data[i].kategori_adi}</span> <span style="font-size: 20px; color: #DC3912; position:absolute; right:10px;">${data[i].stok_sayisi} <span>adet</span></span> </h3>
            </td>
        </tr>
        `
    }
    document.getElementById("stokaz").innerHTML=html
})

fetch('http://localhost:3000/api/stoklar_en_cok')
.then(res=>res.json())
.then(data=>{
    console.log(data[0].urun_adi)
    let html = ''
    for(let i=0;i<data.length;i++){
        html += `
        <tr>
            <td>
                <h3>${data[i].urun_adi} <span>${data[i].kategori_adi}</span> <span style="font-size: 20px; color: #2A2185; position:absolute; right:10px;">${data[i].stok_sayisi} <span>adet</span></span> </h3>
            </td>
        </tr>
        `
    }
    document.getElementById("stokcok").innerHTML=html
})

fetch('http://localhost:3000/api/toplam_urun')
.then(res=>res.json())
.then(data=>{
    console.log(data)
    document.getElementById("urunsayi").innerHTML=data[0].toplam
})