import { ratio } from 'fuzzball';
import stringCompare from './util/stringCompare.mjs';
import isOSAEntry from './util/isOSAEntry.mjs';

function fuzzyCompare(string1, string2, feature, config) {
  const { errors, fuzzyScore } = stringCompare(string1, string2);
  const confidence = ({
    0: 1,
    1: 0.75,
    2: 0.5,
  }[errors] || 0) * feature.relevance;
  return {
    isMatch: fuzzyScore >= config.STRING_COMPARISON_THRESHOLD,
    hasErrors: errors > 0,
    confidence,
    penalty: (fuzzyScore > 50) ? 0 : 100,
    metadata: {
      errors,
      fuzzyScore,
    },
  };
}

export default [
  {
    name: 'mat',
    relevance: 100,
    hasMetadata: true,
    comparison: (mat1, mat2, feature, config, entry1, entry2) => {
      const matMatches = mat1 === mat2;
      const universityMatches = entry1.BaWue === entry2.BaWue;
      const score = ratio(mat1, mat2);
      let confidence = 0;
      if (!entry1.BaWue || !entry2.BaWue) {
        // Lower confidence since lacking university
        confidence = 33.3;
      } else if (universityMatches) {
        confidence = feature.relevance;
      }

      // In case of fuzzy match, count it as an error but don't give a penalty
      return {
        isMatch: matMatches,
        confidence,
        penalty: (score > 75) ? 0 : 100,
        metadata: {
          score,
        },
      };
    },
  },

  {
    name: 'pcode10',
    relevance: 40,
    hasMetadata: true,
    comparison: fuzzyCompare,
  },

  {
    name: 'pcode8',
    relevance: 20,
    hasMetadata: true,
    comparison: (pcode1, pcode2, feature, config) => {
      if (pcode1.length === 8 || pcode2.length === 8) {
        return fuzzyCompare(pcode1.substring(0, 8), pcode2.substring(0, 8), feature, config);
      }
      return fuzzyCompare(pcode1, pcode2, feature, config);
    },
  },

  {
    name: 'Geburtsjahr',
    relevance: 1,
    comparison: (x, y) => {
      if (Math.abs(+x - +y) <= 1) {
        return {
          isMatch: true,
        };
      }
      return {
        isMatch: false,
        penalty: 1,
      };
    },
  },

  {
    name: 'Gesch',
    relevance: 1,
    comparison: (x, y) => {
      if (x === y) {
        return {
          isMatch: true,
        };
      }
      if (x === 2 || y === 2) {
        return {
          isMatch: false,
          penalty: 0,
        };
      }
      return {
        isMatch: false,
        penalty: 1,
      };
    },
  },

  {
    name: 'BLAbi',
    relevance: 1,
    comparison: (x, y) => x === y,
  },

  {
    name: 'VBLAbi',
    relevance: 0.5,
    comparison: (x, y) => x === y,
  },

  {
    name: 'NoteAbi',
    relevance: 1,
    comparison: (x, y) => {
      const NoteAbiDiff = +x.replace(',', '.') - +y.replace(',', '.');
      if (NoteAbiDiff === 0) {
        return {
          isMatch: true,
        };
      }
      if (Math.abs(NoteAbiDiff) <= 0.2) {
        return {
          isMatch: false,
        };
      }
      return {
        isMatch: false,
        confidenceLoss: 0,
        penalty: 1,
      };
    },
  },

  {
    name: 'VNoteAbi',
    relevance: 0.5,
    comparison: (x, y) => Math.abs(parseFloat(x.replace(',', '.')) - parseFloat(y.replace(',', '.'))) <= 1,
  },

  {
    name: 'Beginn',
    relevance: 1,
    // Difference of one is allowed due to max two vacation semesters
    comparison: (x, y) => {
      const yearDiff = +x - +y;
      if (yearDiff >= -1 && yearDiff <= 0) {
        return {
          isMatch: true,
        };
      }
      if (Math.abs(yearDiff) <= 2) {
        return {
          isMatch: false,
          confidenceLoss: 0,
        };
      }
      return {
        isMatch: false,
        confidenceLoss: 0,
        penalty: 100,
      };
    },
  },

  {
    name: 'VBeginn',
    relevance: 0.5,
    comparison: (x, y) => Math.abs(x - y) <= 1,
  },

  {
    name: 'FBeginn',
    relevance: 1,
    allowNullValues: true,
    comparison: (x, y, feature, config, entry1, entry2) => {
      const [osaEntry, otherEntry] = isOSAEntry(entry1)
        ? [entry1, entry2]
        : [entry2, entry1];
      if (osaEntry.FBeginn && otherEntry.Beginn) {
        const yearDiff = otherEntry.Beginn - osaEntry.FBeginn;
        const baseReturn = {
          compValue1: isOSAEntry(entry1) ? entry1.FBeginn : entry1.Beginn,
          compValue2: isOSAEntry(entry2) ? entry2.FBeginn : entry2.Beginn,
        };
        if (yearDiff >= 0) {
          return {
            ...baseReturn,
            isMatch: true,
          };
        }
        if (yearDiff === -1) {
          return {
            ...baseReturn,
            isMatch: false,
            penalty: 1,
          };
        }
        return {
          ...baseReturn,
          isMatch: false,
          penalty: 100,
        };
      }
      return null;
    },
  },
  {
    name: 'BaWue',
    relevance: 1,
    comparison: (x, y) => x === y,
    penalty: 1,
  },
];
