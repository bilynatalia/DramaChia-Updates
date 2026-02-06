# DramaChia README Auto-Update

Repositori ini berisi README.md yang auto-update dengan konten terbaru dari website.

## 🔐 Setup GitHub Secrets (PENTING!)

Sebelum menjalankan workflow, Anda **HARUS** menambahkan secrets:

### Cara Menambahkan Secrets:
1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut:

| Secret Name | Value |
|-------------|-------|
| `API_BASE_URL` | `https://api-ku.dramachia.com` |
| `WEBSITE_URL` | `https://dramachia.com` |

> ⚠️ **Secrets tidak akan terlihat oleh publik!** GitHub menyembunyikan nilai secrets.

---

## Cara Deploy ke GitHub

### 1. Buat Repository Baru
- Buka GitHub dan buat repository baru
- Nama: `dramachia-readme` (atau sesuai keinginan)
- Set ke **Public** agar README bisa dilihat orang lain

### 2. Upload Semua File
Upload seluruh isi folder `dramachia-readme`:
```
dramachia-readme/
├── .github/
│   └── workflows/
│       └── update-readme.yml
├── assets/
│   ├── banner.svg
│   ├── wave.svg
│   ├── typing.svg
│   └── stats-card.svg
├── scripts/
│   └── update-readme.js
├── package.json
└── README.md
```

### 3. Setup Secrets (WAJIB!)
1. **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Tambahkan:
   - Name: `API_BASE_URL` → Value: `https://api-ku.dramachia.com`
   - Name: `WEBSITE_URL` → Value: `https://dramachia.com`

### 4. Enable GitHub Actions
1. Buka tab **Settings** > **Actions** > **General**
2. Di "Workflow permissions", pilih **Read and write permissions**
3. Klik **Save**

### 5. Jalankan Workflow
1. Buka tab **Actions**
2. Klik workflow **🔄 Auto Update README**
3. Klik **Run workflow** > **Run workflow**

### 6. Selesai! 🎉
README akan auto-update setiap 6 jam dengan konten terbaru.

---

## 🔒 Keamanan

- ✅ URL API disimpan di **GitHub Secrets** (tidak terlihat publik)
- ✅ Secrets tidak muncul di logs GitHub Actions
- ✅ Hanya Anda yang bisa melihat/edit secrets
- ✅ Kode source tidak mengandung URL API

---

## Kustomisasi

### Ubah Frekuensi Update
Edit `.github/workflows/update-readme.yml`:
```yaml
schedule:
  - cron: '0 */6 * * *'  # Setiap 6 jam
  # Ubah ke:
  - cron: '0 */3 * * *'  # Setiap 3 jam
  - cron: '0 */12 * * *' # Setiap 12 jam
  - cron: '0 0 * * *'    # Sekali sehari
```

### Ubah Jumlah Drama Tampil
Edit `scripts/update-readme.js` line ~102-103:
```javascript
const latestCards = latestDramas.slice(0, 6)  // Ubah 6 ke jumlah lain
const popularCards = popularDramas.slice(0, 6) // Ubah 6 ke jumlah lain
```
