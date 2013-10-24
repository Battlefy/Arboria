var fs = require('fs');
var _ = require('underscore');
var path = require('path');

var defaults = {
  fixture: null,
  db: null,
  fixtureDir: 'test/fixtures'
};

function Fixture (config){
  this._config = _.extend(defaults, config);
  this._validate(this._config);
  this._setCollectionName();
};

Fixture.prototype._validate = function(config) {
  if(config.fixture === null){
    throw new Error("fixture name not set");
  }
  else if(config.db === null){
    throw new Error("db not set");
  }
};

Fixture.prototype._setCollectionName = function(){
  if(this._config.collectionName === undefined) {
    this._config.collectionName = path.basename(this._config.fixture);
  }
}

Fixture.prototype.getFixtureData = function(){
  return this._fileToObject(this._config.fixture);
}

Fixture.prototype._fileToObject = function(file, callback) {
  if (_.isString(this._config.fixture)){
    var filePath = path.resolve(process.cwd(), this._config.fixtureDir, file);
    var data = require(filePath);
    return data;
  } else {
    return file;
  }
};

Fixture.prototype.load = function(callback){

  // throw an error if not connected
  if(!this._config.db.serverConfig.isConnected()) {
    throw new Error('Cannot load fixture. Database not connected.');
  }

  // do nothing if already loaded
  if(this.data) { return; }

  // create the collection and data. Save the
  // data so we can remove it after.
  this.collection = this.collection || this._config.db.collection(this._config.collectionName);
  this.data = this._fileToObject(this._config.fixture);

  // insert the data.
  if(_.isArray(this.data)){
    var done = _.after(this.data.length, callback)
    for (var i = 0; i < this.data.length; i += 1) {
      this.collection.insert(this.data[i], done);
    }
  } else {
    this.collection.insert(this.data, callback);
  }
};

Fixture.prototype.remove = function(callback){

  // throw an error if not connected
  if(!this._config.db.serverConfig.isConnected()) {
    throw new Error('Cannot load fixture. Database not connected.');
  }

  // if there is no loaded data, do nothing.
  if(!this.data) { return; }
  delete this.data;

  // remove the loaded data
  if(_.isArray(this.data)){
    var done = _.after(this.data.length, callback)
    for (var i = 0; i < this.data.length; i += 1) {
      this.collection.remove(this.data[i], done);
    }
  } else {
    this.collection.remove(this.data, callback);
  }
};

Fixture.prototype.truncate = function(callback){

  // throw an error if not connected
  if(!this._config.db.serverConfig.isConnected()) {
    throw new Error('Cannot load fixture. Database not connected.');
  }

  // remove all the data from the collection
  this.collection.remove(callback);
};

Fixture.prototype.drop = function(callback){

  // throw an error if not connected
  if(!this._config.db.serverConfig.isConnected()) {
    throw new Error('Cannot load fixture. Database not connected.');
  }

  // drop the collection
  this.collection.drop(callback);
};

module.exports = Fixture;
