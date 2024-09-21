// A1: Remove duplicates from t1
// A2: Remove duplicates from t2
// A3: Remove duplicates from t3
// A4: Remove duplicates from t4
// B: Match A1, A2, A3, A4
// C: Concat OSA_Live_012 and OSA_Live_3, Remove duplicates -> OSA_live
// D: Match B and C
// E: Match D and Leistung

import isOSAEntry from './util/isOSAEntry.mjs';

export default [
  {
    name: 'A1', // A1: Remove duplicates from t1osa
    skip: false,
    inputNames: ['t1osa'],
    outputName: 't1distinct',
    config: {
      CONFIDENCE_THRESHOLD: 20,
      MAX_MISMATCHES: 0,
      ALLOW_SAME_DATASET_MERGING: true,
    },
  },
  {
    name: 'A2', // A2: Remove duplicates from t2osa
    skip: false,
    inputNames: ['t2osa'],
    outputName: 't2distinct',
    config: {
      CONFIDENCE_THRESHOLD: 20,
      MAX_MISMATCHES: 0,
      ALLOW_SAME_DATASET_MERGING: true,
    },
  },
  {
    name: 'A3', // A3: Remove duplicates from t3osa
    skip: false,
    inputNames: ['t3osa'],
    outputName: 't3distinct',
    config: {
      CONFIDENCE_THRESHOLD: 20,
      MAX_MISMATCHES: 0,
      ALLOW_SAME_DATASET_MERGING: true,
    },
  },
  {
    name: 'A4', // A4: Remove duplicates from t4osa
    skip: false,
    inputNames: ['t4osa'],
    outputName: 't4distinct',
    config: {
      CONFIDENCE_THRESHOLD: 20,
      MAX_MISMATCHES: 0,
      ALLOW_SAME_DATASET_MERGING: true,
    },
  },

  {
    name: 'B1', // B: Match A2, A3, A4
    inputNames: ['t2distinct', 't3distinct', 't4distinct'],
    outputName: 't234',
    config: {
      CONFIDENCE_THRESHOLD: 13,
      STRING_COMPARISON_THRESHOLD: 75,
      MAX_PENALTY: 2,
    },

    rules: [

      {
        name: 'VBeginn',
        relevance: 0,
      },
      {
        name: 'VBLAbi',
        relevance: 0,
      },
      {
        name: 'VNoteAbi',
        relevance: 0,
      },
    ],

  },

  {
    name: 'C', // C: Concat OSA_Live_012 and OSA_Live_3
    skip: false,
    inputNames: ['OSA_live_012', 'OSA_live_3'],
    outputName: 'osa_live',
    config: {
      CONFIDENCE_THRESHOLD: 20,
      MAX_MISMATCHES: 0,
      ALLOW_SAME_DATASET_MERGING: true,
    },
  },
  {
    name: 'D', // D: Match B and C
    inputNames: ['t234', 'osa_live'],
    outputName: 'osa_live_t234',
    config: {
      CONFIDENCE_THRESHOLD: 13,
      STRING_COMPARISON_THRESHOLD: 75,
      MAX_PENALTY: 1,
    },
  },
  {
    name: 'E', // E: Match D and Leistung
    inputNames: ['osa_live_t234', 'leistung'],
    outputName: 'osa_live_t234_leistung',
    exportCSV: true,
    config: {
      CONFIDENCE_THRESHOLD: 11,
      STRING_COMPARISON_THRESHOLD: 75,
      MAX_PENALTY: 1,
    },
    rules: [
      {
        name: 'Beginn',
        relevance: 1,
        // Difference of one is allowed due to max two vacation semesters
        comparison: (x, y) => {
          if (Math.abs(+x - +y) <= 1) {
            return {
              isMatch: true,
            };
          }
          if (Math.abs(+x - +y) <= 2) {
            return {
              isMatch: false,
              penalty: 1,
            };
          }
          return {
            isMatch: false,
            penalty: 100,
          };
        },
      },
      {
        name: 'leistungOSALiveCheck',
        relevance: 0,
        allowNullValues: true,
        comparison: (x, y, feature, config, entry1) => {
          if (
            !isOSAEntry(entry1)
          || (entry1.FBeginn >= 2020 && entry1.FBeginn <= 2021)
          ) {
            return true;
          }
          return {
            isMatch: false,
            penalty: 100,
          };
        },
      },
    ],
  },
  {
    name: 'F', // F: Match E and t1
    inputNames: ['osa_live_t234_leistung', 't1distinct'],
    outputName: 'osa_live_t1234_leistung',
    exportCSV: true,
    skip: false,
    config: {
      CONFIDENCE_THRESHOLD: 14,
      STRING_COMPARISON_THRESHOLD: 75,
      MAX_PENALTY: 1,
    },
    rules: [
      {
        name: 'avoidOSALiveMatch',
        relevance: 0,
        allowNullValues: true,
        comparison: (x, y, feature, config, entry1) => {
          if (!isOSAEntry(entry1)) {
            return true;
          }
          return {
            isMatch: false,
            penalty: 100,
          };
        },
      },
    ],
  },

];
