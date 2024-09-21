# FlexiMatch: Fuzzy Matching Based on Multiple Criteria

FlexiMatch is a flexible and powerful fuzzy matching algorithm that allows for approximate matching on multiple criteria across multiple longitudinal datasets.
Designed to handle data with inconsistencies, typos, and minor variations, FlexiMatch ensures that near matches are found even when exact matches are not possible.

## Key Features

- Fuzzy matching: Supports non-exact string matches powered by Levenshtein distance or simple error rate
- Multiple criteria support: Match records based on several fields/attributes at once (e.g., names, age, IDs)
- Fully customizable, e.g. set a matching tolerance threshold to fine-tune the strictness of your fuzzy matching
- Highly scalable: Suitable for both small datasets and large-scale CSV files
- Matching across multiple, independently configurable cycles
- Detailed, customizable statistics to document what was matched
- Documentation of high-confidence mismatches to avoid matching errors and fine-tune configs

## Use Cases
- Record linking across datasets
- Handling variations in input data, such as typos or formatting differences
- Data deduplication

## Setup

- Install dependencies via yarn (`yarn`) or npm (`npm i`)
- Copy _sample.env_ and rename it to _.env_, then configure DATA_LOCATION
- Customize the declarative dataset and feature configurations as shown below

### Adding a new dataset

- Save the input CSV in UTF-8 in DATA_LOCATION/data
- Add the dataset definition and normalization steps to _datasets.mjs_
- Configure features:
```js
{
  feature: 'UniqueFeatureName',
  columnName: 'InputColumnName',
  [columnNames]: ['Multiple', 'Input', 'CulumnNames'], // Can be used instead of columnName, must be concatenated by the normalizationFunction
  normalizationFunction: () => { /* Function to run on the input data */ },
}
```
- Generate a new header for the stats file

### Adding a new feature

- Add new feature in features.mjs:
```js
{
  name: 'UniqueName',
  inputNames: ['rawInputDataset', 'or', 'previousCycleName'],
  outputName: 'cycleOutputName',
  exportCSV: true, // Whether to generate output CSV for the matching cycle
  skip: false, // Use to temporarily skip a cycle
  config: {}, // Override default config for this cycle
  rules: [
    {
      name: 'uniqueName', // Name of the feature as it is used during normalization
      relevance: 1, // Confidence gain on match
      allowNullValues: true,
      // Function that takes two values to compare and the complete feature under comparison; must return either true/false or an object with isMatch, hasErrors, penalty (overruling feature penalty) and the confidence (overruling relevance)
      comparison: (x, y, feature, config, entry1, entry2) => {
        // x: Value 1
        // y: Value 2
        // feature: Feature definition
        // config: Cycle config
        // entry1: Full entry 1
        // entry2: fullEntry2
        return {
          isMatch: false, // Whether the entries matched
          penalty: 100, // Penalty of mismatch
        };
      },
    },
  ],
},
```

### Config options

|Config option|Type|Description|Default|
|-|-|-|-|
|`DATA_LOCATION`|String|The base directory where data should be loaded from|process.env.DATA_LOCATION,
|`INPUT_SEPARATOR`|String|The CSV column separator in the input files|;
|`OUTPUT_SEPARATOR`|String|The CSV column separator in the generated output files|;
|`NEW_LINE_STRING`|String|The newline character in the system where the algorithm runs, usually '\r\n' for Windows and '\n' for Unix|\r\n
|`STATS_TO_INCLUDE`|{[key: String]: CustomStatsDefinition}|Map of custom stats to include in the output, see 'Custom stats'|
|`CLEANUP_TEST_DATA`|Boolean|Whether to exclude known test data from the input, customiue `normalizeData.mjs` to use|true
|`FILTER_ENTRIES_WITH_EMPTY_MATCHING_DATA`|Boolean|Whether to exclude entries where not a single matching criterion is present|true
|`ALLOW_SAME_DATASET_MERGING`|Boolean|Whether to allow or exclude entries with overlapping sources|false
|`CONFIDENCE_THRESHOLD`|Integer|The minimum confidence to consider two entries as a match|20
|`STRING_COMPARISON_THRESHOLD`|Integer|The minimum fuzzy score to consider as a match, 100, set to 100 to disable fuzzy string comparison|100
|`INCLUDE_HIGH_CONFIDENCE_MISMATCH`|Boolean|Whether to include matches that mismatched on at least one criterion but otherwise had a high matching confidence|true
|`MAX_PENALTY`|Integer|The maximum mismatch penalty before ignoring a potential match|99
|`MAX_MISMATCHES`|Integer|The maximum amount of mismatches, set to -1 to disable|-1

### Custom stats
```js
STATS_TO_INCLUDE: {
  keyOfTheStat: {
    type: 'oneOfEach|nMatchesPerGroup',
    exactMatches: 2, // Only for nMatchesPerGroup
    groups: [['someSrc'], ['someOtherSrc', 'orSomeOtherSrc2']],
  },
}
```

## License and contribution

UNLICENSED - If you want to use this matching algorithm please reach out to us.