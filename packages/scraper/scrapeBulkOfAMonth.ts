import { getLogger } from "./src/Logger";
import { cache } from "./src/cache";
import { ProductHuntCrawler } from "./src/core";
import getProductHuntLinkToScrapeOfAMonth from "./src/utils/getProductHuntLinkToScrapeOfAMonth";
import { saveToPaletteDB, saveToVectorDB } from "./src/utils/savePalette";
const links = getProductHuntLinkToScrapeOfAMonth(2024, 2).slice(0,13);
async function run_crawler() {
    const config = {
      maxQueries: 40,
      selectors: [],
    };
  
    const chunkSize = 5; // Limiting to 5 processes at a time
  
    // Split the links into chunks
    const linkChunks = [];
    for (let i = 0; i < links.length; i += chunkSize) {
      linkChunks.push(links.slice(i, i + chunkSize));
    }
  
    // Process each chunk of links concurrently
    await Promise.all(
      linkChunks.map(async (chunk) => {
        for (const link of chunk) {
          try {
            const crawler = await new ProductHuntCrawler({
              ...config,
              url: link,
            }).init();
            await crawler.crawl();
            await Promise.all([saveToPaletteDB(),saveToVectorDB()]) // Assuming saveToVectorDB returns a promise
          } catch (error) {
            console.log({ error, link });
            const logger = await getLogger("save");
            logger.error({
              error: error.message,
              cache: cache.keys().map((key) => {
                const product = cache.get(key);
                return product;
              }),
            });
          }
          // Delay between each crawl
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      })
    );
    // delay between each 5 set
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  
  run_crawler();

run_crawler();
