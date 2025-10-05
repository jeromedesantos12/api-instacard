# Konfigurasi Swagger Modular di Proyek Ini

Dokumentasi API di proyek ini menggunakan **Swagger (OpenAPI 3.0)** dengan pendekatan modular. Artinya, spesifikasi API tidak ditulis dalam satu file raksasa, melainkan dipecah menjadi beberapa file YAML yang lebih kecil dan terkelola. Berikut adalah penjelasan cara kerjanya:

## 1. File Utama: `swagger/api.yaml`

Ini adalah file "akar" atau file utama dari konfigurasi Swagger Anda.

- **Tugas Utama:** Mendefinisikan informasi dasar API seperti judul, versi, dan server base URL.
- **Struktur:**
  ```yaml
  openapi: 3.0.0
  info:
    title: InstaCard API (Modular Design-First)
    version: 1.0.0
  servers:
    - url: /api/v1 # Base URL untuk semua endpoint
  security:
    - cookieAuth: [] # Menetapkan keamanan default (cookie) untuk semua API
  paths:
    $ref: "./paths.yaml" # Mengambil semua definisi path dari file lain
  components:
    $ref: "./models.yaml" # Mengambil semua komponen dari file lain
  ```
- **Poin Kunci:** File ini tidak mendefinisikan endpoint secara langsung. Sebaliknya, ia menggunakan `$ref` untuk "mengimpor" definisi `paths` (semua endpoint) dan `components` (model data, skema keamanan, dll) dari file lain.

## 2. Definisi Endpoint: `swagger/paths.yaml`

File ini berisi "daging" dari dokumentasi API Anda, yaitu semua endpoint yang tersedia.

- **Tugas Utama:** Mendefinisikan setiap endpoint API, termasuk metode HTTP, parameter, request body, dan kemungkinan respons.
- \*\*Contoh Struktur (`/auth/login`):
  ```yaml
  /auth/login:
    post:
      tags: [Auth]
      summary: User login
      security: [] # Override keamanan global, endpoint ini publik
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginRequest" # Merujuk ke schema di models.yaml
      responses:
        "200": { description: Success }
        "401": { $ref: "#/components/responses/Unauthorized" } # Merujuk ke response di models.yaml
  ```
- **Poin Kunci:** Setiap endpoint didefinisikan di sini. Perhatikan penggunaan `$ref` yang merujuk ke `components` yang didefinisikan di `models.yaml`. Ini membuat kode tetap bersih dan menghindari duplikasi.

## 3. Komponen & Model Data: `swagger/models.yaml`

File ini adalah pustaka komponen yang dapat digunakan kembali di seluruh dokumentasi API Anda.

- **Tugas Utama:** Mendefinisikan semua elemen yang dapat digunakan kembali (reusable).
- **Struktur:**
  - `securitySchemes`: Mendefinisikan cara kerja otentikasi. Di sini `cookieAuth` didefinisikan untuk mencari otentikasi di cookie.
  - `parameters`: Mendefinisikan parameter yang sering digunakan, seperti `IdPath` untuk parameter ID di URL.
  - `responses`: Mendefinisikan respons standar seperti `Unauthorized` atau `NotFound`.
  - `schemas`: Mendefinisikan skema atau bentuk objek data, seperti `LoginRequest`, `RegisterRequest`, `User`, dll.
- **Poin Kunci:** Memusatkan semua model data dan komponen di satu tempat membuat `paths.yaml` jauh lebih mudah dibaca dan dikelola.

## 4. Penggabungan & Penyajian: `src/app.ts`

File-file YAML di atas hanyalah definisi. `src/app.ts` adalah file yang mengambil definisi tersebut, menggabungkannya, dan menyajikannya sebagai halaman web interaktif.

- **Tugas Utama:** Membaca semua file YAML, menggabungkannya menjadi satu objek spesifikasi OpenAPI yang valid, dan menggunakan `swagger-ui-express` untuk menampilkannya.
- **Kode Kunci:**

  ```typescript
  // 1. Memuat semua file YAML
  const swaggerApi = YAML.load(resolve(process.cwd(), "swagger/api.yaml"));
  const swaggerPaths = YAML.load(resolve(process.cwd(), "swagger/paths.yaml"));
  const swaggerModels = YAML.load(
    resolve(process.cwd(), "swagger/models.yaml")
  );

  // 2. Menggabungkan file-file tersebut secara manual
  const swaggerDocument = {
    ...swaggerApi,
    paths: swaggerPaths,
    components: swaggerModels,
  };

  // 3. Menyajikan dokumentasi di endpoint /api-docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  ```

- **Poin Kunci:** Proses penggabungan ini sangat penting. Tanpanya, referensi `$ref` di `api.yaml` tidak akan berfungsi, dan Swagger UI tidak akan dapat menampilkan endpoint apa pun.

## Alur Kerja

1.  **Definisi:** Anda mendefinisikan API Anda di file-file `.yaml` (`api.yaml`, `paths.yaml`, `models.yaml`).
2.  **Pemuatan:** Saat aplikasi Node.js dimulai, `app.ts` memuat ketiga file YAML tersebut.
3.  **Penggabungan:** `app.ts` menggabungkan ketiganya menjadi satu objek JavaScript `swaggerDocument` yang lengkap.
4.  **Penyajian:** `swagger-ui-express` mengambil objek `swaggerDocument` dan secara otomatis menghasilkan dokumentasi API yang interaktif dan indah di alamat `/api-docs`.

Dengan cara ini, Anda dapat mengelola dokumentasi API yang besar dengan cara yang jauh lebih terstruktur dan mudah dipelihara.
