function isOSAEntry(entry) {
  return entry.__source.OSA_live_012 || entry.__source.OSA_live_3;
}

export default isOSAEntry;
