import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
puppeteer.use(StealthPlugin());

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
});

async function testDB() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveArticle(article) {
  const { title, link, date, category, description, source } = article;
  try {
    await pool.query(
      `INSERT INTO headlines (title, link, date, category, description, source)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (link) DO NOTHING`,
      [title, link, date, category, description, source]
    );
  } catch (err) {
    console.error("DB insert error:", err.message);
  }
}

async function scrapeIndianExpress(baseUrl, category, maxPages = 1) {
  console.log(`🌐 Scraping ${category}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  );

  try {
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;
      console.log(`📄 Page ${pageNum}: ${url}`);

      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.waitForSelector("h2 a", { timeout: 20000 });

      const articles = await page.$$eval("h2 a", (links) =>
        links.map((el) => ({
          title: el.innerText.trim(),
          link: el.href,
        }))
      );

      console.log(`📰 Found ${articles.length} articles`);

      for (const item of articles) {
        if (!item.title || !item.link) continue;

        try {
          const articlePage = await browser.newPage();
          await articlePage.goto(item.link, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });

          const metadata = await articlePage.evaluate(() => {
            const dateMeta = document.querySelector(
              'meta[property="article:published_time"]'
            );
            const descMeta = document.querySelector('meta[name="description"]');
            return {
              publishDate: dateMeta ? dateMeta.content : null,
              description: descMeta ? descMeta.content : "",
            };
          });

          await articlePage.close();

          const publishDate = metadata.publishDate
            ? new Date(metadata.publishDate).toISOString()
            : new Date().toISOString();

          await saveArticle({
            title: item.title,
            link: item.link,
            date: publishDate,
            category,
            description: metadata.description,
            source: "Indian Express",
          });

          console.log(`✅ Saved: ${item.title}`);
        } catch (err) {
          console.log("⚠️ Article scrape error:", err.message);
        }

        await delay(1000);
      }

      await delay(3000);
    }
  } catch (err) {
    console.error("❌ Scraping error:", err.message);
  } finally {
    await browser.close();
  }

  console.log(`🏁 Finished ${category}`);
}

async function main() {
  await testDB();

  // ✅ FIXED: URLs now match their correct categories
  const sections = [
    {
      url: "https://indianexpress.com/section/business/",
      category: "Business",
    },
    {
      url: "https://indianexpress.com/section/world/",
      category: "World Affairs",
    },
    {
      url: "https://indianexpress.com/section/sports/",
      category: "Sports",
    },
  ];

  for (const section of sections) {
    await scrapeIndianExpress(section.url, section.category, 2);
  }

  await pool.end();
  console.log("🎉 All scraping completed");
}

main();