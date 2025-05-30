function getUrunler(name){
    fetch('http://localhost:3000/api/urunler?name='+name)
    .then(response=>response.json())
    .then(data=>{
        console.log(data)
        let html = ''
        if(data.length == 0){
            html = `
            
            <h3 style="position:absolute; right:350px; top:150px;">Aradığınız ürün bulunamadı.</h3>
            
            `}
        data.forEach(urun=>{
            html += `
            <tr>
            <td>${urun.urun_id}</td>
            <td>${urun.urun_adi}</td>
            <td>${urun.urun_aciklamasi}</td>
            <td>₺${urun.urun_birim_fiyati}</td>
        </tr>
            `
        })
        document.getElementById('urunler').innerHTML = html
    })
}

getUrunler('')