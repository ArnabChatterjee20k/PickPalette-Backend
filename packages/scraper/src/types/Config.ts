import { Page } from "playwright";
export type Config = {
  url: string;
  selectors: string[];
  exclude?: string[];
  include?: string[];
  maxQueries: number;
  onVisit?: (page: Page) => void;
};
