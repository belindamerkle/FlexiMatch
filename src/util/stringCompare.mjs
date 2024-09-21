function stringCompare(string1, string2) {
  const [shortString, longString] = [string1, string2].sort((a, b) => a.length - b.length);
  const errors = shortString.split('').reduce((totalErrors, char, idx) => (
    totalErrors + +(char !== longString[idx])
  ), 0);
  return {
    errors,
    fuzzyScore: Math.ceil((1 - errors / longString.length) * 100),
  };
}

export default stringCompare;
