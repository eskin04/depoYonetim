const router=require('express').Router()
// kütüphane çağrıldı
const {getDepo,depo_orani,depo_stok_sayisi,depo_toplam_fiyat,depoda_bulunan_urunler,toplam_depo}=require('../controllers/getDepo')
const {getKategori}=require('../controllers/getKategori')
const {getUrunler,toplam_urun,urun_depo_dagilim,tum_urunler}=require('../controllers/getUrunler')
const {stoklar_en_az,stoklar_en_cok}=require('../controllers/getStoklar')
const { analyzeImage } = require('../controllers/analyzeImage');
const { getUrunStokDetay } = require('../controllers/urunStokDetay');
const { stokGuncelle } = require('../controllers/stokGuncelle');
const { stokTahmin } = require("../controllers/tahminGPT");


router.get('/depo',getDepo)
router.get('/depo_orani',depo_orani)
router.get('/depo_stok_sayisi',depo_stok_sayisi)
router.get('/depo_toplam_fiyat',depo_toplam_fiyat)
router.get('/depoda_bulunan_urunler',depoda_bulunan_urunler)
router.get('/toplam_depo',toplam_depo)
router.get('/kategori',getKategori)
router.get('/urunler',getUrunler)
router.get('/toplam_urun',toplam_urun)
router.get('/urun_depo_dagilim',urun_depo_dagilim)
router.get('/stoklar_en_az',stoklar_en_az)
router.get('/stoklar_en_cok',stoklar_en_cok)
router.post('/analyze-image', analyzeImage);
router.get('/urun_stok_detay', getUrunStokDetay);
router.patch('/stok_guncelle', stokGuncelle);
router.get('/tum_urunler', tum_urunler);
router.post("/stok_tahmin", stokTahmin);

module.exports=router
// apileri burada oluşturdukk router.get api oluşturuyor