const fs = require('fs');
const moment = require('moment');
const homedir = require('os').homedir();

const Validator = require('./Validator');

const STORE_FILE_PATHNAME = `${homedir}/__store.json`;

module.exports = class Store {
  // Initialize the storeData by reading from store file
  initialize() {
    try {
      this.storeData = {};
      return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(STORE_FILE_PATHNAME, { encoding: 'utf-8' });
        let data = '';
        stream.on('data', chunk => {
          data += chunk;
        });

        stream.on('end', () => {
          this.storeData = JSON.parse(data);
          return resolve(true);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  async addKeyValueData(key, value, ttl) {
    try {
      // 1. Validate key-value pair
      const isValidKey = Validator.isValidKey(key);
      if (!isValidKey) {
        const error = new Error('Invalid key');
        throw error;
      }
      const isValidValue = Validator.isValidValue(value);
      if (!isValidValue) {
        const error = new Error('Invalid value - value must be JSON capped at 16KB');
        throw error;
      }

      // 2. Validate ttl
      const isInteger = typeof ttl === 'number';
      if (!isInteger) {
        const error = new Error('Invalid ttl - Must be seconds in integer format');
        throw error;
      }

      // 3. Is duplicate key
      if (this.storeData[key]) {
        const error = new Error('Invalid key - Key already exists');
        throw error;
      }

      // 3. set local state
      this.storeData[key] = {
        value,
        ttl: Math.floor(ttl),
        created: moment().unix()
      };

      // 4. update store
      await this.updateFileStore(this.storeData);
    } catch (e) {
      throw e;
    }
  }

  async findKey(key) {
    const foundKey = this.storeData[key];
    if (foundKey) {
      const current = moment().unix();
      const ttlMillisecs = foundKey.ttl * 1000;
      if (current - foundKey.created > ttlMillisecs) {
        // unlink key and return N/A if key is expired
        delete this.storeData[key];
        await this.updateFileStore(this.storeData);
        return 'Key not found';
      }
      return foundKey.value;
    }
    return 'Key not found';
  }

  async deleteKey(key) {
    try {
      const foundKey = this.storeData[key];
      if (foundKey) {
        delete this.storeData[key];
        await this.updateFileStore(this.storeData);
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  updateFileStore(newStoreData) {
    return new Promise((resolve, reject) => {
      fs.writeFile(STORE_FILE_PATHNAME, JSON.stringify(this.storeData), err => {
        if (err) return reject(err);
        return resolve(true);
      });
    });
  }
};
