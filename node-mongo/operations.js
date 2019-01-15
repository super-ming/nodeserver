const assert = require('assert');

//export insertDocument method from this node module
exports.insertDocument = (db, document, collection, callback) => {
  const col = db.collection(collection);
  return col.insert(document);
}
exports.findDocuments = (db, collection, callback) => {
  const col = db.collection(collection);
  //add empty JavaScript object that will match with alll the documents in the collection
  return col.find({}).toArray();
}
exports.removeDocument = (db, document, collection, callback) => {
  const col = db.collection(collection);
  return col.deleteOne(document);
}
exports.updateDocument = (db, document, update, collection, callback) => {
  const col = db.collection(collection);
  return col.updateOne(document, { $set: update }, null);
}
