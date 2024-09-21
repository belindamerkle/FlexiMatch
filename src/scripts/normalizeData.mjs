import fs from 'fs';
import rawDatasets from '../datasets.mjs';
import baseConfig from '../baseConfig.mjs';
import getUID from '../util/getUID.mjs';
import isNullValue from '../util/isNullValue.mjs';
import escapeColumnName from '../util/escapeColumnName.mjs';

rawDatasets.forEach((dataset) => {
  const file = fs.readFileSync(`${baseConfig.DATA_LOCATION}/data/${dataset.fileName}.csv`, 'utf-8');

  // Parse raw csv file content to array
  // Cut the first row to generate the colum names
  const [columnNameString, ...entries] = file.split(baseConfig.NEW_LINE_STRING);
  const columns = columnNameString.split(baseConfig.INPUT_SEPARATOR);

  const parsedEntries = entries.map((entry, entryIdx, arr) => {
    if (entryIdx % 10 === 0) {
      console.log(`${entryIdx}/${arr.length}`);
    }

    const cells = entry.split(baseConfig.INPUT_SEPARATOR);
    if (cells.length !== columns.length) {
      console.error(`Parsing mismatch by ${Math.abs(cells.length - columns.length)} columns: `, cells);
    }
    // All missings replaced by #Null! --> const parsed entry
    const parsedEntry = columns.reduce(
      (entryMap, columnName, idx) => {
        const rawValue = cells[idx];
        const value = isNullValue(rawValue) ? null : rawValue;
        return {
          ...entryMap,
          [escapeColumnName(columnName)]: value,
        };
      },
      {},
    );

    const entryWithFeatures = {
      __id: getUID(),
      // Create a new field for each input dataset that stores the row number (starting with 0)
      // for each entry to later match the matchingData with the original dataset
      // in order to generate the fullData table
      __source: {
        [dataset.fileName]: [entryIdx],
      },
      // Go over the feature columns and normalize the data
      // (for normalization see util normalize pcode, and datasets)
      ...dataset.features.reduce((featureMap, feature) => {
        const rawValue = feature.columnName
          ? parsedEntry[feature.columnName]
          : feature.columnNames.map((columnName) => parsedEntry[columnName]);
        const normalization = feature.normalizationFunction;
        const notNull = (Array.isArray(rawValue)
          ? !rawValue.some((part) => part == null)
          : rawValue != null) || null;
        const value = notNull && (normalization ? normalization(rawValue) : rawValue);

        return {
          ...featureMap,
          [feature.feature]: value || null,
        };
      }, {}),
    };

    if (baseConfig.CLEANUP_TEST_DATA && (
      (entryWithFeatures.pcode8?.match(/.{2}/g) || [])
        .some((part) => ['ZZ', 'YX', 'XX', 'XY', 'YY'].includes(part))
      || ['CDEF', 'TTTT', 'AAAA'].some((testString) => entryWithFeatures.pcode8?.includes(testString))
      || entryWithFeatures.pcode8 === ''
      || (entryWithFeatures.pcode10?.match(/.{2}/g) || [])
        .some((part) => ['ZZ', 'YX', 'XX', 'XY', 'YY'].includes(part))
      || ['CDEF', 'TTTT', 'AAAA'].some((testString) => entryWithFeatures.pcode10?.includes(testString))
      || entryWithFeatures.pcode10 === ''
      || parsedEntry.Ernst === '2'
      || parsedEntry.EV3 === '1'
      || parsedEntry.test === '1'
      // || parsedEntry.dupid?.length
      // || ['0', '2'].includes(parsedEntry.Ernstt1)
      // || ['2', '3', '4', '5', '6', '7'].includes(parsedEntry.Aufmt2)
      // || ['2', '3', '4', '5', '6', '7'].includes(parsedEntry.Aufmt3)
      // || ['2', '3', '4', '5', '6', '7'].includes(parsedEntry.Aufmt4)
      || ['1', '2', '3', '4', '5', '7'].includes(parsedEntry.TS)
    )) {
      return undefined;
    }

    return entryWithFeatures;
  }).filter(Boolean);

  // Write intermediates
  const output = JSON.stringify(parsedEntries, null, 2);
  fs.writeFileSync(`${baseConfig.DATA_LOCATION}/intermediates/${dataset.fileName}.json`, output);
});
