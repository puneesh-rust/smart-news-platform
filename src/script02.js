


import admin from 'firebase-admin';
import puppeteer from 'puppeteer';
import serviceAccount from "./firebaseServiceAccount.json" with { type: "json" };

// Firebase initialization step 1
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const collection = db.collection('headlines');

//  clean and parse date for Indian Express(utility)
function parseIndianExpressDate(rawDate) {
  if (!rawDate) return null;
  
  // Remove IST and any trailing text
  const cleanedDate = rawDate.replace(/ IST.*$/, '').trim();
  const parsedDate = new Date(cleanedDate);
  
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

// Generic delay function with random variation
async function delay(ms) {
  const jitter = Math.random() * 1000; // Add random delay up to 1 second
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
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

/**
 * Scrape Indian Express website with pagination
 */
async function scrapeIndianExpressWithPagination(baseUrl, category, maxPages = 5) {
  console.log(`🌐 Starting to scrape ${category} section from Indian Express with pagination`);
  
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
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      
      while (retryCount < maxRetries && !success) {
        try {
          // Indian Express pagination format
          const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;
          console.log(`📄 Processing page ${pageNum}/${maxPages}: ${pageUrl} (Attempt ${retryCount + 1})`);
          
          await page.goto(pageUrl, { 
            timeout: 60000,
            waitUntil: 'networkidle2' 
          });

          // Check if page exists (pagination often shows a 404 or empty results)
          const noResults = await page.$('.page-404, .no-results, .error-404').catch(() => null);
          if (noResults) {
            console.log(`🛑 Reached end of pagination at page ${pageNum}`);
            break;
          }

          // Try multiple selectors for articles
          const articleSelectors = [
            '.articles', // Primary selector
            '.story-card', // Alternative selector
            '.article', // Generic article selector
            '[data-testid="article-element"]' // Data attribute selector
          ];

          let articleHandles = [];
          for (const selector of articleSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 5000 });
              articleHandles = await page.$$(selector);
              if (articleHandles.length > 0) break;
            } catch (e) {
              continue;
            }
          }

          if (articleHandles.length === 0) {
            throw new Error('No articles found on page');
          }

          console.log(`📰 Found ${articleHandles.length} articles on page ${pageNum}`);
          
          // Process each article
          for (const [index, el] of articleHandles.entries()) {
            try {
              console.log(`🔍 Processing article ${index + 1}/${articleHandles.length}`);
              
              // Extract article data with multiple selector options
              const titleSelectors = [
                '.img-context > h2.title > a',
                'h2 > a',
                'h3 > a',
                'a.title'
              ];
              
              const dateSelectors = [
                '.date',
                '.published-on',
                'time',
                '[datetime]'
              ];
              
              const descSelectors = [
                '.img-context > p',
                '.synopsis',
                '.summary',
                '[itemprop="description"]'
              ];

              // Try multiple selectors for each field
              const title = await trySelectors(el, titleSelectors, 'textContent');
              const link = await trySelectors(el, titleSelectors, 'href');
              const rawDate = await trySelectors(el, dateSelectors, 'textContent');
              const description = await trySelectors(el, descSelectors, 'textContent');

              // Validate required fields
              if (!title || !link) {
                console.warn('⚠ Skipping article - missing title or link');
                continue;
              }

              // Parse date
              const parsedDate = parseIndianExpressDate(rawDate);
              if (!parsedDate) {
                console.warn(`❌ Invalid date for article: ${title}`);
                continue;
              }

              // Prepare data for Firestore
              const newsData = {
                title,
                link,
                date: parsedDate.toISOString(),
                category,
                description: description || '',
                source: "Indian Express"
              };

              // Check if article already exists
              if (await isArticleExists(newsData)) {
                console.log(`⏩ Skipping duplicate article: ${title}`);
                allScrapedData.push(newsData);
                continue;
              }

              // Save to Firestore
              await collection.add({
                ...newsData,
                date: admin.firestore.Timestamp.fromDate(parsedDate),
                scrapedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              
              allScrapedData.push(newsData);
              console.log(`✅ Saved: ${title}`);

              // Add small delay between articles to be polite
              await delay(1500);

            } catch (error) {
              console.error(`⚠ Error processing article ${index + 1}:`, error.message);
              continue;
            }
          }
          
          success = true;
          
        } catch (err) {
          retryCount++;
          console.error(`⚠ Attempt ${retryCount} failed for page ${pageNum}:`, err.message);
          if (retryCount < maxRetries) {
            await delay(5000); // Wait before retry
          } else {
            console.error(`❌ All retries failed for page ${pageNum}`);
          }
        }
      }
      
      // Add delay between pages
      await delay(4000);
    }

    console.log(`🏁 Finished scraping ${category} section from Indian Express`);
  } catch (err) {
    console.error('❌ Scraping failed:', err.message);
  } finally {
    await browser.close();
  }
  
  return allScrapedData;
}

// Helper function to try multiple selectors
async function trySelectors(element, selectors, attribute) {
  for (const selector of selectors) {
    try {
      const result = await element.$eval(selector, (el, attr) => {
        return attr === 'href' ? el.href : el.textContent.trim();
      }, attribute);
      if (result) return result;
    } catch (e) {
      continue;
    }
  }
  return null;
}

// Main execution with better error handling
// Main execution with better error handling
(async () => {
  try {
    const MAX_PAGES = 10;
    const sections = [
      {
        url: 'https://indianexpress.com/section/business/',
        category: 'Business'
      },
      // {
      //   url: 'https://indianexpress.com/section/political-pulse/',
      //   category: 'Politics'
      // }
    ];
    
    // Process each section separately with individual error handling
    for (const section of sections) {
      try {
        console.log(`\n=== Starting ${section.category} Section ===`);
        await scrapeIndianExpressWithPagination(
          section.url, 
          section.category, 
          MAX_PAGES
        );
      } catch (err) {
        console.error(`❌ Error scraping ${section.category} section:`, err);
        // Continue with next section even if one fails
        continue;
      }
    }
    
    console.log('\n🎉 All scraping tasks completed');
  } catch (err) {
    console.error("❌ Fatal error in main execution:", err);
    process.exit(1);
  }
})();