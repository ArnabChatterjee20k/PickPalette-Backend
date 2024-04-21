import PaletteDB from "./src/PaletteDB";
import { cache } from "./src/cache";
import { ProductHuntCrawler } from "./src/core";
import { Config } from "./src/types/Config";
import getProductHuntLinkToScrape from "./src/utils/getProductHuntLinkToScrape";
import {
  deleteFromDB,
  saveToPaletteDB,
  saveToVectorDB,
} from "./src/utils/savePalette";
const config: Config = {
  maxQueries: 40,
  selectors: [],
  url: getProductHuntLinkToScrape(),
};
async function run_crawler() {
  try {
    const crawler = await new ProductHuntCrawler(config).init();
    await crawler.crawl();
    await Promise.all([saveToVectorDB(), saveToPaletteDB()]);
  } catch (error) {
    console.log(error.message);
    console.log(cache.data);
  }
}

async function getFile() {
  interface Data {
    title: string;
    description: string;
    palette: string[];
  }
  const res = await fetch("http://localhost:3000/data");
  const data: Data[] = await res.json();

  const set = new Set();
  data.forEach((d) => set.add(d.title));
  console.log(Array.from(set).length);
}
// run_crawler();
// npx ts-node index.ts
async function test() {
  const db = new PaletteDB();
  await db.intitialise();
  // await db.updateDB([["1", "2", "3", "4"]]);
}

run_crawler();