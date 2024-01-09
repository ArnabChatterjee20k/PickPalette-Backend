import { getPalette } from "colorthief";
import { rgbToHex } from "./getRGB";

async function generatePalettes(imagePath:string) {
  const image = await getPalette(imagePath);
  const colorMatrix = image.map(([r, g, b]) => rgbToHex(r, g, b));
  return colorMatrix
}