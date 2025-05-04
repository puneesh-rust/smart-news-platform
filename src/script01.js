
// import admin from "firebase-admin";
// import puppeteer from 'puppeteer';
// import serviceAccount from "./firebase-service-account.json" with { type: "json" };
// import fs from "fs";
// import path from "path";

// // Initialize Firebase
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();
// const collection = db.collection('headlines');

// // Utility function to clean and parse date
// function parseHinduDate(rawDateText) {
//     if (!rawDateText) return null;
    
//     // Clean the date string
//     const cleanedDate = rawDateText
//         .replace(/^[-\s]*(Published|Updated)?[-\s]*/i, "")
//         .replace(/\s*IST\s*.*$/, "")
//         .trim();
    
//     const parsedDate = new Date(cleanedDate);
//     return isNaN(parsedDate.getTime()) ? null : parsedDate;
// }

// async function scrapeSection(page, url, category) {
//     console.log(`🌐 Scraping ${category} section from ${url}`);
    
//     try {
//         await page.goto(url, { 
//             timeout: 60000,
//             waitUntil: 'networkidle2' 
//         });

//         await page.waitForSelector('.element', { timeout: 15000 });

//         const articles = await page.$$eval(".element", (nodes) =>
//             nodes.map((el) => {
//                 const anchor = el.querySelector("h3.title.big > a");
//                 return anchor ? {
//                     title: anchor.textContent.trim(),
//                     link: anchor.href,
//                 } : null;
//             }).filter(Boolean)
//         );

//         console.log(`📰 Found ${articles.length} articles in ${category} section`);
//         return articles;
//     } catch (err) {
//         console.error(`⚠ Error scraping ${category} section:`, err.message);
//         return [];
//     }
// }

// async function scrapeArticle(page, article, category) {
//     try {
//         await page.goto(article.link, { 
//             timeout: 60000,
//             waitUntil: 'domcontentloaded' 
//         });

//         await page.waitForSelector('h1.title', { timeout: 10000 });

//         const [description, rawDateText] = await Promise.all([
//             page.$eval("h2.sub-title", el => el.textContent.trim()).catch(() => ""),
//             page.$eval(".publish-time-new span, .updated-time span", el => el.textContent.trim()).catch(() => "")
//         ]);

//         const parsedDate = parseHinduDate(rawDateText);
//         if (!parsedDate) {
//             console.warn(`❌ Invalid date for article: ${article.title}`);
//             return null;
//         }

//         const newsData = {
//             title: article.title,
//             link: article.link,
//             date: parsedDate.toISOString(),
//             category,
//             description
//         };

//         // Add to Firestore
//         await collection.add({
//             ...newsData,
//             date: admin.firestore.Timestamp.fromDate(parsedDate)
//         });

//         console.log(`✅ Saved: ${article.title}`);
//         return newsData;
//     } catch (err) {
//         console.error(`⚠ Error scraping article ${article.link}:`, err.message);
//         return null;
//     }
// }

// async function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function scrapeHinduSection(url, category) {
//     const browser = await puppeteer.launch({ 
//         headless: true,
//         defaultViewport: null,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
    
//     const page = await browser.newPage();
    
//     // Configure page settings
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
//     await page.setDefaultNavigationTimeout(60000);

//     try {
//         const articles = await scrapeSection(page, url, category);
//         const scrapedData = [];

//         for (const article of articles) {
//             const result = await scrapeArticle(page, article, category);
//             if (result) scrapedData.push(result);
            
//             // Add delay between requests using traditional setTimeout
//             await delay(2000); // 2 second delay
//         }

//         // Save to JSON file
//         const outputDir = path.join('./output');
//         if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

//         const filePath = path.join(outputDir, `${category.toLowerCase().replace(/\s+/g, '-')}-news.json`);
//         fs.writeFileSync(filePath, JSON.stringify(scrapedData, null, 2));
//         console.log(`📝 Saved ${scrapedData.length} articles to ${filePath}`);

//     } catch (err) {
//         console.error("❌ Main scraping error:", err);
//     } finally {
//         await browser.close();
//         console.log(`🏁 Completed scraping for ${category}`);
//     }
// }

// (async () => {
//     try {
//         await scrapeHinduSection("https://www.thehindu.com/news/international/", "World Affairs");
//         await scrapeHinduSection("https://www.thehindu.com/sci-tech/science/", "Science");
//     } catch (err) {
//         console.error("❌ Fatal error in main execution:", err);
//     }
// })();



import admin from "firebase-admin";
import puppeteer from 'puppeteer';
import serviceAccount from "./firebase-service-account 02.json" with { type: "json" };
import fs from "fs";
import path from "path";

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const collection = db.collection('headlines');

// Utility function to clean and parse date for The Hindu
function parseHinduDate(rawDateText) {
    if (!rawDateText) return null;
    
    // Clean the date string
    const cleanedDate = rawDateText
        .replace(/^[-\s]*(Published|Updated)?[-\s]*/i, "")
        .replace(/\s*IST\s*.*$/, "")
        .trim();
    
    const parsedDate = new Date(cleanedDate);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

// Generic delay function
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to check if article already exists in Firestore
async function isArticleExists(article) {
    try {
        // Check by title
        const titleQuery = await collection
            .where('title', '==', article.title)
            .limit(1)
            .get();
        
        if (!titleQuery.empty) return true;
        
        // Check by link
        const linkQuery = await collection
            .where('link', '==', article.link)
            .limit(1)
            .get();
            
        return !linkQuery.empty;
    } catch (err) {
        console.error('Error checking for duplicates:', err);
        // If there's an error checking, we'll assume it doesn't exist to avoid missing articles
        return false;
    }
}

// Function to scrape individual article from The Hindu
async function scrapeHinduArticle(page, article, category) {
    try {
        await page.goto(article.link, { 
            timeout: 60000,
            waitUntil: 'domcontentloaded' 
        });

        // Wait for either the title or a timeout
        await Promise.race([
            page.waitForSelector('h1.title', { timeout: 10000 }),
            page.waitForSelector('h1', { timeout: 10000 }) // Fallback selector
        ]);

        const [description, rawDateText] = await Promise.all([
            page.$eval("h2.sub-title, .sub-headline, [itemprop='description']", el => el.textContent.trim()).catch(() => ""),
            page.$eval(".publish-time-new span, .updated-time span, time, [datetime]", el => {
                return el.textContent.trim() || el.getAttribute('datetime') || '';
            }).catch(() => "")
        ]);

        const parsedDate = parseHinduDate(rawDateText);
        if (!parsedDate) {
            console.warn(`❌ Invalid date for article: ${article.title}`);
            return null;
        }
        
        const newsData = {
            title: article.title,
            link: article.link,
            date: parsedDate.toISOString(),
            category,
            description,
            source: "The Hindu"
        };
        
        // Check if article already exists
        if (await isArticleExists(newsData)) {
            console.log(`⏩ Skipping duplicate article: ${article.title}`);
            return null;
        }

        // Add to Firestore
        await collection.add({
            ...newsData,
            date: admin.firestore.Timestamp.fromDate(parsedDate),
            scrapedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Saved: ${article.title}`);
        return newsData;
    } catch (err) {
        console.error(`⚠ Error scraping article ${article.link}:`, err.message);
        return null;
    }
}

/**
 * Scrape The Hindu website with pagination
 */
async function scrapeHinduWithPagination(baseUrl, category, maxPages = 5) {
    console.log(`🌐 Starting to scrape ${category} section from The Hindu with pagination`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    });
    
    const page = await browser.newPage();
    
    // Configure page settings
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setDefaultNavigationTimeout(60000);
    await page.setJavaScriptEnabled(true);
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });

    const allScrapedData = [];
    
    try {
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;
            console.log(`📄 Processing page ${pageNum}/${maxPages}: ${pageUrl}`);
            
            let retryCount = 0;
            const maxRetries = 3;
            let success = false;

            while (retryCount < maxRetries && !success) {
                try {
                    await page.goto(pageUrl, { 
                        timeout: 60000,
                        waitUntil: 'networkidle2' 
                    });

                    // Check if the page exists
                    const is404 = await page.$('.error-404, .page-not-found').catch(() => null);
                    if (is404) {
                        console.log(`🛑 Reached end of pagination at page ${pageNum}`);
                        break;
                    }

                    // Try multiple selectors for articles
                    const selectorsToTry = [
                        '.element',
                        '.story-card',
                        '.article',
                        '[data-testid="article-element"]',
                        'div[itemprop="articleBody"]',
                        'section.story'
                    ];

                    let articles = [];
                    for (const selector of selectorsToTry) {
                        try {
                            await page.waitForSelector(selector, { timeout: 5000 });
                            articles = await page.$$eval(selector, (nodes) =>
                                nodes.map((el) => {
                                    const anchor = el.querySelector("h3.title.big > a, h2 > a, h3 > a, a.title");
                                    return anchor ? {
                                        title: anchor.textContent.trim(),
                                        link: anchor.href,
                                    } : null;
                                }).filter(Boolean)
                            );
                            if (articles.length > 0) break;
                        } catch (e) {
                            continue;
                        }
                    }

                    if (articles.length === 0) {
                        console.log(`⚠ No articles found on page ${pageNum} with any selector`);
                        // Take screenshot for debugging
                        await page.screenshot({ path: `debug-page-${pageNum}.png` });
                        throw new Error('No articles found');
                    }

                    console.log(`📰 Found ${articles.length} articles on page ${pageNum}`);
                    
                    // Process each article
                    for (const article of articles) {
                        const result = await scrapeHinduArticle(page, article, category);
                        if (result) allScrapedData.push(result);
                        
                        // Add delay between requests to be polite
                        await delay(2000 + Math.random() * 1000); // Random delay between 2-3 seconds
                    }
                    
                    success = true;
                    
                } catch (err) {
                    retryCount++;
                    console.error(`⚠ Attempt ${retryCount} failed for page ${pageNum}:`, err.message);
                    if (retryCount < maxRetries) {
                        await delay(5000); // Wait 5 seconds before retry
                    } else {
                        console.error(`❌ All retries failed for page ${pageNum}`);
                    }
                }
            }
            
            // Add delay between pages
            await delay(3000 + Math.random() * 2000); // Random delay between 3-5 seconds
        }

        // Save all data to JSON file
        const outputDir = path.join('./output');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const filePath = path.join(outputDir, `${category.toLowerCase().replace(/\s+/g, '-')}-news.json`);
        fs.writeFileSync(filePath, JSON.stringify(allScrapedData, null, 2));
        console.log(`📝 Saved ${allScrapedData.length} articles to ${filePath}`);

    } catch (err) {
        console.error("❌ Main scraping error:", err);
    } finally {
        await browser.close();
        console.log(`🏁 Completed scraping for ${category} from The Hindu`);
    }
    
    return allScrapedData;
}

// Main execution
(async () => {
    try {
        // Configure the number of pages to scrape per section
        const MAX_PAGES = 5;
        
        // Scrape The Hindu website with error handling for each section
        try {
            await scrapeHinduWithPagination("https://www.thehindu.com/news/international/", "World Affairs", MAX_PAGES);
        } catch (err) {
            console.error("❌ Error scraping World Affairs:", err);
        }
        
        try {
            await scrapeHinduWithPagination("https://www.thehindu.com/sci-tech/science/", "Science", MAX_PAGES);
        } catch (err) {
            console.error("❌ Error scraping Science:", err);
        }
        
        console.log('🎉 All scraping tasks completed');
    } catch (err) {
        console.error("❌ Fatal error in main execution:", err);
    }
})();