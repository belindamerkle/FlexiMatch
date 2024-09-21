import baseConfig from '../baseConfig.mjs';

function generateContent(lines) {
  return lines.map((line) => (Array.isArray(line) ? line : Object.values(line))
    .map((part) => (typeof part === 'number' ? `${part}`.replace('.', ',') : part))
    .join(baseConfig.OUTPUT_SEPARATOR)).join('\n');
}

function generateHeader(vData) {
  return (Array.isArray(vData) ? vData : Object.keys(vData)).join(baseConfig.OUTPUT_SEPARATOR);
}

function generateOutput(lines, header) {
  return `${generateHeader(header || lines[0])}\n${generateContent(lines)}`;
}

export { generateContent, generateHeader, generateOutput };
