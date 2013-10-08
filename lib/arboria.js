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
  this._setCollectionName()
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
  this._config.collectionName = path.basename(this._config.fixture);
}


Fixture.prototype.getFixtureData = function(){
  return this._fileToObject(this._config.fixture);
}

Fixture.prototype._fileToObject = function(file, callback) {
  var filePath = path.resolve(process.cwd(), this._config.fixtureDir, file);
  var data = require(filePath);
  return data;
};

Fixture.prototype.load = function(callback){
  if(this._config.db.serverConfig.isConnected()) {
    var collection = this._config.db.collection(this._config.collectionName);
    var fixtureData = this._fileToObject(this._config.fixture);
    if(_.isArray(fixtureData)){
      var done = _.after(fixtureData.length, callback)
      for (var i = 0; i < fixtureData.length; i += 1) {
        collection.insert(fixtureData[i], done);
      }
    } else {
      collection.insert(fixtureData, callback);
    }
  }
};

Fixture.prototype.remove = function(callback){
  if(this._config.db.serverConfig.isConnected()) {
    var collection = this._config.db.collection(this._config.collectionName);
    collection.drop(callback);
  }
}

module.exports = Fixture;
