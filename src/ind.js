
// import admin from "firebase-admin";
// import puppeteer from "puppeteer";
// import moment from "moment-timezone";
// import serviceAccount from "./firebase-service-account.json" with { type: "json" };

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();
// const headlinesCollection = db.collection("headlines");

// const parseDate = (rawDate) => {
//     try {
//         // Parse date in IST timezone
//         const parsedDate = moment.tz(rawDate, "MMMM D, YYYY HH:mm", "Asia/Kolkata");
        
//         if (parsedDate.isValid()) {
//             // Convert to UTC for consistent storage
//             const utcDate = parsedDate.utc().toDate();
//             return admin.firestore.Timestamp.fromDate(utcDate);
//         } else {
//             console.error("Invalid date format:", rawDate);
//             return null;
//         }
//     } catch (error) {
//         console.error("Error parsing date:", rawDate, error);
//         return null;
//     }
// };


// const headlineExists = async (title, date) => {
//     try {
//         // Convert to same-day comparison
//         const articleDate = date.toDate();
//         const startOfDay = new Date(articleDate);
//         startOfDay.setHours(0, 0, 0, 0);
        
//         const endOfDay = new Date(articleDate);
//         endOfDay.setHours(23, 59, 59, 999);
        
//         const snapshot = await headlinesCollection
//             .where("title", "==", title)
//             .where("date", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
//             .where("date", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
//             .limit(1)
//             .get();
            
//         return !snapshot.empty;
//     } catch (error) {
//         console.error("Error checking headline existence:", error);
//         return false;
//     }
// };

// const scrapeHeadlines = async () => {
//     let browser;
//     try {
//         console.log("Launching browser...");
//         browser = await puppeteer.launch({
//             headless: "new",
//             args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         });

//         const page = await browser.newPage();
        
//         const categories = [
//             { url: "https://indianexpress.com/section/business/", name: "business" },
//             { url: "https://indianexpress.com/section/sports/", name: "sports" },
//             { url: "https://indianexpress.com/section/political", name: "politics" },
//             { url: "https://indianexpress.com/section/world/", name: "World" }
//         ];
        
//         for (const category of categories) {
//             console.log(`Navigating to Indian Express ${category.name} section...`);
//             await page.goto(category.url, {
//                 waitUntil: "networkidle2",
//                 timeout: 60000,
//             });
            
//             await page.screenshot({ path: `screenshot-${category.name}.png` });
//             console.log(`Screenshot taken for ${category.name}.`);
            
//             await new Promise(resolve => setTimeout(resolve, 3000));
            
//             const articles = await page.$$(".articles");
//             console.log(`Found ${articles.length} articles in ${category.name} section.`);
            
//             for (const article of articles) {
//                 let title, link, rawDate, date;
                
//                 try {
//                     title = await article.$eval("h2.title a", el => el.textContent.trim());
//                     link = await article.$eval("h2.title a", el => el.href);
                    
//                     try {
//                         rawDate = await article.$eval(".date", el => el.textContent.trim());
//                     } catch (e) {
//                         rawDate = moment().tz("Asia/Kolkata").format("MMMM D, YYYY HH:mm");
//                         console.log("Date not found, using current time:", rawDate);
//                     }
                    
//                     date = parseDate(rawDate);
                    
//                     console.log("Processing article:", { 
//                         title: title.substring(0, 50) + (title.length > 50 ? "..." : ""),
//                         date: date ? date.toDate().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}) : null
//                     });
                    
//                     if (title && link && date) {
//                         const exists = await headlineExists(title, date);
                        
//                         if (!exists) {
//                             const headlineDoc = {
//                                 title,
//                                 link,
//                                 date,
//                                 category: category.name,
//                                 createdAt: admin.firestore.Timestamp.now(),
//                                 source: "Indian Express"
//                             };
                            
//                             await headlinesCollection.add(headlineDoc);
//                             console.log("Inserted:", { 
//                                 title: title.substring(0, 30) + "...",
//                                 category: category.name,
//                                 date: date.toDate().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})
//                             });
//                         } else {
//                             console.log("Skipping duplicate headline:", title.substring(0, 30) + "...");
//                         }
//                     }
//                 } catch (error) {
//                     console.error("Error processing article:", error);
//                 }
                
//                 await new Promise(resolve => setTimeout(resolve, 2000));
//             }
            
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     } catch (error) {
//         console.error("Scraping failed:", error);
//     } finally {
//         if (browser) await browser.close();
//         console.log("Scraping completed. Browser closed.");
//     }
// };

// scrapeHeadlines();

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

// // Utility function to clean and parse date for The Hindu
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

// // Utility function to clean and parse date for Indian Express
// function parseIndianExpressDate(rawDate) {
//     if (!rawDate) return null;
    
//     // Remove IST and any trailing text
//     const cleanedDate = rawDate.replace(/ IST.*$/, '').trim();
//     const parsedDate = new Date(cleanedDate);
    
//     return isNaN(parsedDate.getTime()) ? null : parsedDate;
// }

// // Generic delay function
// async function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// /**
//  * Scrape The Hindu website with pagination
//  */
// async function scrapeHinduWithPagination(baseUrl, category, maxPages = 5) {
//     console.log(`🌐 Starting to scrape ${category} section from The Hindu with pagination`);
    
//     const browser = await puppeteer.launch({ 
//         headless: true,
//         defaultViewport: null,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
    
//     const page = await browser.newPage();
    
//     // Configure page settings
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
//     await page.setDefaultNavigationTimeout(60000);

//     const allScrapedData = [];
    
//     try {
//         for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
//             const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;
//             console.log(`📄 Processing page ${pageNum}/${maxPages}: ${pageUrl}`);
            
//             try {
//                 await page.goto(pageUrl, { 
//                     timeout: 60000,
//                     waitUntil: 'networkidle2' 
//                 });

//                 // Check if the page exists (The Hindu shows a 404 page for non-existent pagination)
//                 const is404 = await page.$('.error-404').catch(() => null);
//                 if (is404) {
//                     console.log(`🛑 Reached end of pagination at page ${pageNum}`);
//                     break;
//                 }

//                 // Wait for articles to load
//                 await page.waitForSelector('.element', { timeout: 15000 });

//                 // Get all articles on this page
//                 const articles = await page.$$eval(".element", (nodes) =>
//                     nodes.map((el) => {
//                         const anchor = el.querySelector("h3.title.big > a");
//                         return anchor ? {
//                             title: anchor.textContent.trim(),
//                             link: anchor.href,
//                         } : null;
//                     }).filter(Boolean)
//                 );

//                 console.log(`📰 Found ${articles.length} articles on page ${pageNum}`);
                
//                 // Process each article
//                 for (const article of articles) {
//                     const result = await scrapeHinduArticle(page, article, category);
//                     if (result) allScrapedData.push(result);
                    
//                     // Add delay between requests to be polite
//                     await delay(2000);
//                 }
                
//                 // Add delay between pages
//                 await delay(3000);
                
//             } catch (err) {
//                 console.error(`⚠ Error processing page ${pageNum}:`, err.message);
//                 // Continue to the next page even if this one fails
//             }
//         }

//         // Save all data to JSON file
//         const outputDir = path.join('./output');
//         if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

//         const filePath = path.join(outputDir, `${category.toLowerCase().replace(/\s+/g, '-')}-news.json`);
//         fs.writeFileSync(filePath, JSON.stringify(allScrapedData, null, 2));
//         console.log(`📝 Saved ${allScrapedData.length} articles to ${filePath}`);

//     } catch (err) {
//         console.error("❌ Main scraping error:", err);
//     } finally {
//         await browser.close();
//         console.log(`🏁 Completed scraping for ${category} from The Hindu`);
//     }
    
//     return allScrapedData;
// }

// // Function to scrape individual article from The Hindu
// async function scrapeHinduArticle(page, article, category) {
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
//             description,
//             source: "The Hindu"
//         };

//         // Add to Firestore
//         await collection.add({
//             ...newsData,
//             date: admin.firestore.Timestamp.fromDate(parsedDate),
//             scrapedAt: admin.firestore.FieldValue.serverTimestamp()
//         });

//         console.log(`✅ Saved: ${article.title}`);
//         return newsData;
//     } catch (err) {
//         console.error(`⚠ Error scraping article ${article.link}:`, err.message);
//         return null;
//     }
// }

// /**
//  * Scrape Indian Express website with pagination
//  */
// async function scrapeIndianExpressWithPagination(baseUrl, category, maxPages = 5) {
//     console.log(`🌐 Starting to scrape ${category} section from Indian Express with pagination`);
    
//     const browser = await puppeteer.launch({ 
//         headless: true,
//         defaultViewport: null,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
    
//     const page = await browser.newPage();
    
//     // Configure page settings
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
//     await page.setDefaultNavigationTimeout(60000);

//     const allScrapedData = [];
    
//     try {
//         for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
//             const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}/page/${pageNum}/`;
//             console.log(`📄 Processing page ${pageNum}/${maxPages}: ${pageUrl}`);
            
//             try {
//                 await page.goto(pageUrl, { 
//                     timeout: 60000,
//                     waitUntil: 'networkidle2' 
//                 });

//                 // Check if page exists (pagination often shows a 404 or empty results)
//                 const noResults = await page.$('.page-404').catch(() => null);
//                 if (noResults) {
//                     console.log(`🛑 Reached end of pagination at page ${pageNum}`);
//                     break;
//                 }

//                 // Wait for articles to load
//                 await page.waitForSelector('.articles', { timeout: 15000 });

//                 // Get all article elements
//                 const articleHandles = await page.$$('.articles');
//                 console.log(`📰 Found ${articleHandles.length} articles on page ${pageNum}`);

//                 // Process each article
//                 for (const [index, el] of articleHandles.entries()) {
//                     try {
//                         console.log(`🔍 Processing article ${index + 1}/${articleHandles.length}`);
                        
//                         // Extract article data
//                         const [title, link, rawDate, description] = await Promise.all([
//                             el.$eval('.img-context > h2.title > a', a => a.textContent.trim()).catch(() => ''),
//                             el.$eval('.img-context > h2.title > a', a => a.href).catch(() => ''),
//                             el.$eval('.date', d => d.textContent.trim()).catch(() => ''),
//                             el.$eval('.img-context > p', p => p.textContent.trim()).catch(() => '')
//                         ]);

//                         // Validate required fields
//                         if (!title || !link) {
//                             console.warn('⚠ Skipping article - missing title or link');
//                             continue;
//                         }

//                         // Parse date
//                         const parsedDate = parseIndianExpressDate(rawDate);
//                         if (!parsedDate) {
//                             console.warn(`❌ Invalid date for article: ${title}`);
//                             continue;
//                         }

//                         // Prepare data for Firestore
//                         const newsData = {
//                             title,
//                             link,
//                             date: admin.firestore.Timestamp.fromDate(parsedDate),
//                             category,
//                             description,
//                             source: "Indian Express",
//                             scrapedAt: admin.firestore.FieldValue.serverTimestamp()
//                         };

//                         // Save to Firestore
//                         await collection.add(newsData);
                        
//                         allScrapedData.push({
//                             ...newsData,
//                             date: parsedDate.toISOString()
//                         });

//                         console.log(`✅ Saved: ${title}`);

//                         // Add small delay between articles to be polite
//                         await delay(1000);

//                     } catch (error) {
//                         console.error(`⚠ Error processing article ${index + 1}:`, error.message);
//                         continue;
//                     }
//                 }
                
//                 // Add delay between pages
//                 await delay(3000);
                
//             } catch (err) {
//                 console.error(`⚠ Error processing page ${pageNum}:`, err.message);
//                 // Continue to the next page even if this one fails
//             }
//         }

//         // Save to JSON file
//         const outputDir = path.join('./output');
//         if (!fs.existsSync(outputDir)) {
//             fs.mkdirSync(outputDir, { recursive: true });
//         }

//         const filePath = path.join(outputDir, `${category.toLowerCase().replace(/\s+/g, '-')}-news.json`);
//         fs.writeFileSync(filePath, JSON.stringify(allScrapedData, null, 2));
//         console.log(`📝 Saved ${allScrapedData.length} articles to ${filePath}`);

//     } catch (err) {
//         console.error('❌ Scraping failed:', err.message);
//     } finally {
//         await browser.close();
//         console.log(`🏁 Finished scraping ${category} section from Indian Express`);
//     }
    
//     return allScrapedData;
// }

// // Main execution
// (async () => {
//     try {
//         // Configure the number of pages to scrape per section
//         const MAX_PAGES = 5; // You can adjust this number based on your needs
        
//         // Scrape The Hindu website
//         await scrapeHinduWithPagination("https://www.thehindu.com/news/international/", "World Affairs", MAX_PAGES);
//         await scrapeHinduWithPagination("https://www.thehindu.com/sci-tech/science/", "Science", MAX_PAGES);
        
//         // Scrape Indian Express website
//         await scrapeIndianExpressWithPagination('https://indianexpress.com/section/business/', 'Business', MAX_PAGES);
//         await scrapeIndianExpressWithPagination('https://indianexpress.com/section/political-pulse/', 'Politics', MAX_PAGES);
        
//         console.log('🎉 All scraping tasks completed successfully');
//     } catch (err) {
//         console.error("❌ Fatal error in main execution:", err);
//     }
// })();
