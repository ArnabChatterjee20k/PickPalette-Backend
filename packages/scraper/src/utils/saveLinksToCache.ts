import { cache } from "../cache";
import { getDate } from "./getProductHuntLinkToScrape";

export default function saveLinksToCache(links: string[]) {
  const date = getDate();
  cache.set(date, links);
}
