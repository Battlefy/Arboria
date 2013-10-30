
// modules
var _ = require('underscore');

// libs
var Fixture = require('./fixture');


function Connection(database, opts) {
  if(!database) { throw new Error('Database not given.'); }
  opts = opts || {};
  opts.fixturesPath = opts.fixturesPath || 'test/fixtures';
  this.database = database;
  this.opts = opts;
}

Connection.prototype.fixture = function(collectionName) {
  if(!collectionName) { throw new Error('Collection name not given.'); }
  var collection = this.database.collection(collectionName);
  return new Fixture(this.database, collection, this.opts);
};


module.exports = Connection;