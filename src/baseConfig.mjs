import 'dotenv/config';

export default {
  // General settings
  DATA_LOCATION: process.env.DATA_LOCATION,
  INPUT_SEPARATOR: ';',
  OUTPUT_SEPARATOR: ';',
  NEW_LINE_STRING: '\r\n',
  STATS_TO_INCLUDE: {
    osaLiveWithAnythingButT1: {
      type: 'oneOfEach',
      groups: [['OSA_live'], ['t2osa', 't3osa', 't4osa', 'leistung']],
    },
    osaLiveWithT1: {
      type: 'oneOfEach',
      groups: [['OSA_live'], ['t1osa']],
    },
    twoOfT2T3T4: {
      type: 'nMatchesPerGroup',
      exactMatches: 2,
      groups: [['t2osa', 't3osa', 't4osa']],
    },
    threeOfT2T3T4: {
      type: 'nMatchesPerGroup',
      exactMatches: 3,
      groups: [['t2osa', 't3osa', 't4osa']],
    },
  },

  // Settings that can be overridden in the different cycles
  CLEANUP_TEST_DATA: true,
  FILTER_ENTRIES_WITH_EMPTY_MATCHING_DATA: true,
  ALLOW_SAME_DATASET_MERGING: false,
  CONFIDENCE_THRESHOLD: 20,
  // String comparison score = (1 - Number of errors/String length) * 100
  STRING_COMPARISON_THRESHOLD: 100, // Set to 100 to disable fuzzy string comparison
  ALERT_ON_DUPLICATE_DIFF_THRESHOLD: 20,
  INCLUDE_HIGH_CONFIDENCE_MISMATCH: true,
  MAX_PENALTY: 99,
  MAX_MISMATCHES: -1,
};
