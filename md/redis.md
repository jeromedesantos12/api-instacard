# Menjalankan Redis di Linux (Ubuntu/Debian)

Ada beberapa cara untuk menghidupkan server Redis di Linux, namun yang paling umum adalah menggunakan package manager (apt) dan service manager (systemd).

## 1. Instalasi dan Menjalankan Redis (Debian/Ubuntu) 🐧

Ini adalah cara paling standar untuk distribusi berbasis Debian/Ubuntu.

### A. Instalasi Redis

Perbarui daftar paket:

```bash
sudo apt update
```

Instal Redis Server (mengunduh dan mengatur sebagai service yang berjalan otomatis):

```bash
sudo apt install -y redis-server
```

### B. Memeriksa dan Menjalankan Service

Setelah instalasi, Redis biasanya langsung berjalan otomatis. Verifikasi statusnya dengan systemctl:

Periksa status:

```bash
sudo systemctl status redis-server
```

Anda seharusnya melihat output dengan status: Active: active (running).

Jika perlu memulai secara manual:

```bash
sudo systemctl start redis-server
```

Aktifkan agar otomatis berjalan saat booting:

```bash
sudo systemctl enable redis-server
```
