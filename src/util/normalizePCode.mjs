const normalizationMap = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
};

function normalize(part) {
  const [part1, part2] = part.split('');
  if (!part2) {
    // Add leading zero for single digit inputs
    return `0${part1}`;
  }
  if (normalizationMap[part1]) {
    return normalizationMap[part1];
  }
  if (normalizationMap[part2]) {
    return part1 + normalizationMap[part2][0];
  }
  return part;
}

export default function normalizePCode(code) {
  const regex = code.length >= 9
    ? /^(\D\D)(\d{1,2})(\D\D)(\D\D)(\D\D)$/
    : /^(\D\D)(\d{1,2})(\D\D)(\D\D)$/;
  if (!regex.test(code)) {
    return code;
  }
  const [, ...parts] = regex.exec(code.toLowerCase());
  return parts.map(normalize).join('').toUpperCase();
}
