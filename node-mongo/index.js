const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dbOps = require('./operations');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

//use assert to check for error null values
MongoClient.connect(url).then(client => {
  console.log('Connected to server');
  const db = client.db(dbname);

  dbOps.insertDocument(db, { name: "Pepper", description: "Pepper test"}, 'dishes')
  .then(result => {
    console.log('Insert Document: \n', result.ops);
    return dbOps.findDocuments(db, 'dishes')
  })
  .then(docs => {
    console.log('Found documents:\n', docs);
    return dbOps.updateDocument(db, {name: "Pepper"}, {description: "Update pepper test"}, 'dishes')
  })
  .then(result =>{
    console.log('Updated document:\n', result.result);
    return dbOps.findDocuments(db, 'dishes')
  })
  .then(docs => {
    console.log('Found documents:\n', docs);
    return db.dropCollection('dishes')
  })
  .then(result=> {
    console.log('Dropped collections: ', result);
    client.close();
  }).catch(err=> console.log(err));
}).catch(err=> console.log(err));
