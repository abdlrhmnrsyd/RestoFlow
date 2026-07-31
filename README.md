<p align="center">
  <img src="https://img.shields.io/badge/RestoFlow-Restaurant_POS-orange?style=for-the-badge&logo=rescuetime&logoColor=white" alt="RestoFlow Logo" width="180" />
</p>

<h1 align="center">🍽️ RestoFlow</h1>

<p align="center">
  <b>Ekosistem Manajemen Restoran Modern, Point of Sale (POS) & Self-Ordering System Berbasis QR Code</b>
</p>

<p align="center">
  <a href="#-teknologi--stack">
    <img src="https://img.shields.io/badge/Laravel-13.x-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 13" />
  </a>
  <a href="#-teknologi--stack">
    <img src="https://img.shields.io/badge/PHP-8.3+-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8.3" />
  </a>
  <a href="#-teknologi--stack">
    <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  </a>
  <a href="#-teknologi--stack">
    <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  </a>
  <a href="#-teknologi--stack">
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  </a>
  <a href="#-integrasi-pembayaran-midtrans">
    <img src="https://img.shields.io/badge/Payment-Midtrans-blue?style=flat-square" alt="Midtrans Payment" />
  </a>
  <a href="#-lisensi">
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License MIT" />
  </a>
</p>

---

## 📌 Daftar Isi

- [Tentang RestoFlow](#-tentang-restoflow)
- [Fitur Utama](#-fitur-utama)
- [Teknologi & Stack](#-teknologi--stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Panduan Instalasi & Mekanisme Setup](#-panduan-instalasi--mekanisme-setup)
  - [Prasyarat Sistem](#prasyarat-sistem)
  - [1. Setup Backend (Laravel API)](#1-setup-backend-laravel-api)
  - [2. Setup Frontend (React + Vite)](#2-setup-frontend-react--vite)
- [Akun Demo & Akses Peran (Default Credentials)](#-akun-demo--akses-peran-default-credentials)
- [Integrasi Pembayaran Midtrans](#-integrasi-pembayaran-midtrans)
- [Dokumentasi API (OpenAPI / Swagger)](#-dokumentasi-api-openapi--swagger)
- [Lisensi](#-lisensi)

---

## 🚀 Tentang RestoFlow

**RestoFlow** adalah solusi *end-to-end* modern untuk pengoperasian bisnis restoran modern. Dikembangkan dengan menggabungkan keandalan **Laravel 13** sebagai API Backend dan kecepatan **React 19 + Vite** pada Frontend, RestoFlow menghadirkan pengalaman operasional tanpa hambatan — mulai dari pemesanan mandiri oleh pelanggan melalui **QR Code meja**, kasir kasir interaktif (**Point of Sale / POS**), manajemen meja & reservasi, manajemen inventaris stok bahan makanan, hingga integrasi pembayaran digital **Midtrans Gateway (QRIS, E-Wallet, Virtual Account)**.

---

## ✨ Fitur Utama

### 🛒 1. Interactive Point of Sale (POS)
* **Kasir Cepat & Responsif**: Antarmuka responsif untuk entri pesanan *dine-in* maupun *takeaway*.
* **Filter Kategori & Pencarian**: Memudahkan kasir menemukan menu favorit dalam hitungan detik.
* **Kalkulasi Otomatis**: Menghitung subtotal, pajak, diskon, dan kembalian secara real-time.

### 📲 2. QR Code Customer Self-Ordering (Digital Menu)
* **Scan & Pesan Mandiri**: Pelanggan cukup memindai QR Code di meja (`/table/:tableNumber`) untuk melihat menu interaktif.
* **Direct Order Creation**: Pesanan langsung masuk ke antrean dapur/dapur tanpa perlu menunggu pelayan.
* **Fleksibilitas Pembayaran**: Pelanggan dapat memilih bayar di meja via Online Gateway (Midtrans) atau tunai di kasir.

### 💳 3. Payment Gateway Integrasi (Midtrans & Tunai)
* **Online Payment (Snap Midtrans)**: Menerima QRIS, GoPay, ShopeePay, Virtual Account (BCA, Mandiri, BNI, BRI), dan Kartu Kredit.
* **Auto Sync Status Callback**: Webhook otomatis memperbarui status transaksi menjadi `paid` begitu pembayaran berhasil.
* **Pembayaran Tunai (Cash)**: Pencatatan tunai cepat disertai bukti cetak receipt/struk digital.

### 🪑 4. Dynamic Table & Floor Management
* **Manajemen Meja Real-Time**: Status meja otomatis berubah (*Available*, *Occupied*, *Reserved*).
* **QR Code Generator**: Generator QR Code bawaan untuk setiap meja yang siap diunduh & dicetak.
* **Kapasitas Meja & Area**: Pengaturan kapasitas meja sesuai tata letak restoran.

### 📦 5. Smart Inventory & Stock Tracking
* **Deduction Stok Otomatis**: Stok bahan makanan berkurang otomatis setiap kali ada pesanan selesai.
* **Log Transaksi Bahan**: Riwayat bahan masuk (*In*), keluar (*Out*), dan penyesuaian (*Adjustment*).
* **Manajemen Supplier**: Pencatatan data pemasok/supplier bahan baku restoran.

### 📊 6. Executive Dashboard & Sales Analytics
* **Laporan Pendapatan Real-Time**: Grafik tren penjualan harian, mingguan, dan bulanan.
* **Item Terlaris (Top Selling)**: Ringkasan menu yang paling diminati pelanggan.
* **Statistik Meja & Transaksi**: Ringkasan performa operasional restoran secara visual.

### 🔐 7. Role-Based Access Control (RBAC)
Didukung oleh **Spatie Laravel Permission** dengan tingkatan hak akses:
* 👑 **Admin**: Akses penuh ke seluruh konfigurasi sistem, pengguna, dan peran.
* 👔 **Manager**: Akses ke laporan keuangan, inventaris, manajemen menu, dan meja.
* 💼 **Cashier**: Akses khusus antarmuka POS, transaksi, pembayaran, dan status meja.
* 🍽️ **Waiter / Kitchen**: Akses monitor antrean pesanan & dapur.

---

## 🛠️ Teknologi & Stack

### **Backend (Server API)**
- **Framework**: [Laravel 13.x](https://laravel.com/) (PHP >= 8.3)
- **Autentikasi**: [Laravel Sanctum](https://laravel.com/docs/sanctum) (Bearer Token API Auth)
- **Hak Akses (RBAC)**: [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)
- **Payment Gateway**: [Midtrans PHP SDK](https://github.com/Midtrans/midtrans-php)
- **QR Code Engine**: [Simple Software IO QR Code](https://github.com/SimpleSoftwareIO/simple-qrcode)
- **Image Processing**: [Intervention Image Laravel](https://image.intervention.io/)
- **API Documentation**: [Dedoc Scramble](https://scramble.dedoc.co/) (OpenAPI / Swagger Specs)
- **Database Supported**: MySQL / PostgreSQL / SQLite

### **Frontend (Client Application)**
- **Framework & Library**: [React 19.x](https://react.dev/) + [Vite 8.x](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Code Linter**: [Oxlint](https://github.com/oxc-project/oxc)

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RestoFlow Ecosystem Architecture                  │
└─────────────────────────────────────────────────────────────────────────────┘

       [ Pelanggan (Smartphone) ]                  [ Kasir / Staf Restoran ]
                   │                                          │
        (Scan QR Code Meja)                          (Akses Aplikasi POS)
                   │                                          │
                   ▼                                          ▼
  ┌─────────────────────────────────┐        ┌──────────────────────────────────┐
  │     Client App (React 19)       │        │      Client App (React 19)      │
  │     Self-Ordering Digital Menu  │        │   POS, Dashboard, Inventory UI   │
  └────────────────┬────────────────┘        └────────────────┬─────────────────┘
                   │                                          │
                   └──────────────────┬───────────────────────┘
                                      │ REST API (JSON / Sanctum Auth)
                                      ▼
                   ┌──────────────────────────────────┐
                   │    Laravel 13 API Backend        │
                   ├──────────────────────────────────┤
                   │  • Order & Table Service         │
                   │  • Inventory & Stock Engine      │
                   │  • RBAC & Security Layer         │
                   │  • Payment Webhook Handler       │
                   └──────────────────┬───────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
   ┌──────────────┐          ┌─────────────────┐        ┌──────────────────┐
   │ Database     │          │ Midtrans Engine │        │ QR Code Engine   │
   │ (MySQL/      │          │ (Payment        │        │ (Table QR        │
   │ SQLite)      │          │  Gateway)       │        │  Generator)      │
   └──────────────┘          └─────────────────┘        └──────────────────┘
```

---

## 📂 Struktur Direktori Proyek

```text
restoflow/
├── client/                     # App Frontend (React 19 + Vite)
│   ├── public/                 # Aset publik statis
│   ├── src/
│   │   ├── assets/             # Gambar & file media
│   │   ├── components/         # Komponen UI reusable & Protected Routes
│   │   ├── context/            # AuthContext & State Management
│   │   ├── pages/              # Halaman Utama (POS, Dashboard, Order, dll)
│   │   ├── services/           # Service Axios API Client
│   │   ├── App.jsx             # Main Router & Provider
│   │   └── main.jsx            # Entry point React
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # App Backend (Laravel 13 API)
│   ├── app/
│   │   ├── Enums/              # Enum Status, Role, & Payment Type
│   │   ├── Http/
│   │   │   ├── Controllers/    # API Controller Endpoints
│   │   │   └── Requests/       # Form Request Validation
│   │   ├── Models/             # Eloquent Models (Order, Menu, Inventory)
│   │   ├── Repositories/       # Repository Pattern Layer
│   │   └── Services/           # Business Logic Services
│   ├── database/
│   │   ├── factories/          # Testing & Mocking Factories
│   │   ├── migrations/         # Tabel Skema Database
│   │   └── seeders/            # Database Seeders & Demo Data
│   ├── routes/
│   │   └── api.php             # Route Endpoints REST API
│   ├── composer.json
│   └── .env.example
│
└── README.md                   # Dokumentasi Utama Proyek
```

---

## 💻 Panduan Instalasi & Mekanisme Setup

### Prasyarat Sistem
Pastikan perangkat Anda telah terpasang software berikut:
- **PHP** `>= 8.3` dengan ekstensi `pdo`, `mbstring`, `openssl`, `gd`/`imagick`
- **Composer** `>= 2.x`
- **Node.js** `>= 20.x` & **npm** `>= 10.x`
- **Database Engine** (MySQL/MariaDB versi 8+ atau SQLite)

---

### 1. Setup Backend (Laravel API)

1. Masuk ke direktori `server`:
   ```bash
   cd server
   ```

2. Install dependensi PHP via Composer:
   ```bash
   composer install
   ```

3. Salin file environment dan jalankan generate app key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Konfigurasikan database pada file `.env`. Untuk pengembangan cepat (SQLite):
   ```env
   DB_CONNECTION=sqlite
   ```
   *(Atau gunakan konfigurasi MySQL/MariaDB jika diperlukan)*.

5. Jalankan migrasi database beserta data awal (Seeder):
   ```bash
   php artisan migrate:fresh --seed
   ```

6. Buat symbolic link storage untuk file gambar menu:
   ```bash
   php artisan storage:link
   ```

7. Jalankan server backend Laravel:
   ```bash
   php artisan serve
   ```
   *Backend REST API akan berjalan pada `http://localhost:8000`*

---

### 2. Setup Frontend (React + Vite)

1. Buka terminal baru dan masuk ke direktori `client`:
   ```bash
   cd client
   ```

2. Install dependensi Node.js:
   ```bash
   npm install
   ```

3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   *Aplikasi web frontend akan berjalan pada `http://localhost:5173`*

---

## 🔑 Akun Demo & Akses Peran (Default Credentials)

Secara default, `DatabaseSeeder` menyertakan akun pengguna demonstrasi untuk uji coba berbagai peran:

| Peran (Role) | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@restoflow.com` | `password123` | Manajemen User, Peran (RBAC), Full System Control |
| **Manager** | `manager@restoflow.com` | `password123` | Inventaris, Menu, Kategori, Manajemen Meja, Dashboard |
| **Cashier** | `cashier@restoflow.com` | `password123` | Aplikasi POS, Entri Transaksi, Pembayaran Tunai & QR |
| **Waiter** | `waiter@restoflow.com` | `password123` | Monitor Pesanan Pelanggan & Status Meja |
| **Kitchen** | `kitchen@restoflow.com` | `password123` | Antrean Pesanan Dapur & Update Status Masakan |

---

## 💳 Integrasi Pembayaran Midtrans

RestoFlow mendukung **Midtrans Snap Payment Gateway** dalam mode Sandbox & Production.

Tambahkan Server Key & Client Key dari Dashboard Midtrans Anda ke dalam file `server/.env`:

```env
MIDTRANS_SERVER_KEY=Mid-server-YOUR_SERVER_KEY_HERE
MIDTRANS_CLIENT_KEY=Mid-client-YOUR_CLIENT_KEY_HERE
MIDTRANS_IS_PRODUCTION=false
```

### Konfigurasi Webhook Notification Endpoint:
Daftarkan URL Callback Webhook berikut pada Midtrans Dashboard -> *Payment Notification URL*:
```text
https://domain-restoflow-anda.com/api/payments/webhook
```

---

## 📖 Dokumentasi API (OpenAPI / Swagger)

RestoFlow dilengkapi dengan dokumentasi interaktif yang dibuat otomatis oleh **Dedoc Scramble**.

Setelah server backend berjalan (`php artisan serve`), Anda dapat mengakses UI Dokumentasi API pada:

📌 **[http://localhost:8000/docs/api](http://localhost:8000/docs/api)**

---

## 📄 Lisensi

Proyek RestoFlow ini dilisensikan di bawah [MIT License](LICENSE). Anda bebas menggunakan, memodifikasi, dan mendistribusikan proyek ini untuk keperluan personal maupun komersial.

<p align="center">
  Dibuat dengan ❤️ untuk kemajuan efisiensi industri kuliner & restoran.
</p>
