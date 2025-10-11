## Implementasi Caching Redis di Express.js

Dokumen ini menjelaskan strategi efektif untuk mengimplementasikan caching data menggunakan Redis di aplikasi Express.js/Node.js, khususnya mengatasi masalah data basi (stale data) saat terjadi pembaruan.

### 1. Masalah Utama: Data Basi (Stale Data)

Ketika Anda menggunakan caching Redis dengan TTL (Time-To-Live), data lama akan tersimpan di cache meskipun data di database sudah di-update. Pengguna akan tetap melihat data lama sampai TTL cache tersebut habis.

**Solusi**: Terapkan Cache Invalidation (Pembatalan Cache) menggunakan strategi **Cache-Aside Pattern** dan perintah Redis `SCAN`.

### 2. Strategi Caching yang Benar (Cache-Aside Pattern)

Untuk memaksimalkan manfaat Redis, selalu cek cache terlebih dahulu sebelum melakukan query ke database.

**Alur Kerja pada Controller `get` (Contoh: `getUsers`):**

1.  **Buat Key Unik**: Tentukan key unik berdasarkan semua parameter query (misalnya: `users:search:John:page:1:limit:10`).
2.  **Cek Cache**: Coba ambil data dari Redis menggunakan key tersebut.
3.  **Cache Hit**: Jika ada, kembalikan data langsung dari Redis.
4.  **Cache Miss**: Jika tidak ada, baru query data dari Database (Prisma).
5.  **Set Cache**: Simpan hasil query (data dan total) ke Redis, sertakan TTL (misalnya `EX: 3600` untuk 1 jam).
6.  **Kirim Respons**: Kembalikan data kepada pengguna.

### 3. Solusi Invalidation: Menghapus Cache saat Update

Setiap kali ada operasi penulisan (Create, Update, Delete) yang memengaruhi data, kita harus menghapus semua key cache yang terkait dari Redis.

#### A. Mengapa Menggunakan `SCAN` (Bukan `KEYS`)

- `KEYS`: Memblokir server Redis (bahaya di lingkungan produksi karena dapat menurunkan performa secara drastis).
- `SCAN`: Beroperasi secara inkremental (bertahap) dan non-blocking, menjaga performa server tetap stabil.

#### B. Implementasi Fungsi `rmCache`

Dibuat sebuah fungsi utilitas di `src/utils/rm-cache.ts` untuk menghapus key yang cocok dengan sebuah pola (prefix).

```typescript
/**
 * Menghapus semua key di Redis yang cocok dengan pola (misal: "users:*")
 * menggunakan SCAN untuk operasi non-blocking.
 */
import { redis } from "../connections/redis";

export const rmCache = async (pattern: string) => {
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      MATCH: `${pattern}*`,
      COUNT: 100, // Jumlah key yang diperiksa per iterasi
    });

    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } while (cursor !== "0"); // Iterasi berlanjut sampai cursor kembali ke '0'
};
```

#### C. Penerapan pada Operasi Penulisan

Panggil fungsi invalidation setelah operasi database berhasil.

```typescript
// Contoh pada updateUser, createLink, deleteSocial, dll.
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Update data di Database (Prisma)
    const updatedUser = await prisma.user.update({
      /* ... */
    });

    // 2. Lakukan Cache Invalidation untuk semua cache user
    await rmCache("users:");

    // 3. Kirim Respons
    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}
```

### 4. Kelemahan `SCAN` dan Jaring Pengaman TTL

- **Kelemahan `SCAN`**: Ada kemungkinan kecil bahwa beberapa key cache terlewatkan (tidak terhapus) jika ada key yang ditambahkan/dihapus secara bersamaan saat proses `SCAN` berjalan.
- **Jaring Pengaman (Safety Net)**: **TTL** bertindak sebagai garansi. Jika sebuah key terlewatkan oleh `SCAN`, cache tersebut akan bertahan, tetapi hanya sampai TTL-nya habis. Ini adalah waktu maksimal data basi dapat bertahan.

**Kesimpulan**: Menggunakan `SCAN` untuk invalidation dan `TTL` sebagai jaring pengaman adalah praktik terbaik untuk menyeimbangkan performa Redis dan keakuratan data.
