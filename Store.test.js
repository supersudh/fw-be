const fs = require('fs');
const homedir = require('os').homedir();

const Store = require('./Store');

const STORE_FILE_PATHNAME = `${homedir}/__store.json`;

const storeInstance = new Store();

const removeFile = path => new Promise((resolve, reject) => {
  fs.unlink(path, err => {
    resolve(true);
  });
});

beforeAll(async done => {
  await removeFile(STORE_FILE_PATHNAME);
  await storeInstance.initialize();
  done();
});

test('A new key-value pair can be added to the data store using the Create operation', async done => {
  const key1 = 'food_details';
  const value1 = '{"name": "pizza", "type": "thin crust"}';
  const ttl1 = 1000;

  const key2 = 'phones';
  const value2 = '{"name": "iphone", "model": "XS max", "manufacturer": "apple"}';
  const ttl2 = 1001;

  const key3 = 'language1';
  const value3 = '{"name": "COBOL", "popularity": "Used widely during the 90s"}';
  const ttl3 = 1003;

  await storeInstance.create(key1, value1, ttl1);
  await storeInstance.create(key2, value2, ttl2);
  await storeInstance.create(key3, value3, ttl3);

  const result1 = await storeInstance.find(key1);
  const result2 = await storeInstance.find(key2);
  const result3 = await storeInstance.find(key3);

  expect(result1).toBe(value1);
  expect(result2).toBe(value2);
  expect(result3).toBe(value3);

  done();
});

test('It doesn\'t insert if the key is not a string - and not capped at 32chars', async done => {
  const nonStringKey = 123;
  const value1 = '{"name": "pizza", "type": "thin crust"}';
  const ttl1 = 1000;

  try {
    await storeInstance.create(nonStringKey, value1, ttl1);
  } catch (error) {
    expect(error.message).toEqual('Invalid key');
  }

  const longKey = 'Hello12345678901234567890123566890';
  const value2 = '{"name": "iphone", "model": "XS max", "manufacturer": "apple"}';
  const ttl2 = 1001;

  try {
    await storeInstance.create(longKey, value2, ttl2);
  } catch (error) {
    expect(error.message).toEqual('Invalid key');
  }
  done();
});

test('If Create is invoked for an existing key, an appropriate error must be returned', async done => {
  const key1 = 'food_details';
  const value1 = '{"name": "pizza", "type": "thin crust"}';
  const ttl1 = 1000;

  try {
    await storeInstance.create(key1, value1, ttl1);
  } catch (error) {
    expect(error.message).toEqual('Invalid key - Key already exists');
  }
  done();
});

test('A Read operation on a key can be performed by providing the key', async done => {
  const keyToRead = 'food_details';
  const value = await storeInstance.find(keyToRead);
  expect(value).toBeDefined();
  done();
});

test('A Delete operation can be performed by providing the key', async done => {
  const key = 'laptops';
  const value = '{"processor_type": "atom processor", "ram": "32 GB"}';
  const ttl = 1000;
  await storeInstance.create(key, value, ttl);

  await storeInstance.delete(key);

  const deletedKeyFindResult = await storeInstance.find(key);

  expect(deletedKeyFindResult).toEqual('Key not found');
  done();
});