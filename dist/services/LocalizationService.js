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
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { Script } from "node:vm";
import { join, parse } from "path";
import { SpecialLocales } from "../constants/SpecialLocales.js";
import { AzureTranslator } from "../constants/AzureTranslator.js";
import { flattenObject } from "../utils/flattenObject.js";
import { unflattenObject } from "../utils/unflattenObject.js";
export class LocalizationService {
    constructor(apiKey, apiUrl, apiRegion, defaultLocale, locales, jobSummary) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.apiRegion = apiRegion;
        this.defaultLocale = defaultLocale;
        this.localeValues = locales
            .split(",")
            .map((locale) => locale.toLowerCase().trim())
            .filter((locale) => locale);
        this.jobSummary = jobSummary.toLowerCase() === "true";
    }
    /**
     * Starts the localization process.
     * This method translates the default files into different languages and creates corresponding locale files.
     * @returns A Promise that resolves when the localization process is complete.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultFiles = yield glob(`**/${this.defaultLocale}.js`, {
                ignore: ["node_modules/**"],
            });
            if (defaultFiles.length === 0) {
                throw new Error(`No default locale file found for ${defaultFiles}`);
            }
            let summary = core.summary;
            summary.addHeading("Localization Summary");
            const totalMessage = `Found ${defaultFiles.length} default locale file${defaultFiles.length > 1 ? "s" : ""}`;
            core.info(totalMessage);
            summary.addRaw(totalMessage);
            for (const defaultFile of defaultFiles) {
                const dirPath = parse(defaultFile).dir;
                let localeFiles = yield glob(`**/${dirPath}/*.js`, {
                    ignore: ["node_modules/**"],
                });
                // Exclude the default
                localeFiles = localeFiles.filter((file) => file !== defaultFile);
                let languagesToTranslate = [];
                if (this.localeValues.length > 0) {
                    languagesToTranslate = this.localeValues;
                }
                else {
                    languagesToTranslate = localeFiles.map((file) => parse(file).name);
                }
                if (languagesToTranslate.length === 0) {
                    core.info("No locales defined or found to translate");
                    return;
                }
                core.info(`Localizing based on: ${defaultFile}`);
                summary.addHeading(`Localizing based on: ${defaultFile}`, 2);
                const summaryTableRows = [];
                summaryTableRows.push([
                    {
                        data: "Locale",
                        header: true,
                    },
                    {
                        data: "Status",
                        header: true,
                    },
                ]);
                const defaultKeyValues = yield this.localeKeyvalues(defaultFile);
                for (const locale of languagesToTranslate) {
                    core.info(`- Translating ${locale}...`);
                    // Check if the file exists
                    const fileExists = localeFiles.some((file) => parse(file).name === locale);
                    // File path
                    const localeFilePath = join(dirPath, `${locale}.js`);
                    // If the file doesn't exist, we'll use all the default locale key values
                    // If the file exits, we'll only use the missing or empty key values pairs
                    let localeKeyValues = {};
                    let missingKeys = [];
                    if (fileExists) {
                        localeKeyValues = yield this.localeKeyvalues(localeFilePath);
                        missingKeys = Object.keys(defaultKeyValues).filter((key) => !localeKeyValues[key]);
                    }
                    else {
                        localeKeyValues = Object.assign({}, defaultKeyValues);
                        missingKeys = Object.keys(defaultKeyValues);
                    }
                    if (missingKeys.length === 0) {
                        core.info(`  - No missing keys found for ${locale}`);
                        summaryTableRows.push([locale, "Nothing to translate"]);
                        continue;
                    }
                    // We'll translate the missing keys
                    let translations = missingKeys.map((key) => ({
                        Text: defaultKeyValues[key],
                    }));
                    let azureFromLocale = this.getAzureLocaleCode(this.defaultLocale);
                    let azureToLocale = this.getAzureLocaleCode(locale);
                    let translatedValues = yield this.translate(translations, azureFromLocale, azureToLocale);
                    if (!translatedValues.length) {
                        core.info(`  - No translations found for ${locale}`);
                        summaryTableRows.push([locale, "No translations retrieved"]);
                        continue;
                    }
                    missingKeys.forEach((key, index) => {
                        localeKeyValues[key] = translatedValues[index];
                    });
                    const unflattenedLocaleData = unflattenObject(localeKeyValues);
                    const content = `define([], function() {
  return ${JSON.stringify(unflattenedLocaleData, null, 2)}
});`;
                    yield writeFile(localeFilePath, content);
                    core.info(`  - File ${locale}.js created`);
                    summaryTableRows.push([locale, "File has been created/updated"]);
                }
                summary.addTable(summaryTableRows);
            }
            if (this.jobSummary) {
                yield summary.write();
            }
        });
    }
    /**
     * Translates an array of strings from one language to another.
     * @param translations - The array of strings to be translated.
     * @param from - The source language code.
     * @param to - The target language code.
     * @returns A promise that resolves to an array of translated strings.
     */
    translate(translations, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiUrl || AzureTranslator.Url}${AzureTranslator.API}&from=${from}&to=${to}`, {
                    method: "POST",
                    headers: {
                        "Ocp-Apim-Subscription-Key": this.apiKey,
                        "Ocp-Apim-Subscription-Region": this.apiRegion,
                        "Content-type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(translations),
                });
                if (!response.ok) {
                    throw new Error(`Failed to translate: ${response.status} ${response.statusText || ""}`);
                }
                const data = yield response.json();
                if (!data || !data.length) {
                    throw new Error("No translations found");
                }
                const translatedKeys = data.map((t) => t.translations[0].text);
                return translatedKeys;
            }
            catch (e) {
                core.error(e.message);
                return [];
            }
        });
    }
    /**
     * Retrieves the Azure locale code for the given locale.
     * If a matching Azure locale is found, its code is returned.
     * Otherwise, the first part of the locale is returned.
     * @param locale - The locale for which to retrieve the Azure locale code.
     * @returns The Azure locale code for the given locale.
     */
    getAzureLocaleCode(locale) {
        let azureLocale = SpecialLocales.find((l) => l.code.toLowerCase() === locale.toLowerCase());
        if (azureLocale && azureLocale.azureCode) {
            return azureLocale.azureCode;
        }
        return locale.split("-")[0];
    }
    /**
     * Reads the content of a locale file and converts it into a JavaScript object.
     * @param localeFilePath - The path to the locale file.
     * @returns A Promise that resolves to the JavaScript object representing the locale file content.
     */
    localeKeyvalues(localeFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield readFile(localeFilePath, "utf8");
            let lines = content.split("\n").filter((v) => !!v);
            // remove the last two lines
            lines = lines.slice(0, -2);
            lines.push("}");
            lines = lines.map((line) => {
                const lineValue = line.trim();
                if (lineValue.startsWith("define(")) {
                    return "obj = {";
                }
                if (lineValue.startsWith("return {")) {
                    return "";
                }
                if (lineValue.startsWith("});")) {
                    return "}";
                }
                return line;
            });
            const contentModule = new Script(lines.join(`\n`)).runInNewContext();
            return flattenObject(contentModule);
        });
    }
}
//# sourceMappingURL=LocalizationService.js.map