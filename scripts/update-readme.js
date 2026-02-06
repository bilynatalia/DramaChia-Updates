const https = require("https");
const fs = require("fs");
const path = require("path");

// API Configuration - Uses environment variable (GitHub Secret)
const API_BASE = process.env.API_BASE_URL || "https://your-api-url.com";
const WEBSITE_URL = process.env.WEBSITE_URL || "https://dramachia.com";

// Check if API URL is configured
if (!process.env.API_BASE_URL) {
  console.error("❌ ERROR: API_BASE_URL environment variable is not set!");
  console.error("   Please add API_BASE_URL to your GitHub Secrets");
  process.exit(1);
}

// Fetch data from API
function fetchAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${endpoint}`;
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

// Format play count for display
function formatPlayCount(count) {
  if (!count) return "0";
  if (typeof count === "string") {
    return count; // Already formatted like "100M", "22.8M"
  }
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
}

// Generate drama card HTML for README (table cell format)
function generateDramaCard(drama, index) {
  const bookId = drama.bookId || drama.id;
  const name = drama.bookName || drama.name;
  // Truncate name if too long
  const shortName = name.length > 25 ? name.substring(0, 22) + "..." : name;
  const cover = drama.cover;

  return `    <td align="center" width="150">
      <a href="${WEBSITE_URL}/detail/${bookId}">
        <img src="${cover}" width="120" style="border-radius: 8px;"/>
        <br/><sub><b>${shortName}</b></sub>
      </a>
    </td>`;
}

// Generate category badges (split into rows)
function generateCategoryBadges(categories) {
  const colors = ['9f1239', 'ef4444', 'dc2626', 'be123c', 'e11d48'];
  const badges = categories.slice(0, 10).map((cat, i) => {
    const color = colors[i % colors.length];
    const name = encodeURIComponent(cat.name.replace(/ /g, '_'));
    return `[![${cat.name}](https://img.shields.io/badge/${name}-${color}?style=for-the-badge&logoColor=white)](${WEBSITE_URL}/kategori/${cat.replaceName})`;
  });
  // Split into rows of 5
  const row1 = badges.slice(0, 5).join('\n');
  const row2 = badges.slice(5, 10).join('\n');
  return row1 + '\n\n' + row2;
}

// Get current date formatted
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  };
  return now.toLocaleDateString("id-ID", options) + " WIB";
}

// Main function to generate README
async function generateReadme() {
  console.log("🎬 Fetching data from DramaChia API...");
  console.log("📡 API Base: [HIDDEN]"); // Don't log the actual URL

  try {
    // Fetch all data in parallel
    const [latestRes, popularRes, categoriesRes] = await Promise.all([
      fetchAPI("/api/latest"),
      fetchAPI("/api/popular"),
      fetchAPI("/api/categories"),
    ]);

    const latestDramas = latestRes.data || [];
    const popularDramas = popularRes.data?.book || popularRes.data || [];
    const categories = categoriesRes.data || [];

    console.log(`✅ Fetched ${latestDramas.length} latest dramas`);
    console.log(`✅ Fetched ${popularDramas.length} popular dramas`);
    console.log(`✅ Fetched ${categories.length} categories`);

    // Generate drama cards
    const latestCards = latestDramas
      .slice(0, 6)
      .map((d, i) => generateDramaCard(d, i))
      .join("");
    const popularCards = popularDramas
      .slice(0, 6)
      .map((d, i) => generateDramaCard(d, i))
      .join("");

    // Generate category badges
    const categoryBadges = generateCategoryBadges(categories);

    // Calculate stats
    const totalLatest = latestDramas.length;
    const totalPopular = popularDramas.length;
    const totalCategories = categories.length;

    // Generate README content
    const readme = `<!-- 
  ╔═══════════════════════════════════════════════════════════════╗
  ║           🎬 DRAMACHIA - AUTO-GENERATED README 🎬              ║
  ║     This file is automatically updated by GitHub Actions      ║
  ║              Last Update: ${getCurrentDate()}              ║
  ╚═══════════════════════════════════════════════════════════════╝
-->

<div align="center">

# 🎬 DramaChia

### Nonton Drama Gratis dengan Subtitle Indonesia

<br/>

<a href="${WEBSITE_URL}">
  <img src="https://img.shields.io/badge/🌐_Kunjungi_Website-9f1239?style=for-the-badge&logoColor=white" alt="Website"/>
</a>
&nbsp;
<a href="${WEBSITE_URL}/latest">
  <img src="https://img.shields.io/badge/🎬_Drama_Terbaru-ef4444?style=for-the-badge&logoColor=white" alt="Latest"/>
</a>
&nbsp;
<a href="${WEBSITE_URL}/search">
  <img src="https://img.shields.io/badge/🔍_Cari_Drama-dc2626?style=for-the-badge&logoColor=white" alt="Search"/>
</a>

<br/><br/>

![Drama Terbaru](https://img.shields.io/badge/Drama_Terbaru-${totalLatest}+-9f1239?style=flat-square&logo=youtube&logoColor=white)
![Drama Populer](https://img.shields.io/badge/Drama_Populer-${totalPopular}+-ef4444?style=flat-square&logo=fire&logoColor=white)
![Kategori](https://img.shields.io/badge/Kategori-${totalCategories}-dc2626?style=flat-square&logo=tag&logoColor=white)

</div>

<br/>

---

<br/>

## 🎬 Drama Terbaru

<div align="center">

<table>
  <tr>
${latestCards}
  </tr>
</table>

<br/>

<a href="${WEBSITE_URL}/latest">
  <img src="https://img.shields.io/badge/📺_Lihat_Semua_Drama_Terbaru-9f1239?style=for-the-badge" alt="Lihat Semua"/>
</a>

</div>

<br/>

---

<br/>

## 🔥 Drama Populer

<div align="center">

<table>
  <tr>
${popularCards}
  </tr>
</table>

<br/>

<a href="${WEBSITE_URL}">
  <img src="https://img.shields.io/badge/🔥_Lihat_Drama_Populer-ef4444?style=for-the-badge" alt="Lihat Semua"/>
</a>

</div>

---

## 🏷️ Kategori Drama

<div align="center">

${categoryBadges}

</div>

---

## ✨ Fitur DramaChia

<div align="center">

| Fitur | Deskripsi |
|:---:|:---|
| 🆓 **100% Gratis** | Nonton semua drama tanpa biaya berlangganan |
| 📱 **Mobile Friendly** | Tampilan responsif untuk semua perangkat |
| 🇮🇩 **Subtitle Indonesia** | Semua drama dengan subtitle bahasa Indonesia |
| 🎬 **Update Cepat** | Drama terbaru update setiap hari |
| 📶 **Hemat Kuota** | Streaming dioptimasi untuk hemat data |
| 🔍 **Pencarian Mudah** | Cari drama favorit dengan mudah |

</div>

---

## 🚀 Quick Links

<div align="center">

| Link | Deskripsi |
|:---:|:---|
| 🏠 [**Home**](${WEBSITE_URL}) | Halaman utama DramaChia |
| 🎬 [**Drama Terbaru**](${WEBSITE_URL}/latest) | Drama China terbaru |
| 🇰🇷 [**Drakor**](${WEBSITE_URL}/drakor/latest) | Drama Korea terbaru |
| 🔍 [**Pencarian**](${WEBSITE_URL}/search) | Cari drama favorit |
| ❓ [**FAQ**](${WEBSITE_URL}/faq) | Pertanyaan umum |

</div>

---

<div align="center">

### Made with ❤️ by DramaChia Team

<br/>

![Astro](https://img.shields.io/badge/Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

<br/>

<sub>📅 Auto-updated: ${getCurrentDate()}</sub>

</div>
`;

    // Write README file
    const readmePath = path.join(__dirname, "..", "README.md");
    fs.writeFileSync(readmePath, readme, "utf8");

    console.log("✅ README.md generated successfully!");
    console.log(`📄 File saved to: ${readmePath}`);
  } catch (error) {
    console.error("❌ Error generating README:", error);
    process.exit(1);
  }
}

// Run the script
generateReadme();
