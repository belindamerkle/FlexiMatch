import fs from 'fs';
import lodash from 'lodash';
import powerSet from './powerSet.mjs';
import baseConfig from '../baseConfig.mjs';
import getUID from './getUID.mjs';
import datasets from '../datasets.mjs';

function writeStats(finalEntries, cycles) {
  const stats = {
    __id: getUID(),
    __date: new Date().toLocaleString('de-DE'),
    BASE_CONFIDENCE_THRESHOLD: baseConfig.CONFIDENCE_THRESHOLD,
    BASE_STRING_COMPARISON_THRESHOLD: baseConfig.STRING_COMPARISON_THRESHOLD,
    BASE_INCLUDE_HIGH_CONFIDENCE_MISMATCH: baseConfig.INCLUDE_HIGH_CONFIDENCE_MISMATCH,
    BASE_MAX_PENALTY: baseConfig.MAX_PENALTY,
    BASE_MAX_MISMATCHES: baseConfig.MAX_MISMATCHES,
  };
  cycles.forEach((statCycle) => {
    stats[`input_${statCycle.outputName}`] = statCycle.inputNames.join(',');
    stats[`config_${statCycle.outputName}`] = Object.entries(statCycle.config)
      .map(([key, value]) => (`${key}: ${value}`))
      .join(', ');
  });

  // Count OSA_live_012 and OSA_live_3 as OSA_live
  const datasetMappings = {
    OSA_live_012: 'OSA_live',
    OSA_live_3: 'OSA_live',
  };
  const datasetNames = lodash.uniq(Object.values(datasets)
    .map((dataset) => datasetMappings[dataset.fileName] || dataset.fileName));
  datasetNames.forEach((dataset, idx) => {
    stats[`with_${dataset}`] = 0;
    stats[`with_count_${idx + 1}`] = 0;
  });

  Object.entries(baseConfig.STATS_TO_INCLUDE).forEach(([customStatKey, customStat]) => {
    stats[customStatKey] = finalEntries.filter((entry) => {
      const sources = lodash.uniq(Object.keys(entry.__source)
        .map((source) => datasetMappings[source] || source));

      const statCalc = {
        oneOfEach: (statPart) => statPart.some((dataset) => sources.includes(dataset)),
        nMatchesPerGroup: (statPart) => statPart.filter((dataset) => (
          sources.includes(dataset))).length === customStat.exactMatches,
      }[customStat.type];

      return customStat.groups.every((statPart) => statCalc(statPart));
    }).length;
  });

  powerSet(datasetNames.sort())
    .forEach((combination) => { stats[`z_${combination}`] = 0; });

  finalEntries.forEach((entry) => {
    const sources = lodash.uniq(Object.keys(entry.__source)
      .map((source) => datasetMappings[source] || source));
    sources.sort().forEach((source) => {
      if (sources.length >= 2) {
        stats[`with_${source}`] += 1;
      }
    });
    stats[`with_count_${sources.length}`] += 1;
    stats[`z_${sources.join(' + ')}`] += 1;
  });

  const content = fs.existsSync(`${baseConfig.DATA_LOCATION}/intermediates/stats.json`)
    ? JSON.parse(fs.readFileSync(`${baseConfig.DATA_LOCATION}/intermediates/stats.json`))
    : [];
  const statsOutput = JSON.stringify([...content, stats], null, 2);
  fs.writeFileSync(`${baseConfig.DATA_LOCATION}/intermediates/stats.json`, statsOutput);
  console.log(stats);
}

export default writeStats;
