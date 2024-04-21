import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { Logger, getLogger } from "./Logger";

export default class PaletteDB {
  private serviceAccountAuth: JWT;
  private db: GoogleSpreadsheet;
  private logger: Logger;
  constructor() {
    this.serviceAccountAuth = new JWT({
      // env var values here are copied from service account credentials generated by google
      // see "Authentication" section in docs for more info
      email: process.env.SERVICE_EMAIL,
      key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsQ6UhDvUA7OiY\neIAQyrK+zp9fRGBTqRzDnCIHzuAfDUS55FYLeRrfJZxUX5VsXVZU4KkqABenPNXk\n00/5esS5hJhH24T/2/9noIXtHYfjyiJ21kUpF5XF5ND5NA8lGFtvqEOAZgIEquZS\nRgrEZIUYSIb/9a8UAlfmtmwXffJmG41ZRQuAF/vtNqT0i93FFJiUgyA90OdftYND\nMjLD/xsa+anuwhpwxZx3OgkyDUG3t5Yx1AOY/JfLn2mHoisH8zln54+4YtH8658m\nj3qROZHSoV4i9YdZr7foZ/uqklTAbD8qn6OAMs/SXZIfz4gKeaWBuAN1XjkKlM/Z\nG4SzCsz1AgMBAAECggEADPVhvKTlZVZtANs/twOogpYEgyQfout70HM0VCYJ0gwr\neVhl6KMJlHO92NL/6JD055mm4BP1s4zuAjKrN3c2yUXiNrWawayJAAChUn8AM/CG\nuy3PMhImICbgWX7DDOVSK4oa2dPSnwtEHDhMow10vajnDuYqb3Tlq+NZKkM9MtUM\nKixhL/ExKwAxSvWB6+T4MpNQohrsSA+jk9WWf4Qpo2470Px8bANfRJAZu9l8hfxl\nKbtz5sWvcIJxJIKjiz/GJpB66tX9iNX4KBlQdT+z7a2BTY+yoQV+TgTg5Ukk+KRX\nxHG97IjB7omZxzrPH08APQoCn3EKVyJ6e0oBgby1WQKBgQDUkSakn6VvBiTkDZU3\nsaAsaCUJA5fYbSGi1D11uTfJJPts4+s1E9k8EahK0hxGf4NKa7VepHkLKASh5vzN\nYIP+9+XaSD6dQhhL4isE7BRICZv5fdLgOgaZYyYne0Zl4q4xJX8AE68dEMY4lOvV\n4HjLP9wAzJEMLIQn6eKrWjt8TwKBgQDPdluATePMI8DWB1MIdO1oWrYzMbrbEsbI\nrZ+PmcBNTwCqi3+webObE9558Ab6n7LwKwildnTlHM7uuyPbbU/KrFAlOG23IKDM\n+v7B8tHvrBNCNspd+R/b+bhHWaq9BwIOz1tL9uqX5QeZeTQqG/oFj/HWV5rr2ISu\nSBiCVKT9ewKBgDTQN5SxYa4bDbFnuopS5KQD4CfEL8cDHldRek+0jCq6uIlOe5L9\ncnzdOj4UxBez+M/VwQNZxAVElRoQxQDWGRWRTBeW2Y/C6zx3Xg7kBQn88Tbkzy8M\n27TikIlAtLX9wx/M3CgNu/VxxH4saggCtKBzJltAeE1ZBiDQmJPQYHU7AoGBAL2w\nCEWt8gSrBBwtojvvPUrW9hSk+aZo6px+M5BHEk8dVwyYc+3VuOSoLBjt4FOzRRbX\nIha30nXR+1rIfSaaMgSrvLPrflWcXapOLDUFYfJ0MT+vfSSjLgAhud5zG+utxrHn\n4h/46dJsNKCc85c08Uu4q3RBsYLG+7mmbdJstlaVAoGAPkATSWoTUpzqHTc6JDi9\nJpsWU27MZAElALEWFl3556ildgsWdxyRl6LK4Etg93RPtX+580iGuyebkPWA58C2\neFEftufhtARiiccJt0hXX0r864dxp8AFuj/qnFiVnzoCEInuAbXn8cOBe+Aisslh\nb66rdUK7rf4Tm77j7PlUYhU=\n-----END PRIVATE KEY-----\n",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.db = new GoogleSpreadsheet(
      process.env.SHEET_ID,
      this.serviceAccountAuth
    );
    this.logger = getLogger("Palettes");
  }

  async intitialise() {
    await this.db.loadInfo();
  }

  async updateDB(palettes: string[][]) {
    const filteredPalettes = palettes.filter(
      (palette) => palette !== undefined && palette.length !== 0
    );
    const isUpdated = await this.addNewPalettes(filteredPalettes);
    if (isUpdated) await this.updateSheetCounter(filteredPalettes.length);
  }

  private async addNewPalettes(palettes: string[][]) {
    const paletteSheet = this.db.sheetsByTitle.Palette;
    const logger = await this.logger;
    try {
      logger.info({ status: "Saving to palette sheet" });
      await paletteSheet.addRows(palettes);
      return true;
    } catch (error) {
      logger.error({
        status: "Error while saving to the palette sheet",
        error,
      });
      return false;
    }
  }

  private async updateSheetCounter(numberOfPalettesUpdated: number) {
    const counterSheet = this.db.sheetsByTitle.PaletteCounter;
    const row = (await counterSheet.getRows())[0];
    const count = parseInt(row.get("Count"));

    try {
      row.set("Count", count + numberOfPalettesUpdated);
      row.save();
      return true;
    } catch (error) {
      console.log({ message: "Error updating palette counter", error });
    }
  }
}
