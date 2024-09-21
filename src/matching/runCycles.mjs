import fs from 'fs';
import features from '../features.mjs';
import baseConfig from '../baseConfig.mjs';
import runMatching from './runMatching.mjs';
import { generateOutput } from '../util/OutputUtils.mjs';
import writeStats from '../util/writeStats.mjs';

const FEATURE_COUNT = Object.keys(features).length;

function runCycles(cycles) {
  const allMismatches = [];
  const finalResult = [];
  const lastValidCycle = cycles.findLastIndex((cycle) => !cycle.skip);
  cycles.forEach((cycle, cycleIdx) => {
    if (cycle.skip) {
      return;
    }

    const {
      inputNames, outputName, config: cycleConfig, rules = [],
    } = cycle;
    const config = { ...baseConfig, ...cycleConfig };
    const keys = { __id: true };

    // Read the generated JSON intermediates and prepare them for processing
    const datasets = inputNames.map((datasetName) => {
      const content = fs.readFileSync(`${config.DATA_LOCATION}/intermediates/${datasetName}.json`);
      const entries = JSON.parse(content);
      Object.keys(entries[0]).forEach((key) => { keys[key] = true; });
      return entries
        .map((entry) => ({
          __mismatches: [],
          ...entry,
          __TEMP_INTERMEDIATE_SOURCE: datasetName,
          __TEMP_SOURCES: [datasetName],
        }))
        .filter(((entry) => {
          const count = Object.values(features).reduce((c, feature) => (
            c + +!entry[feature.name]
          ), 0);
          // Check for empty entries, i.e. no matching feature is set
          return !config.FILTER_ENTRIES_WITH_EMPTY_MATCHING_DATA || count < FEATURE_COUNT;
        }));
    });

    const input = datasets.flat();
    const [finalEntries, finalMismatches] = runMatching(input, config, outputName, rules);
    allMismatches.push(...finalMismatches);

    const output = JSON.stringify(finalEntries, null, 2);
    fs.writeFileSync(`${config.DATA_LOCATION}/intermediates/${outputName}.json`, output);

    // Write stats for last cycle
    if (cycleIdx === lastValidCycle) {
      writeStats(finalEntries, cycles);
      finalResult.push(...finalEntries);
    }
  });

  if (allMismatches.length > 0) {
    const header = {};
    allMismatches.forEach((mismatch) => {
      Object.keys(mismatch).forEach((key) => {
        header[key] = true;
      });
    });
    const lines = allMismatches.map((mismatch) => Object.keys(header).map((key) => mismatch[key]));
    const currentDate = new Date().toLocaleString('de-DE').replaceAll(/\.|:|,\s/ig, '_');
    fs.writeFileSync(
      `${baseConfig.DATA_LOCATION}/output/mismatches_${currentDate}.csv`,
      generateOutput(lines, header),
    );
  }

  return finalResult;
}

export default runCycles;
