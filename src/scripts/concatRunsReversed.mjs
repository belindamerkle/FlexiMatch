import fs from 'fs';
import runCycles from '../matching/runCycles.mjs';
import strictCycles from '../strictTnOsalive.cycles.mjs';
import tolerantCycles from '../tolerantTnOsalive.cycles.mjs';
import baseConfig from '../baseConfig.mjs';

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
    name: 'reversedStrict',
    definition: strictCycles,
    postProcessing: isMatch,
    selectOn: (entry) => entry.__isMatch,
  },
  {
    name: 'reversedTolerant',
    definition: tolerantCycles,
    postProcessing: isMatch,
    selectOn: (entry) => !entry.__isMatch && (
      entry.__source.t2osa
      || entry.__source.t3osa
      || entry.__source.t4osa
    ),
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
  fs.writeFileSync(`${baseConfig.DATA_LOCATION}/intermediates/concatRunsReversedResult.json`, output);
}

concatRuns();
