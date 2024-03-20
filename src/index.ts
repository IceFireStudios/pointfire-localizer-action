import * as core from "@actions/core";
import { LocalizationService } from "./services/LocalizationService";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run(): Promise<void> {
  try {
    // Required inputs
    const apiKey: string = core.getInput("api-key", { trimWhitespace: true });
    const apiRegion: string = core.getInput("api-region", {
      trimWhitespace: true,
    });

    // Optional inputs
    const apiUrl: string = core.getInput("api-url", { trimWhitespace: true });
    const defaultLocale: string =
      core.getInput("default-locale", { trimWhitespace: true }) || "en-us";
    const locales = core.getInput("locales", { trimWhitespace: true }) || "";
    const jobSummary =
      core.getInput("summary", { trimWhitespace: true }) || "false";

    if (!apiKey) {
      throw new Error("The api-key input is required");
    }

    if (!apiRegion) {
      throw new Error("The api-region input is required");
    }

    if (!defaultLocale) {
      throw new Error("The default-locale input is not provided");
    }

    // If there are locale values, we'll use those to retrieve and update the locale files
    // If there are no locale values, we'll use the files found in the same folder as the default locale file
    const localeService = new LocalizationService(
      apiKey,
      apiUrl,
      apiRegion,
      defaultLocale,
      locales,
      jobSummary
    );
    await localeService.start();
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
