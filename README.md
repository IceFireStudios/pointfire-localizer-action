# PointFire Localizer

The PointFire Localizer is a GitHub Action which allows you to localize your SharePoint Framework (SPFx) solutions with the help of the Azure AI Translator.

## Inputs

### `api-key`

**Required** The API key for the Azure AI Translator API.

> [!NOTE]
> You can get the API key by following the instructions on the
> [get your authentication keys and endpoint](https://learn.microsoft.com/en-us/azure/ai-services/translator/create-translator-resource#get-your-authentication-keys-and-endpoint) documentation page.

### `api-region`

**Required** The region of the Azure AI Translator API.

### `api-url`

**Optional** The URL of the Azure AI Translator API. Default `"https://api.cognitive.microsofttranslator.com/"`.

### `default-locale`

**Optional** The default locale of the SPFx solution. Default `"en-us"`.

### `locales`

**Optional** The locales to localize the SPFx solution to (comma-separated). Default `""`.

> [!NOTE]
> When you don't specify any locales, it will use the locale files found in the same directory as that of the default locale file.

### `summary`

**Optional** Write to the GitHub Actions Job Summary. Default `false`.

## Example usage

```yaml
- name: PointFire Localizer
  uses: IceFireStudios/pointfire-localizer-action@v1.0.0       
  with:
    api-key: ${{ secrets.TRANSLATOR_API_KEY }}
    api-region: "westeurope"
    default-locale: "en-us"
    locales: "nl-nl,fr-fr,de-de"
    summary: true
```
