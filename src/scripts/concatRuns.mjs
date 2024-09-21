import fs from 'fs';
import runCycles from '../matching/runCycles.mjs';
import strictCycles from '../strict.cycles.mjs';
import tolerantCycles from '../tolerant.cycles.mjs';
import baseConfig from '../baseConfig.mjs';
import isOSAEntry from '../util/isOSAEntry.mjs';

function isMatch(entry) {
  const match = [
    ['OSA_live_012', 'OSA_live_3'],
    ['t2osa', 't3osa', 't4osa'],
  ].every((statPart) => statPart.some((dataset) => (
    Object.keys(entry.__source).includes(dataset)
  )));
  return { ...entry, __isMatch: match };
}

const runs = [
  {
    name: 'strict',
    definition: strictCycles,
    postProcessing: isMatch,
    selectOn: (entry) => entry.__isMatch,
  },
  {
    name: 'tolerant',
    definition: tolerantCycles,
    postProcessing: isMatch,
    selectOn: (entry) => !entry.__isMatch && isOSAEntry(entry),
  },
];

function concatRuns() {
  const resultsToConsider = runs.reduce((collection, run) => {
    const entries = runCycles(run.definition);
    const processedEntries = entries.map(run.postProcessing);
    const newEntries = processedEntries.filter(run.selectOn);
    console.log(`Adding ${newEntries.length} entries from ${run.name}`);
    return [...collection, ...newEntries];
  }, []);
  const output = JSON.stringify(resultsToConsider, null, 2);
  fs.writeFileSync(`${baseConfig.DATA_LOCATION}/intermediates/concatRunsResult.json`, output);
}

concatRuns();
