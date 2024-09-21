export default function powerSet(array) {
  const result = [];
  const f = (prefix, chars) => {
    for (let i = 0; i < chars.length; i += 1) {
      const newString = prefix.length ? `${prefix} + ${chars[i]}` : chars[i];
      result.push(newString);
      f(newString, chars.slice(i + 1));
    }
  };
  f('', array);
  return result;
}
