import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
puppeteer.use(StealthPlugin());

const { Pool } = pkg;

/* ================= DATABASE ================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
});

// Test DB connection
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
})();

/* ================= UTILITIES ================= */

function parseIndianExpressDate(rawDate) {
  if (!rawDate) return null;
  const cleanedDate = rawDate.replace(/ IST.*$/, "").trim();
  const parsedDate = new Date(cleanedDate);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ================= SAVE TO SUPABASE ================= */

async function saveArticle(article) {
  const { title, link, date, category, description, source } = article;

  await pool.query(
    `INSERT INTO headlines (title, link, date, category, description, source)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (link) DO NOTHING`,
    [title, link, date, category, description, source]
  );
}

/* ================= SCRAPER ================= */

async function scrapeIndianExpress(baseUrl, category, maxPages = 5) {
  console.log(`🌐 Scraping ${category} section`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
  );

  try {
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url =
        pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;

      console.log(`📄 Page ${pageNum}: ${url}`);

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // Wait for titles instead of unstable div selectors
      await page.waitForSelector("h2 a", { timeout: 20000 });

      const articles = await page.$$eval("h2 a", (links) =>
        links.map((el) => ({
          title: el.innerText.trim(),
          link: el.href,
        }))
      );

      console.log(`📰 Found ${articles.length} articles`);

      for (const item of articles) {
        try {
          if (!item.title || !item.link) continue;

          const newsData = {
            title: item.title,
            link: item.link,
            date: new Date().toISOString(),
            category,
            description: "",
            source: "Indian Express",
          };

          await saveArticle(newsData);
          console.log(`✅ Saved: ${item.title}`);

          await delay(1000);
        } catch (err) {
          console.error("⚠ Error saving article:", err.message);
        }
      }

      await delay(3000);
    }

    console.log(`🏁 Finished scraping ${category}`);
  } catch (err) {
    console.error("❌ Scraping error:", err.message);
  } finally {
    await browser.close();
  }
}

/* ================= MAIN ================= */

(async () => {
  try {
    await scrapeIndianExpress(
      "https://indianexpress.com/section/sports/",
      "Sports",
      5
      
    );

    console.log("🎉 Scraping completed");
  } catch (err) {
    console.error("❌ Fatal error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();