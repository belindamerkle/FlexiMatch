import fs from 'fs';
import lodash from 'lodash';
import baseConfig from '../baseConfig.mjs';
import datasets from '../datasets.mjs';
import isNullValue from '../util/isNullValue.mjs';
import { generateOutput } from '../util/OutputUtils.mjs';
import escapeColumnName from '../util/escapeColumnName.mjs';

function exportIntermediate(intermediateName) {
  const content = fs.readFileSync(`${baseConfig.DATA_LOCATION}/intermediates/${intermediateName}.json`);
  const matchingEntries = JSON.parse(content);
  const relevantSources = {};

  // Prepare matching data
  const template = {};
  const entries = matchingEntries.map((entry) => {
    const transformedEntry = { __source: entry.__source };
    // Copy all field names from the matching features except source metadata
    Object.keys(entry)
      .filter((field) => field !== '__source')
      .forEach((field) => {
        // Avoid same name conflict between matching fields and source fields
        const matchingKey = `AB${field}`;
        transformedEntry[matchingKey] = entry[field];
        template[matchingKey] = null;
      });
    // Split the source info into separate columns
    Object.keys(entry.__source || []).forEach((sourceKey) => {
      relevantSources[sourceKey] = true;
      template[`__source_${sourceKey}`] = null;
      template[`__source_${sourceKey}_count`] = null;
    });
    return transformedEntry;
  });

  const fullHeader = Object.keys(template).sort((a, b) => a.localeCompare(b));

  // Prepare full datasets to be appended
  const sourcesToInclude = Object.keys(relevantSources);
  const datasetMap = {};
  datasets.forEach((dataset) => {
    if (!sourcesToInclude.includes(dataset.fileName)) {
      return;
    }
    const file = fs.readFileSync(`${baseConfig.DATA_LOCATION}/data/${dataset.fileName}.csv`, 'utf-8');
    const [dsColumnString, ...dsEntries] = file.split(baseConfig.NEW_LINE_STRING);
    const columns = dsColumnString.split(baseConfig.INPUT_SEPARATOR).map(escapeColumnName);

    let currentGroup = null;
    const groups = {};
    columns.forEach((column) => {
      const beginningGroup = dataset.groups?.find((group) => group.begin === column);
      const endingGroup = dataset.groups?.find((group) => group.end === column);
      if (beginningGroup) {
        if (currentGroup !== null) {
          throw new Error("Group didn't end");
        }
        currentGroup = beginningGroup.name;
        groups[currentGroup] = {
          definition: beginningGroup,
          columns: [column],
        };
      } else if (currentGroup !== null) {
        groups[currentGroup].columns.push(column);
        if (endingGroup) {
          currentGroup = null;
        }
      }
      if (!fullHeader.includes(column)) {
        fullHeader.push(column);
      }
    });

    datasetMap[dataset.fileName] = {
      groups,
      entries: dsEntries.map((entry) => {
        const values = entry.split(baseConfig.INPUT_SEPARATOR);
        const obj = {};
        columns.forEach((columnName, idx) => {
          obj[columnName] = values[idx];
        });
        return obj;
      }),
    };
  });

  const datasetKeys = datasets.map((ds) => ds.fileName);
  const finalData = entries.map((entry) => {
    const { __source = {}, __mismatches = [], ...entryData } = entry;
    const finalEntry = { ...template, ...entryData, __mismatches: __mismatches.join(' ') };
    datasetKeys.forEach((sourceKey) => {
      const sourceValues = __source[sourceKey];
      if (!sourceValues) {
        return;
      }
      finalEntry[`__source_${sourceKey}`] = sourceValues.join(' ');
      finalEntry[`__source_${sourceKey}_count`] = sourceValues.length;
      sourceValues.forEach((sourceValue) => {
        const originalData = datasetMap[sourceKey].entries[sourceValue];

        const groupFieldsToOverride = [];
        const groupFieldsToExclude = [];

        const { groups } = datasetMap[sourceKey];
        Object.entries(groups).forEach(([groupName, { definition, columns }]) => {
          const groupStatusField = `__group_status_${groupName}`;
          const groupStatus = finalEntry[groupStatusField];

          // Already complete group, never override
          if (groupStatus === 'COMPLETE') {
            groupFieldsToExclude.push(...columns);
            return;
          }

          const isPartial = columns.some((groupField) => (
            !definition.exclude?.(groupField)
            && !isNullValue(originalData[groupField])
          ));
          const isComplete = isPartial && !columns.some((groupField) => (
            !definition.exclude?.(groupField)
            && isNullValue(originalData[groupField])
          ));

          // No data at all yet but some or even all new data
          if (!groupStatus && isPartial) {
            groupFieldsToOverride.push(...columns);
            finalEntry[groupStatusField] = isComplete ? 'COMPLETE' : 'PARTIAL';
            return;
          }
          // Partial data, only override with complete group
          if (groupStatus === 'PARTIAL' && isComplete) {
            groupFieldsToOverride.push(...columns);
            finalEntry[groupStatusField] = 'COMPLETE';
            return;
          }

          groupFieldsToExclude.push(...columns);
        });

        Object.assign(
          finalEntry,
          lodash.omitBy(originalData, (value, key) => {
            if (groupFieldsToOverride.includes(key)) {
              return false;
            }
            if (groupFieldsToExclude.includes(key)) {
              return true;
            }
            return finalEntry[key] != null || isNullValue(value);
          }),
        );
      });
    });
    return finalEntry;
  });

  const lines = finalData.map((finalEntry) => {
    const sortedColumns = [];
    fullHeader.forEach((columnName) => {
      const value = finalEntry[columnName];
      sortedColumns.push(isNullValue(value) ? '' : value);
    });
    return sortedColumns;
  });
  const output = generateOutput(lines, fullHeader.map((columnName) => (
    columnName.replace(/^__/, 'AA').replaceAll('_', '')
  )));
  const currentDate = new Date().toLocaleString('de-DE').replaceAll(/\.|:|,\s/ig, '_');
  const outputName = `fullData_${currentDate}_${intermediateName}`;
  fs.writeFileSync(`${baseConfig.DATA_LOCATION}/output/${outputName}.csv`, output);
}

export default exportIntermediate;
