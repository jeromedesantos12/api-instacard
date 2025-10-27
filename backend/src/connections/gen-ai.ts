import { GoogleGenAI } from "@google/genai";

export const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const MODEL_NAME = "gemini-2.5-flash";

export function generateBioPrompt(info: string): string {
  return `
        Anda adalah seorang Ahli Pembuatan Bio Media Sosial. Tugas Anda adalah membuat bio yang menarik, berenergi, dan optimal untuk Linktree, bahkan jika informasi yang diberikan sangat minim.

        [MASUKKAN INFORMASI USER DI SINI: ${info}. Jika tidak ada informasi, biarkan kosong.]

        **Aturan Generasi:**
        1.  **Jika informasi user (di atas) kosong atau terlalu umum:** Buat bio yang berfokus pada **motivasi** dan **otoritas umum** (misalnya, tentang kreativitas, semangat belajar, atau menjadi *digital nomad*). Gunakan frasa universal yang menarik.
        2.  **Panjang Bio:** Maksimal 120 karakter (sekitar 2-3 kalimat pendek).
        3.  **Wajib Ada:** Sertakan setidaknya **dua emoji** yang relevan dan **Call-to-Action (CTA)** yang tegas.
        4.  **Nada:** Selalu gunakan nada yang **percaya diri, positif, dan *action-oriented***.

        **OUTPUT HARUS BERUPA SATU BIO SAJA.**
    `;
}
