function isNullValue(value) {
  return ['', '-99', '-77', '-66', '#NULL!', null].includes(value);
}

export default isNullValue;
