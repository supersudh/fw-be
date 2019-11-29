const Boot = require('./Boot');
const Store = require('./Store');

const bootInstance = new Boot();
bootInstance.run();
const storeInstance = new Store();

module.exports = storeInstance;
