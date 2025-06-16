import admin from "firebase-admin";
import puppeteer from 'puppeteer';
import serviceAccount from "./firebaseServiceAccount.json" with { type: "json" };

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const collection = db.collection('headlines');

// Utility function to clean and parse date for The Hindu
function parseHinduDate(rawDateText) {
    if (!rawDateText) return null;
    
    const cleanedDate = rawDateText
        .replace(/^[-\s]*(Published|Updated)?[-\s]*/i, "")
        .replace(/\s*IST\s*.*$/, "")
        .trim();
    
    const parsedDate = new Date(cleanedDate);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

// Enhanced delay function with exponential backoff
async function delay(ms, attempt = 1) {
    const jitter = Math.random() * 3000;
    const backoff = Math.pow(2, attempt) * 1000;
    const totalDelay = ms + jitter + backoff;
    console.log(`⏳ Waiting ${Math.round(totalDelay/1000)} seconds...`);
    return new Promise(resolve => setTimeout(resolve, totalDelay));
}

// Improved article existence check
async function isArticleExists(article) {
    try {
        const querySnapshot = await collection
            .where('link', '==', article.link)
            .limit(1)
            .get();
        return !querySnapshot.empty;
    } catch (err) {
        console.error('Error checking for duplicates:', err);
        return false;
    }
}

// Request interception setup/cleanup
async function setupRequestInterception(page) {
    await page.setRequestInterception(true);
    
    const requestHandler = async (request) => {
        try {
            if (['image', 'stylesheet', 'font', 'media', 'script'].includes(request.resourceType())) {
                await request.abort();
            } else {
                await request.continue();
            }
        } catch (err) {
            if (!err.message.includes('already handled') && !err.message.includes('Interception is not enabled')) {
                console.log('Request error:', err.message);
            }
        }
    };
    
    page.on('request', requestHandler);
    return requestHandler;
}

async function cleanupRequestInterception(page, requestHandler) {
    if (requestHandler) {
        page.off('request', requestHandler);
    }
    await page.setRequestInterception(false).catch(() => {});
}

// Robust article scraping with proper request handling
async function scrapeHinduArticle(page, article, category) {
    const MAX_ATTEMPTS = 3;
    let attempt = 0;
    let requestHandler;
    
    while (attempt < MAX_ATTEMPTS) {
        try {
            console.log(`📄 Scraping article (attempt ${attempt + 1}): ${article.title}`);
            
            // Clear cookies and cache
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
            });

            // Setup request interception
            requestHandler = await setupRequestInterception(page);

            console.log(`🌐 Loading URL: ${article.link}`);
            const response = await page.goto(article.link, { 
                timeout: 120000,
                waitUntil: ['domcontentloaded', 'networkidle2']
            });
            
            console.log(`Status: ${response?.status()}`);
            if (!response || !response.ok()) {
                throw new Error(`HTTP ${response?.status() || 'no response'} for ${article.link}`);
            }

            // Check for paywalls
            const isPaywalled = await page.$('.paywall, .subscription-required, .premium-block').catch(() => false);
            if (isPaywalled) {
                console.log('🔒 Article is paywalled, skipping');
                return null;
            }

            // Wait for content with multiple fallbacks
            await Promise.race([
                page.waitForSelector('article', { timeout: 15000 }).catch(() => {}),
                page.waitForSelector('.articlebodycontent', { timeout: 15000 }).catch(() => {}),
                page.waitForSelector('[itemprop="articleBody"]', { timeout: 15000 }).catch(() => {}),
                page.waitForSelector('.articlepage', { timeout: 15000 }).catch(() => {}),
                page.waitForSelector('.content-body', { timeout: 15000 }).catch(() => {}),
                page.waitForSelector('h1.title', { timeout: 15000 }).catch(() => {}),
                delay(5000)
            ]);

            // Extract data with comprehensive fallbacks
            const title = await page.evaluate(() => {
                return document.querySelector('h1.title, h1.headline, [itemprop="headline"]')?.textContent.trim() || 
                       document.title.replace(' - The Hindu', '');
            });

            const description = await page.evaluate(() => {
                return document.querySelector('h2.sub-title, .sub-headline, [itemprop="description"]')?.textContent.trim() ||
                       document.querySelector('meta[property="og:description"]')?.content ||
                       document.querySelector('meta[name="description"]')?.content ||
                       '';
            });

            const rawDateText = await page.evaluate(() => {
                return document.querySelector(".publish-time-new span, .updated-time span")?.textContent.trim() ||
                       document.querySelector("time[datetime], [datetime]")?.getAttribute('datetime') ||
                       document.querySelector(".date")?.textContent.trim() ||
                       '';
            });

            const parsedDate = parseHinduDate(rawDateText);
            if (!parsedDate) {
                console.warn(`❌ Invalid date for article: ${title}`);
                return null;
            }
            
            const newsData = {
                title,
                link: article.link,
                date: parsedDate.toISOString(),
                category,
                description,
                source: "The Hindu"
            };
            
            if (await isArticleExists(newsData)) {
                console.log(`⏩ Skipping duplicate article: ${title}`);
                return null;
            }

            // Save to Firestore
            await collection.add({
                ...newsData,
                date: admin.firestore.Timestamp.fromDate(parsedDate),
                scrapedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✅ Saved: ${title}`);
            return newsData;
            
        } catch (err) {
            attempt++;
            console.error(`⚠ Attempt ${attempt} failed for article ${article.title}:`, err.message);
            
            if (attempt >= MAX_ATTEMPTS) {
                console.error(`❌ All attempts failed for article: ${article.title}`);
                return null;
            }
            
            await delay(5000, attempt);
        } finally {
            await cleanupRequestInterception(page, requestHandler);
        }
    }
}

// Main scraping function with enhanced reliability
async function scrapeHinduWithPagination(baseUrl, category, maxPages = 5) {
    console.log(`🌐 Starting to scrape ${category} section from The Hindu`);
    
    const browser = await puppeteer.launch({ 
        headless: "new",
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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setDefaultNavigationTimeout(150000);

    try {
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;
            console.log(`\n📄 Processing page ${pageNum}/${maxPages}: ${pageUrl}`);
            
            let retryCount = 0;
            const maxRetries = 3;
            let success = false;
            let requestHandler;

            while (retryCount < maxRetries && !success) {
                try {
                    // Clear cookies and cache
                    const client = await page.target().createCDPSession();
                    await client.send('Network.clearBrowserCookies');
                    await client.send('Network.clearBrowserCache');
                    
                    // Setup request interception
                    requestHandler = await setupRequestInterception(page);

                    const response = await page.goto(pageUrl, { 
                        timeout: 120000,
                        waitUntil: 'networkidle2' 
                    });

                    // Check for 404 or empty results
                    const is404 = await page.$('.error-404, .page-not-found, .no-results').catch(() => null);
                    if (is404) {
                        console.log(`🛑 Reached end of pagination at page ${pageNum}`);
                        break;
                    }

                    // Find articles with robust selectors
                    const articles = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll(
                            'article.story, .story-card, .element, [data-testid="article-element"], .story'
                        )).map(el => {
                            const anchor = el.querySelector("h3 a, h2 a, h1 a, a.title, .story-link");
                            if (!anchor) return null;
                            
                            const title = anchor.textContent.trim();
                            let link = anchor.href;
                            
                            // Ensure absolute URLs
                            if (!link.startsWith('http')) {
                                link = `https://www.thehindu.com${link.startsWith('/') ? '' : '/'}${link}`;
                            }
                            
                            return { title, link };
                        }).filter(Boolean);
                    });

                    if (articles.length === 0) {
                        console.log(`⚠ No articles found on page ${pageNum}`);
                        throw new Error('No articles found');
                    }

                    console.log(`📰 Found ${articles.length} articles`);
                    
                    // Process articles with error isolation
                    for (const article of articles) {
                        try {
                            await scrapeHinduArticle(page, article, category);
                            await delay(3000);
                        } catch (err) {
                            console.error(`⚠ Error processing article, continuing to next:`, err.message);
                            continue;
                        }
                    }
                    
                    success = true;
                    
                } catch (err) {
                    retryCount++;
                    console.error(`⚠ Page attempt ${retryCount} failed:`, err.message);
                    
                    if (retryCount < maxRetries) {
                        await delay(10000, retryCount);
                    }
                } finally {
                    await cleanupRequestInterception(page, requestHandler);
                }
            }
            
            await delay(5000);
        }

        console.log(`\n🏁 Completed scraping for ${category} from The Hindu`);

    } catch (err) {
        console.error("\n❌ Fatal scraping error:", err);
    } finally {
        // Final cleanup
        try {
            await page.close();
            await browser.close();
        } catch (cleanupErr) {
            console.error("Error during cleanup:", cleanupErr);
        }
    }
}

// Main execution
(async () => {
    try {
        const MAX_PAGES = 5;
        const sections = [
            {
                url: "https://www.thehindu.com/news/international/",
                category: "World Affairs"
            },
            // {
            //     url: "https://www.thehindu.com/sci-tech/science/",
            //     category: "Science"
            // }
        ];
        
        console.log("🚀 Starting The Hindu scraper");
        
        for (const section of sections) {
            try {
                console.log(`\n=== Starting ${section.category} Section ===`);
                await scrapeHinduWithPagination(section.url, section.category, MAX_PAGES);
            } catch (err) {
                console.error(`\n❌ Section ${section.category} failed:`, err);
                continue;
            }
        }
        
        console.log('\n🎉 All scraping tasks completed successfully');
        process.exit(0);
    } catch (err) {
        console.error("\n❌ Fatal error in main execution:", err);
        process.exit(1);
    }
})();