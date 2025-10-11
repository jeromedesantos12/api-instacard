# Panduan Perbaikan: Update User (Multi-File Upload)

Dokumen ini merapikan dan memformat ulang penjelasan perbaikan agar lebih mudah dibaca dan diimplementasikan.

Fokus perbaikan:

- Mengganti single file upload menjadi multi-file upload (avatar dan bg_image) dalam satu request.
- Memperbaiki alur kontrol asinkron untuk mencegah error "Cannot set headers after they are sent".
- Memisahkan logika pemrosesan file di middleware dan controller dengan benar.

---

## Ringkasan Masalah

Kode sebelumnya hanya mendukung satu file di route (upload.single), namun controller mencoba menyimpan dua path file (`avatar_url` dan `bg_image_url`). Selain itu, operasi I/O file tidak diatur asynchronous dengan baik sehingga berisiko mengirim response lebih dari sekali.

---

## Langkah Perbaikan

### 1) Perbarui Router (routes/user.ts)

Gunakan `upload.fields()` untuk mengizinkan unggahan dua field file: `avatar` dan `bg_image`. Pastikan middleware penyimpan file yang digunakan adalah `saveFiles` (bukan `saveFile`).

```ts
// routes/user.ts (cuplikan)
// ... imports (auth, isSame, isExist, validate, upload, saveFiles, updateUser)

router.put(
  "/:id",
  auth,
  isSame,
  isExist("user"),
  // Perubahan utama: dua field file dalam satu request
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
  ]),
  // Catatan: middleware isFile dihapus pada PUT (file opsional)
  validate(userSchema),
  saveFiles,
  updateUser
);
```

### 2) Buat/Perbarui Middleware `saveFiles` (src/middlewares/file.ts)

Middleware ini menormalisasi `req.files` menjadi objek sederhana di `req.processedFiles` sehingga controller mudah menggunakannya.

```ts
// src/middlewares/file.ts
import { Request, Response, NextFunction } from "express";
import { extension } from "mime-types";

// Mengganti/menambahkan saveFiles sebagai pengganti saveFile
export function saveFiles(req: Request, res: Response, next: NextFunction) {
  // req.files adalah objek: { avatar: [file], bg_image: [file] }
  const files = (req as any).files as Record<string, any[]> | undefined;

  if (files && typeof files === "object") {
    const processedFiles: Record<
      string,
      { fileName: string; fileBuffer: Buffer }
    > = {};

    for (const fieldName in files) {
      const fileArray = files[fieldName];
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        const ext = extension(file.mimetype);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        const fileName = `${fieldName}-${uniqueSuffix}.${ext}`;
        const fileBuffer: Buffer = file.buffer;

        processedFiles[fieldName] = { fileName, fileBuffer };
      }
    }

    (req as any).processedFiles = processedFiles;
  }

  // Lanjut meskipun tidak ada file
  next();
}
```

Catatan:

- Jika sebelumnya ada middleware `isFile` yang mewajibkan file pada PUT, hapus dari rute update karena file bersifat opsional.

### 3) Revisi Controller `updateUser` (src/controllers/user.ts)

Gunakan versi Promise untuk penghapusan file (fs/promises) agar bisa `await`. Lakukan update Prisma terlebih dahulu, kemudian operasi I/O file.

```ts
// src/controllers/user.ts (cuplikan fungsi)
import { Request, Response, NextFunction } from "express";
import { unlink as unlinkAsync } from "fs/promises";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "../connections/prisma";
import { appError } from "../utils/error";

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  // Ganti 'remove' tunggal menjadi remove_avatar dan remove_bg
  const { remove_avatar, remove_bg, name, username, bio } = req.body as Record<
    string,
    string
  >;
  const existingUser = (req as any).model; // diasumsikan di-set oleh isExist("user")

  // File baru hasil normalisasi saveFiles
  const newFiles = (req as any)?.processedFiles as
    | {
        avatar?: { fileName: string; fileBuffer: Buffer };
        bg_image?: { fileName: string; fileBuffer: Buffer };
      }
    | undefined;

  const newAvatar = newFiles?.avatar;
  const newBgImage = newFiles?.bg_image;

  const uploadsDir = resolve(process.cwd(), "uploads");

  try {
    // 1) Ambil path lama dari DB (SBLM update)
    const oldAvatarPathDB = existingUser.avatar_url as string | null;
    const oldBgImagePathDB = existingUser.bg_image_url as string | null;

    // 2) Siapkan payload update DB
    const dataToUpdate: any = { username, name, bio };

    // Avatar
    if (remove_avatar === "ok") {
      dataToUpdate.avatar_url = null;
    } else if (newAvatar) {
      dataToUpdate.avatar_url = `user/avatar/${newAvatar.fileName}`;
    }

    // Background Image
    if (remove_bg === "ok") {
      dataToUpdate.bg_image_url = null;
    } else if (newBgImage) {
      dataToUpdate.bg_image_url = `user/image/${newBgImage.fileName}`;
    }

    // 3) Update DB (validasi unik dsb. terjadi di sini)
    await prisma.user.update({ data: dataToUpdate, where: { id } });

    // 4) Operasi File System
    // A. Hapus file lama jika perlu
    const filesToDelete: string[] = [];

    if (oldAvatarPathDB && (remove_avatar === "ok" || newAvatar)) {
      filesToDelete.push(resolve(uploadsDir, oldAvatarPathDB));
    }
    if (oldBgImagePathDB && (remove_bg === "ok" || newBgImage)) {
      filesToDelete.push(resolve(uploadsDir, oldBgImagePathDB));
    }

    await Promise.all(
      filesToDelete.map((path) =>
        unlinkAsync(path).catch((err: any) => {
          if (err?.code !== "ENOENT") {
            console.error("Failed to delete old file:", path, err);
            throw appError("Failed to clean up old file.", 500);
          }
        })
      )
    );

    // B. Tulis file baru
    if (newAvatar) {
      const newPath = resolve(uploadsDir, "user", "avatar", newAvatar.fileName);
      writeFileSync(newPath, newAvatar.fileBuffer);
    }
    if (newBgImage) {
      const newPath = resolve(uploadsDir, "user", "image", newBgImage.fileName);
      writeFileSync(newPath, newBgImage.fileBuffer);
    }

    // 5) Ambil data terbaru untuk respons
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar_url: true,
        bg_image_url: true,
        bio: true,
        created_at: true,
        updated_at: true,
      },
      where: { id },
    });

    res.status(200).json({
      status: "Success",
      message: `Update user ${user?.name} success!`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
```

---

## Penjelasan Kunci Perbaikan

- Gunakan `await unlinkAsync(...)` (fs/promises) alih-alih callback `unlink(...)` untuk alur asynchronous yang rapi. Mencegah response terkirim ganda.
- Pisahkan dua file input menjadi dua entitas: `newAvatar` dan `newBgImage`, sesuai `avatar_url` dan `bg_image_url` di DB.
- Lakukan update Prisma terlebih dahulu. Jika gagal (misalnya unique constraint), operasi I/O file tidak dijalankan sia-sia.
- Ganti flag `remove` tunggal menjadi `remove_avatar` dan `remove_bg` agar kontrol penghapusan lebih presisi.
- Ambil ulang data user setelah update untuk mengembalikan representasi terbaru ke klien.

---

## Catatan Implementasi

- Pastikan direktori berikut ada:
  - `uploads/user/avatar`
  - `uploads/user/image`
- Pastikan instance `upload` (multer) sudah dikonfigurasi untuk menyimpan ke memory (agar `file.buffer` tersedia) jika menulis manual via `writeFileSync`.
- Pada route PUT, file bersifat opsional. Jangan memaksa keberadaan file melalui middleware validasi file.

---

## Contoh Request (cURL)

```bash
curl -X PUT "http://localhost:3000/api/users/<USER_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "username=new_username" \
  -F "name=New Name" \
  -F "bio=New bio" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "bg_image=@/path/to/bg.jpg"
```

Hapus salah satu gambar tanpa mengganti yang lain:

```bash
# Hapus avatar saja
curl -X PUT "http://localhost:3000/api/users/<USER_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "remove_avatar=ok"

# Hapus background image saja
curl -X PUT "http://localhost:3000/api/users/<USER_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "remove_bg=ok"
```

---

## Checklist

- [ ] Router menggunakan `upload.fields([{ name: 'avatar' }, { name: 'bg_image' }])`.
- [ ] Middleware `saveFiles` tersedia dan dipanggil sebelum controller.
- [ ] Controller `updateUser` menggunakan `fs/promises` untuk penghapusan file dan menulis file baru setelah DB sukses.
- [ ] Flag `remove_avatar` dan/atau `remove_bg` didukung di body form-data.
- [ ] Direktori upload tersedia dan dapat ditulisi.
