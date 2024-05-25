import { getLogger } from "./src/Logger";
import { ProductHuntCrawler } from "./src/core";
import { Config } from "./src/types/Config";
import getProductHuntLinkToScrape from "./src/utils/getProductHuntLinkToScrape";
import {
  deleteFromDB,
  saveToPaletteDB,
  saveToVectorDB,
  getCachedPalettesInfo,
} from "./src/utils/savePalette";
const config: Config = {
  maxQueries: 40,
  selectors: [],
  url: getProductHuntLinkToScrape(),
};
async function run_crawler() {
  const crawler = await new ProductHuntCrawler(config).init();
  const errors = await crawler.crawl();
  if (errors.length) console.log(errors);
  const data = await getCachedPalettesInfo();
  await Promise.all([await saveToPaletteDB(data),await saveToVectorDB(data)])
  const logger = await getLogger("Products");
  logger.info(data);
}

run_crawler();