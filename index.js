import { readFileSync } from 'fs'
import { create } from 'xmlbuilder2'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv)).argv
const config = {
  hideWarnings: argv.hideWarnings ? !!argv.hideWarnings : false,
  inputPath: argv.inputPath || null,
}

if (argv.info) {
  console.log(config)
  process.exit()
}

if (!config.inputPath) {
  console.error('Input path is missing and is a required argument')
  process.exit(1)
}

let themeCheckRawData
try {
  const fileData = readFileSync(config.inputPath)
  themeCheckRawData = JSON.parse(fileData)
} catch (e) {
  console.error(
    `There was a problem reading and parsing the Theme Check results input file \r\n ${e}`,
  )
  process.exit(1)
}

const parseFailedCase = (testCase, source) => {
  const { check, severity, message, start_row, start_column } = testCase

  return {
    '@name': check,
    failure: {
      '@type': severity,
      '@message': message,
      '#text': `On line ${start_row}, column ${start_column} in ${source}`,
    },
  }
}

const parseSuite = ({ path, offenses }) => {
  let testSuiteCases = offenses
  if (config.hideWarnings) {
    testSuiteCases = offenses.filter(({ severity }) => severity === 'error')
  }

  const failuresCount = testSuiteCases.length
  const testCases =
    failuresCount > 0 ?
      testSuiteCases.map((testCase) => parseFailedCase(testCase, path))
    : { '@name': 'themeCheck.passed' }

  return {
    testsuite: {
      '@name': path,
      '@package': 'shopify.themeCheck',
      '@failures': failuresCount,
      '@errors': failuresCount,
      '@tests': failuresCount || '1',
      testcase: testCases,
    },
  }
}

const xml = create({ encoding: 'utf-8', version: '1.0' }).ele('testsuites')

const testSuites = themeCheckRawData.map((testSuite) => parseSuite(testSuite))

testSuites.length > 0 ? xml.ele(testSuites) : null

console.log(xml.end({ prettyPrint: true }))
