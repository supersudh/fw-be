const inquirer = require('inquirer');

const Boot = require('./Boot');
const Store = require('./Store');

async function start() {
  try {
    const bootInstance = new Boot();
    bootInstance.run();
    const storeInstance = new Store();
    await storeInstance.initialize();
    // await storeInstance.addKeyValueData('key1', '{"meta": "name","data": "zeta pay","alts": "nope"}', 60);
    console.log(await storeInstance.findKey('key1'));
    // await storeInstance.deleteKey('key1');
  } catch (e) {
    console.log(e);
  }
}

start();
