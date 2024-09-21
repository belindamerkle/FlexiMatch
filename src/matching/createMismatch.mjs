import features from '../features.mjs';

const mismatchTemplate = {
  __id: null,
  __dataset1: null,
  __dataset1Id: null,
  __dataset2: null,
  __dataset2Id: null,
  __matchConfidence: 0,
  __finalDataset: null,
  __finalDatasetId: null,
};
features.forEach((feature) => {
  mismatchTemplate[`${feature.name}_1`] = null;
  mismatchTemplate[`${feature.name}_2`] = null;
  if (feature.hasMetadata) {
    mismatchTemplate[`${feature.name}_metadata`] = null;
  }
});
features.forEach((feature) => {
  mismatchTemplate[`z_${feature.name}_1`] = null;
  mismatchTemplate[`z_${feature.name}_2`] = null;
  if (feature.hasMetadata) {
    mismatchTemplate[`z_${feature.name}_metadata`] = null;
  }
});

function createMismatch(
  id,
  id1,
  dataset1,
  id2,
  dataset2,
  confidence,
  mismatchedFeatures,
  matchedFeatures,
) {
  const newMismatch = {
    ...mismatchTemplate,
    __id: id,
    __dataset1: dataset1,
    __dataset1Id: id1,
    __dataset2: dataset2,
    __dataset2Id: id2,
    __matchConfidence: confidence,
  };
  matchedFeatures.forEach(([featureName, matchConfidence]) => {
    newMismatch[`z_${featureName}_1`] = `x (${matchConfidence})`;
    newMismatch[`z_${featureName}_2`] = `x (${matchConfidence})`;
  });
  mismatchedFeatures.forEach(([featureName, value1, value2, metadata]) => {
    newMismatch[`${featureName}_1`] = value1;
    newMismatch[`${featureName}_2`] = value2;
    if (metadata) {
      const metadataToDisplay = Object.entries(metadata)
        .map(([key, value]) => (`${key}: ${value}`))
        .join(', ');
      newMismatch[`${featureName}_metadata`] = metadataToDisplay;
      newMismatch[`z_${featureName}_metadata`] = metadataToDisplay;
    }
    newMismatch[`z_${featureName}_1`] = value1;
    newMismatch[`z_${featureName}_2`] = value2;
  });

  return newMismatch;
}

export default createMismatch;
