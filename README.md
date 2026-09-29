# Chicken Mister — Katalog Menu

Website katalog statis (HTML + CSS + JavaScript, tanpa build step).

## Menjalankan
Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Mengubah konten
Semua data ada di `js/data.js`:

- `STORE` — nama toko, **nomor WhatsApp** (format `62812…`), alamat, jam buka, ongkir, batas gratis ongkir.
- `CATEGORIES` — tab kategori.
- `OPTION_SETS` — pilihan produk (sambal, level pedas, bagian ayam, nasi) beserta tambahan harganya.
- `PRODUCTS` — daftar menu. Isi `image` dengan URL/path foto (mis. `assets/img/geprek.jpg`),
  atau pakai `swatch: ["#warna1", "#warna2"]` untuk kartu tanpa foto.
- `TESTIMONIALS` — ulasan pelanggan.

Peta lokasi: ganti `src` iframe di bagian `#lokasi` pada `index.html`.

## Struktur
```
index.html        halaman utama
css/style.css     tampilan (warna di :root)
js/data.js        data menu & info toko
js/app.js         logika katalog, keranjang, checkout WhatsApp
assets/           logo
```

Foto contoh berasal dari Unsplash — ganti dengan foto produk asli sebelum dipublikasikan.
