import rawFeatures from '../features.mjs';

function calculateMatchConfidence(entry1, entry2, config, additionalRules) {
  const matches = [];
  const mismatches = [];
  let totalPenalty = 0;
  let totalConfidence = 0;

  const features = [...rawFeatures];
  additionalRules.forEach((additionalRule) => {
    const originalFeature = features.findIndex((feature) => additionalRule.name === feature.name);
    if (originalFeature >= 0) {
      features[originalFeature] = { ...features[originalFeature], ...additionalRule };
    } else {
      features.push(additionalRule);
    }
  });

  // Cumulate the confidence for all features while keeping track of mismatches
  features.forEach((feature) => {
    const value1 = entry1[feature.name];
    const value2 = entry2[feature.name];

    // If one of the values is missing, just ignore the feature
    if (!feature.allowNullValues && (value1 == null || value2 == null)) {
      return;
    }

    const matchResult = feature.comparison(value1, value2, feature, config, entry1, entry2);
    if (feature.allowNullValues && matchResult == null) {
      return;
    }
    const {
      isMatch, confidence, hasErrors, penalty, compValue1, compValue2, confidenceLoss, metadata,
    } = {
      confidence: feature.relevance,
      hasErrors: typeof matchResult === 'boolean' ? !matchResult : !matchResult.isMatch,
      penalty: feature.penalty,
      compValue1: value1,
      compValue2: value2,
      confidenceLoss: 0,
      metadata: null,
      ...(
        typeof matchResult === 'boolean'
          ? {
            isMatch: matchResult,
          }
          : matchResult
      ),
    };

    if (isMatch) {
      matches.push([feature.name, confidence]);
      totalConfidence += confidence;
    }
    if ((!isMatch || hasErrors) && !feature.ignoreMismatch) {
      mismatches.push([feature.name, compValue1, compValue2, metadata]);
      totalPenalty += penalty || 0;
      totalConfidence -= confidenceLoss;
    }
  });

  return {
    confidence: totalConfidence,
    penalty: totalPenalty,
    mismatches,
    matches,
  };
}

export default calculateMatchConfidence;
