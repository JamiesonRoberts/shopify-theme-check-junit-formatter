# Shopify Theme Check JUnit Formatter

The purpose of this is to consume the JSON output of Shopify's Theme Check CLI tools and then convert and format it into a JUnit XML format that can be consumed by something like Gitlab tests and jobs.

**Note:** Shopify's CLI tools simply output the details to the terminal/console. Until they make their CLI tools extensible, this will require creating files in your CI step.

## Basic Usage

For up-to-date Shopify Theme Check information, visit: https://shopify.dev/docs/themes/tools/theme-check/commands

### Draft usage - to be finalized with v1

`shopify theme check --output json > themeCheckResults.json && shopify-theme-check-junit-formatter --inputPath themeCheckResults.json > themeCheck_junit.xml`
