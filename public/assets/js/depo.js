fetch('http://localhost:3000/api/depo')
// api kullanılarak depo veri tabanı çağrıldı
.then(response=>response.json())
.then(data=>{
    let html = ''
    data.forEach(depo=>{
        html += `
        <tr>
        <td>${depo.depo_id}</td>
        <td>${depo.depo_adi}</td>
        <td>${depo.depo_adresi}</td>
        <td>${depo.depo_kapasitesi}</td>
        <td><span class="${depo.depo_kapasitesi==10000?'status delivered':'status pending'}">${depo.depo_kapasitesi==10000?'Doluluk Oranı Yüksek':'Stok Yapılabilir'}</span></td>
        
    </tr>
        `
    })
    document.getElementById('depo').innerHTML = html
    // html dosyasında bunu id olarak çağırdık
})

fetch('http://localhost:3000/api/depoda_bulunan_urunler')
.then(response=>response.json())
.then(data=>{
    console.log(data)
    let html = ''
    let html2 = ''
    data.forEach(urun=>{
        if(urun.depo_id==1){
            html += `
            <tr>
            <td>${urun.urun_id}</td>
            <td>${urun.urun_adi}</td>
            <td>${urun.urun_aciklamasi}</td>
            <td>${urun.stok_sayisi} adet</td>
        </tr>
            `
        }
        else{
            html2 += `
            <tr>
            <td>${urun.urun_id}</td>
            <td>${urun.urun_adi}</td>
            <td>${urun.urun_aciklamasi}</td>
            <td>${urun.stok_sayisi} adet</td>
        </tr>
            `
        }

    })
    document.getElementById('istanbuldepo').innerHTML = html
    document.getElementById('izmirdepo').innerHTML = html2
})