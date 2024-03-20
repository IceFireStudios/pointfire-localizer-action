var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as core from "@actions/core";
import { LocalizationService } from "./services/LocalizationService";
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Required inputs
            const apiKey = core.getInput("api-key", { trimWhitespace: true });
            const apiRegion = core.getInput("api-region", {
                trimWhitespace: true,
            });
            // Optional inputs
            const apiUrl = core.getInput("api-url", { trimWhitespace: true });
            const defaultLocale = core.getInput("default-locale", { trimWhitespace: true }) || "en-us";
            const locales = core.getInput("locales", { trimWhitespace: true }) || "";
            const jobSummary = core.getInput("summary", { trimWhitespace: true }) || "false";
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
            const localeService = new LocalizationService(apiKey, apiUrl, apiRegion, defaultLocale, locales, jobSummary);
            yield localeService.start();
        }
        catch (error) {
            // Fail the workflow run if an error occurs
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
    });
}
run();
//# sourceMappingURL=index.js.map