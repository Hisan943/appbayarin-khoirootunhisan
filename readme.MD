# 🌟 Bayarin - Aplikasi Pembayaran Tagihan & Pengisian Pulsa

![Bayarin Banner](https://img.shields.io/badge/Version-1.0.0-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Responsive-Yes-success)

## 📋 Deskripsi

**Bayarin** adalah aplikasi web frontend yang mensimulasikan proses pembayaran berbagai tagihan rutin masyarakat Indonesia serta pengisian pulsa/paket data. Aplikasi ini sepenuhnya berjalan di sisi klien (client-side) tanpa backend server nyata, dengan semua data tersimpan di **localStorage** browser.

Aplikasi ini dirancang dengan antarmuka yang modern, intuitif, dan responsif, terinspirasi dari aplikasi seperti Tokopedia, Dana, dan PLN Mobile.

---

## ✨ Fitur Utama

### 1. 🏠 Dashboard
- Ringkasan saldo real-time
- Quick access ke semua fitur
- Promo banner
- Statistik pengeluaran (total transaksi, total pengeluaran, saldo tersisa)

### 2. 📄 Bayar Tagihan
- **4 Kategori**: PLN, PDAM, Internet, Seminar
- **Validasi** nomor pelanggan (8-12 karakter alfanumerik)
- **Detail tagihan** lengkap (nama, alamat, periode, tagihan, denda, jatuh tempo)
- **3 Metode Pembayaran**:
  - 🏦 **Virtual Account** (generate nomor VA + instruksi transfer)
  - 📱 **QRIS** (QR code + countdown timer 5 menit)
  - 🏢 **Teller / Kasir** (kode pembayaran + daftar lokasi)

### 3. 🎓 SPP / Cicilan Kuliah
- **Input NIM** (12 digit angka)
- **Daftar cicilan semester** (minimal 6-8 item)
- **Multi-select** untuk pembayaran beberapa cicilan sekaligus
- **Total otomatis** berdasarkan pilihan
- **Status** (Lunas / Belum Lunas)

### 4. 📱 Isi Pulsa & Paket Data
- **6 Provider**: Telkomsel, XL, Indosat, Tri, Smartfren, Axis
- **Validasi nomor HP** (10-13 digit, diawali 08)
- **Auto-detect provider** dari nomor HP
- **Pilihan nominal** cepat (Rp 10k – Rp 200k) + custom input
- **Preview** sebelum pembayaran

### 5. 📊 Riwayat Transaksi
- **Tabel histori** lengkap
- **Filter** berdasarkan jenis transaksi
- **Statistik** pengeluaran
- **Hapus semua** riwayat

### 6. 🌓 Dark / Light Mode
- Toggle tema dengan satu klik
- Tema tersimpan di localStorage
- Transisi halus antar tema

### 7. 🎯 Fitur Pendukung
- **Loading State** (spinner + text)
- **Toast Notifications** (success, error, info)
- **Modal Konfirmasi** + Bukti Pembayaran
- **Cetak Struk** (window.print)
- **Keyboard Shortcuts** (Alt+1-5 untuk navigasi)
- **Responsive Design** (Desktop, Tablet, Mobile)
- **Form Validation** (real-time & on-submit)

---

## 🛠️ Teknologi yang Digunakan

| Teknologi             | Keterangan                                     |
|-----------------------|------------------------------------------------|
| **HTML5**             | Struktur markup semantic                       |
| **CSS3**              | Flexbox, Grid, Custom Properties, Animations   |
| **Vanilla JavaScript (ES6+)** | DOM manipulation, Event handling, Async/Await |
| **Font Awesome 6**    | Icon library (via CDN)                         |
| **QRCode.js**         | Generate QR code untuk QRIS (via CDN)          |
| **LocalStorage**      | Data persistence                               |

---

## 📱 Responsive Design

Aplikasi mendukung semua ukuran layar:

| Breakpoint   | Target Device |
|--------------|---------------|
| 1024px+      | 💻 Desktop    |
| 768px–1024px | 📱 Tablet     |
| 320px–768px  | 📱 Mobile     |

---

## 🚀 Cara Menjalankan

### Metode 1: Langsung (Tanpa Server)
1. Download atau clone repository ini.
2. Buka folder `bayarin-app`.
3. Klik 2x pada file `index.html` atau buka dengan browser.
4. Aplikasi siap digunakan! 🎉

### Metode 2: Dengan Live Server (Rekomendasi)
```bash
# Install Live Server (VS Code extension)
# Klik kanan pada index.html -> Open with Live Server
```

---

![pdfpembayaranpulsa](screenshots/pdfpembayaranpulsa.png)
![pdf_pembayaran_tagihan_pln](screenshots/pdf_pembayaran_tagihan_pln.png)
![pembayaran_pdam_teller](screenshots/pembayaran_pdam_teller.png)
![pembayaran_pdam_teller](Screenshots/pembayaran_pdam_teller.png)
![pembayaran_pdam_virtual_account](screenshots/pembayaran_pdam_virtual_account.png)
![pulsa](screenshots/pulsa.png)
![riwayat](screenshots/riwayat.png)
![spp](screenshots/spp.png)
![bukti_pembayaran_](screenshots/bukti_pembayaran_.png)
![bukti_pembayaran_pulsa](screenshots/bukti_pembayaran_pulsa.png)
![bukti_pembayaran_tagihan_pln](screenshots/bukti_pembayaran_tagihan_pln.png)
![cek_tagihan_internet](screenshots/cek_tagihan_internet.png) 
![cek_tagihan_pdam](screenshots/cek_tagihan_pdam.png)
![cek_tagihan_pln](screenshots/cek_tagihan_pln.png)
![darkmode](screenshots/darkmode.png)
![dashboard](screenshots/dashboard.png)

Video
![DEMO_APP](video/DEMO_APP.mp4)


