const fs = require('fs');

class Validator {
  // The key is always a string - capped at 32chars
  static isValidKey(key) {
    const isString = typeof key === 'string';
    if (!isString) return false;
    const isValidLength = key.length <= 32;
    if (!isValidLength) return false;
    return true;
  }

  // The value is always a JSON object - capped at 16KB.
  static isValidValue(value) {
    try {
      // 1. Ensure value is a JSON string
      if (typeof value !== 'string') return false;
      const parsedJSON = JSON.parse(value);
      const MAX_BYTE_SIZE = 16 * 1024;
      const size = Buffer.byteLength(value);
      // 2. Ensure size doesn't exceed 16KB
      if (size > MAX_BYTE_SIZE) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static getFileSizeInBytes(path) {
    const stats = fs.statSync(path);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  }
}

module.exports = Validator;
