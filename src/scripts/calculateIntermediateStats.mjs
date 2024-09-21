import fs from 'fs';
import baseConfig from '../baseConfig.mjs';
import rawDatasets from '../datasets.mjs';
import features from '../features.mjs';

rawDatasets.forEach((dataset) => {
  const entryStats = {};
  const featureStats = {};

  const content = fs.readFileSync(`${baseConfig.DATA_LOCATION}/intermediates/${dataset.fileName}.json`);
  const entries = JSON.parse(content);

  entries.forEach((entry) => {
    const entryCount = Object.values(features).reduce((count, feature) => {
      if (!entry[feature.name]) {
        featureStats[feature.name] = (featureStats[feature.name] || 0) + 1;
        return count + 1;
      }
      return count;
    }, 0);
    entryStats[entryCount] = (entryStats[entryCount] || 0) + 1;
  });

  console.log(dataset.fileName, Object.values(entries).length, entryStats, featureStats);
});
