const fs = require('fs');
const homedir = require('os').homedir();

const STORE_FILE_PATHNAME = `${homedir}/__store.json`;

module.exports = class Boot {
  // 1. Routine to ensure presence of the store file in the root level directory
  run() {
    try {
      const doesStoreFileExist = fs.existsSync(STORE_FILE_PATHNAME);
      if (!doesStoreFileExist) {
        const emptyJsonString = '{}';
        fs.writeFileSync(STORE_FILE_PATHNAME, emptyJsonString);
      }
    } catch (e) {
      console.log(e);
    }
  }
};
