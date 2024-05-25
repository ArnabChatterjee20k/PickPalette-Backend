import { ProductHuntCrawler } from "./src/core";
import { Config } from "./src/types/Config";
import getProductHuntLinkToScrape from "./src/utils/getProductHuntLinkToScrape";
import * as fs from "fs";
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
  const palettes = await saveToPaletteDB(data);
  const vectors = await saveToVectorDB(data);
  await save(data, "whole.json");
  await save(palettes, "data.json");
  await save(vectors, "vector.json");
}

run_crawler();
// @ts-ignore
async function save(data, file) {
  fs.writeFile(file, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File written successfully!");
  });
}
