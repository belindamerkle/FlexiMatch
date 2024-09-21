function escapeColumnName(columnName) {
  // Remove spaces and zero width characters from input
  return columnName.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
}

export default escapeColumnName;
