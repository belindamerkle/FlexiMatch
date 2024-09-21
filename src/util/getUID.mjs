import { customAlphabet } from 'nanoid/non-secure';

// Generate a custom alphabet for uuids to avoid clashes from special characters
// when importing in Excel
const getUID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

export default getUID;
