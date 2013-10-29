
var Connection = require('./connection');
var Fixture = require('./fixture');

module.exports = exports = function(db) {
  return new Connection(db);
};

exports.Connection = Connection;
exports.Fixture = Fixture;
