import axios from "axios";
import { cache } from "../cache";
import VectorDB from "../VectorDB";
import PaletteDB from "../PaletteDB";
import generateRandomId from "./generateRandomId";
import { classifySentiment } from "./classifySentiment";

interface Options {
  title: string;
  description: string;
  palette: string[];
}

export function savePaletteToCache(dataOptions: Options) {
  return cache.set(cache.keys().length + 1, dataOptions);
}

export async function saveToVectorDB(cache?: Cache) {
  console.log("Started building vectors");
  const db = new VectorDB();
  const data = cache || (await getCachedPalettesInfo());
  const index = await db.get_index();
  const upsertData = await Promise.all(
    data.map(async (cachedProduct) => {
      const { title, description, palette, positive, negative, neutral } =
        cachedProduct;
      const docForEmbedding = `title:${title} description:${description} positive:${positive} negative:${negative} neutral:${neutral}`;
      const vectors = await db.generate_embeddings(docForEmbedding);
      return {
        values: vectors,
        id: `${generateRandomId()}`,
        metadata: { title: title, palettes: palette },
      };
    })
  );
  index.upsert(upsertData);
  return upsertData;
}

type Cache = {
  title: string;
  description: string;
  palette: string[];
  positive: number;
  negative: number;
  neutral: number;
}[];

export async function saveToPaletteDB(cache?: Cache) {
  const data = cache || (await getCachedPalettesInfo());
  const db = new PaletteDB();
  await db.intitialise();

  const upsertData = data.map((cachedPalette) => {
    const { palette } = cachedPalette;
    return palette;
  });

  db.updateDB(upsertData);
  return upsertData;
}

export async function getCachedPalettesInfo() {
  const cacheData = cache.keys();
  const palettesInfo = await Promise.all(
    cacheData.map(async (key) => {
      const { description, title, palette }: Options = cache.get(key);
      try {
        const { positive, negative, neutral } = await classifySentiment(
          `title:${title} description:${description}`
        );
        return { title, description, palette, positive, negative, neutral };
      } catch {
        return {
          title,
          description,
          palette,
          positive: null,
          negative: null,
          neutral: null,
        };
      }
    })
  );
  return palettesInfo;
}
export async function deleteFromDB() {
  const db = new VectorDB();
  const index = await db.get_index();
  index.deleteAll();
}
