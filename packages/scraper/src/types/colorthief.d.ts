declare module "colorthief" {
   type Color = [number, number, number];
   const getColor: (img: string | null) => Color;
   const getPalette: (img: string | null) => Promise<Color[]>;
   export {getColor,getPalette}
}
