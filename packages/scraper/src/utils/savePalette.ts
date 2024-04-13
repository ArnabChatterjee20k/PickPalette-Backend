import axios from "axios";
import { cache } from "../cache";
import VectorDB from "../VectorDB";
const retry = require("async-retry");
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import PaletteDB from "../PaletteDB";
import generateRandomId from "./generateRandomId";
interface Options {
  title: string;
  description: string;
  palette: string[];
}
export async function savePalette(options: Options) {
  // savePaletteWithFetch(options);
  savePaletteToCache(options);
}
function savePaletteToCache(dataOptions: Options) {
  return cache.set(cache.keys().length + 1, dataOptions);
}
function savePaletteWithFetch(dataOptions: Options) {
  let options = {
    method: "POST",
    url: "http://localhost:3000/data",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
    },
    data: dataOptions,
  };

  axios
    .request(options)
    .then(function (response) {
      console.log("success");
    })
    .catch(function (error) {
      console.error(error);
    });
}

export async function saveToVectorDB() {
  const db = new VectorDB();
  const data = cache.keys();
  const index = await db.get_index();
  const upsertData = await Promise.all(
    data.map(async (key) => {
      const product: Options = cache.get(key);
      const doc = `title:${product.title} description:${product.description}`;
      const vectors = await db.generate_embeddings(doc);
      return {
        values: vectors,
        id: `${generateRandomId()}`,
        metadata: { title: product.title, palettes: product.palette },
      };
    })
  );

  index.upsert(upsertData);
}

export async function saveToPaletteDB() {
  const data = cache.keys();
  const db = new PaletteDB();
  await db.intitialise();

  const upsertData = await Promise.all(
    data.map(async (key) => {
      const product: Options = cache.get(key);
      return product.palette;
    })
  );

  db.updateDB(upsertData);
}

export async function deleteFromDB() {
  const db = new VectorDB();
  const index = await db.get_index()
  index.deleteAll()
}