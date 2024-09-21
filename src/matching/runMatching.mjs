import lodash from 'lodash';
import getUID from '../util/getUID.mjs';
import calculateMatchConfidence from './calculateMatchConfidence.mjs';
import createMismatch from './createMismatch.mjs';

const { omitBy, isNull } = lodash;

function runMatching(allEntries, config, cycleName, rules) {
  console.log(`Beginning matching for ${cycleName}`);
  const entries = [...allEntries];
  const allMatches = [];
  const highConfidenceMismatches = [];
  // Lookup for the objects where mismatches ended up in
  const hCMResultLookup = {};

  const calculateConfidencesForEntry = (entry1, entry1Idx, arr, checkAll) => {
    const startingPoint = checkAll ? 0 : (entry1Idx + 1);
    const newMatches = arr.slice(startingPoint).map((entry2, entry2Offset) => {
      const entry2Idx = startingPoint + entry2Offset;
      const involvedDataSources = [
        ...Object.keys(entry1.__source),
        ...Object.keys(entry2.__source),
      ];
      const involvedTempSources = [
        ...entry1.__TEMP_SOURCES,
        ...entry2.__TEMP_SOURCES,
      ];
      if (
        // Don't calculate confidence with entry itself
        entry1Idx === entry2Idx
        // If ALLOW_SAME_DATASET_MERGING is disallowed, exclude entries with overlapping sources
        || (
          !config.ALLOW_SAME_DATASET_MERGING
          && (
            entry1.__TEMP_INTERMEDIATE_SOURCE === entry2.__TEMP_INTERMEDIATE_SOURCE
            // Make sure that entries that didn't match during previous cycles don't match due
            // to more tolerant config
            || lodash.uniq(involvedTempSources).length !== involvedTempSources.length
            || lodash.uniq(involvedDataSources).length !== involvedDataSources.length
          )
        )
      ) {
        return undefined;
      }

      const {
        confidence,
        penalty,
        matches,
        mismatches,
      } = calculateMatchConfidence(entry1, entry2, config, rules);
      const hasHighConfidence = confidence >= config.CONFIDENCE_THRESHOLD;
      const isHighConfidenceMismatch = hasHighConfidence && mismatches.length > 0;
      const isMatch = (
        hasHighConfidence
        && (config.INCLUDE_HIGH_CONFIDENCE_MISMATCH || !isHighConfidenceMismatch)
        && (config.MAX_PENALTY === -1 || penalty <= config.MAX_PENALTY)
        && (config.MAX_MISMATCHES === -1 || mismatches.length <= config.MAX_MISMATCHES)
      );

      if (isMatch) {
        return {
          entry1Idx,
          entry2Idx,
          confidence,
          penalty,
          matches,
          mismatches,
        };
      }
      return undefined;
    }).filter(Boolean);
    allMatches.push(...newMatches);
    return newMatches;
  };

  // Calculate all confidence combinations
  entries.forEach(calculateConfidencesForEntry);

  const usedIndices = {};

  let allMatchesFound = false;

  const findBestMatch = (lastMatchesToConsider) => {
    const newMatchesToConsider = [...lastMatchesToConsider]
      // Sort by descending confidence
      .sort((a, b) => b.confidence - a.confidence)
      // Filter all entries that were already used to create a match
      .filter(({ entry1Idx, entry2Idx }) => (
        // Check if the match is still possible
        // We assume that if a value tries to match again it should be ignore because only scenario
        // is that duplicate contribution but with typo and thus not detected during duplicate
        // search
        // Exception: Duplicates themselves
        usedIndices[entry1Idx] === undefined && usedIndices[entry2Idx] === undefined
      ));

    if (newMatchesToConsider.length === 0) {
      // No more matches, dataset is done
      allMatchesFound = true;
      return [];
    }

    const bestMatch = newMatchesToConsider.shift();
    const {
      entry1Idx,
      entry2Idx,
      confidence,
      matches,
      mismatches,
    } = bestMatch;
    const entry1 = entries[entry1Idx];
    const entry2 = entries[entry2Idx];
    const dataSourceKeys = Object.keys({ ...entry1.__source, ...entry2.__source });
    const newDataSources = {};
    dataSourceKeys.forEach((dsKey) => {
      newDataSources[dsKey] = lodash.uniq([
        ...(entry1.__source[dsKey] || []),
        ...(entry2.__source[dsKey] || []),
      ]);
    });
    // In case of more than two duplicates it can happen that two duplicate pairs are merged
    // In this case, make sure to create the final entry fresh from all sources
    // E.g. 1-4 gets merged with 2-3; We cannot be sure that the 1-4 entry should always win over
    // 2-3, it is possible that some matching fields were filled from 4
    const mergedMatchingData = dataSourceKeys.reduce((mergedData, dsKey) => {
      const newData = [...newDataSources[dsKey]]
        .sort((source1, source2) => source2 - source1)
        .reduce((curr, source) => {
          const sourceItem = allEntries.find((entry) => (
            entry.__source[dsKey]?.includes(source)
          ));
          const { __source: from, __id, ...original } = sourceItem;
          return { ...omitBy(curr, isNull), ...omitBy(original, isNull) };
        }, {});
      return { ...omitBy(newData, isNull), ...omitBy(mergedData, isNull) };
    }, {});
    const newEntry = {
      ...mergedMatchingData,
      __id: getUID(),
      __source: newDataSources,
      __TEMP_INTERMEDIATE_SOURCE: cycleName,
      __TEMP_SOURCES: lodash.uniq([...entry1.__TEMP_SOURCES, ...entry2.__TEMP_SOURCES]),
      __mismatches: [].concat(entry1.__mismatches, entry2.__mismatches),
    };

    // Source entries won't exist in the final dataset
    Object.keys(hCMResultLookup).forEach((mismatchId) => {
      if ([entry1.__id, entry2.__id].includes(hCMResultLookup[mismatchId])) {
        hCMResultLookup[mismatchId] = newEntry.__id;
      }
    });

    const newEntryIdx = entries.length;
    entries.push(newEntry);
    usedIndices[entry1Idx] = newEntryIdx;
    usedIndices[entry2Idx] = newEntryIdx;
    if (mismatches.length > 0) {
      console.error('Invalid match with high confidence: ', mismatches.map((f) => f.join(' ')), confidence);
      const cycle1 = entry1.__TEMP_INTERMEDIATE_SOURCE;
      const cycle2 = entry2.__TEMP_INTERMEDIATE_SOURCE;
      const mismatchId = getUID();
      highConfidenceMismatches.push(createMismatch(
        mismatchId,
        entry1.__id,
        (cycle1 === cycleName ? `Intermediate during ${cycle1}` : cycle1),
        entry2.__id,
        (cycle2 === cycleName ? `Intermediate during ${cycle2}` : cycle2),
        confidence,
        mismatches,
        matches,
      ));
      newEntry.__mismatches.push(mismatchId);
      hCMResultLookup[mismatchId] = newEntry.__id;
    }

    // Add matches with newly created record
    const newMatches = calculateConfidencesForEntry(newEntry, newEntryIdx, entries, true);
    newMatchesToConsider.push(...newMatches);

    return newMatchesToConsider;
  };

  let matchesToCheck = allMatches;
  do {
    matchesToCheck = findBestMatch(matchesToCheck);
  } while (!allMatchesFound);

  const finalMismatches = highConfidenceMismatches.map((mismatch) => {
    const finalEntryId = hCMResultLookup[mismatch.__id];
    return {
      ...mismatch,
      __finalDataset: cycleName,
      __finalDatasetId: finalEntryId,
    };
  });

  const finalRecords = [
    ...entries
      .filter((_, idx) => usedIndices[idx] === undefined)
      .map((entry) => {
        const { __TEMP_INTERMEDIATE_SOURCE, __TEMP_SOURCES, ...entryData } = entry;
        return { __id: getUID(), ...entryData };
      }),
  ];

  return [finalRecords, finalMismatches];
}

export default runMatching;
