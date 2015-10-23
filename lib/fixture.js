
// modules
var fs = require('fs');
var _ = require('underscore');
var path = require('path');


function Fixture(database, collection, opts) {
  if(!database) { throw new Error('Database not given.'); }
  if(!collection) { throw new Error('Collection not given.'); }
  this.database = database;
  this.collection = collection;
  this.opts = opts || {};
  this.data = [];
  this.pending = 0;
  this.callbacks = [];
};

Fixture.prototype.done = function(callback) {
  if(!_.isFunction) { throw new Error('Callbacks must be functions.'); }
  this.callbacks.push(callback);
  return this;
};

Fixture.prototype.add = function(data) {
  var _this = this;

  // if the data is an array, then self execute on
  // each object within that array.
  if(_.isArray(data)) {
    for(var i = 0; i < data.length; i += 1) {
      this.add(data[i]);
    }
    return this;
  }

  // if the stat is a single object then resolve
  // the data if stored in files.
  if(_.isString(data)) {
    try {
      data = this._fetchFromFile(data);
    } catch (err) {
      this._finishTask(err);
      return this;
    }
  }

  // add one to pending count
  this._beginTask();

  // insert the data into the collection.
  this.collection.insert(data, function(err, data) {
    if(err) {
      _this._finishTask(new Error('Cannot add fixture data. ' + err.message));
      return;
    }
    _this.data.push(data.ops[0]);
    _this._finishTask();
  });

  // return to allow chaining.
  return this;
};

Fixture.prototype.remove = function(data) {
  var _this = this;

  // if the data is an array, then self execute on
  // each object within that array.
  if(_.isArray(data)) {
    var next = _.after(data.length, function() {
      _this._finishTask();
    });
    data.forEach(function(item, i) {
      _this.remove(item, function(err) {
        if(err) { _this._finishTask(err); return; }
        next();
      });
    });
    return this;
  }

  // if the stat is a single object then resolve
  // the data if stored in files.
  if(_.isString(data)) {
    try {
      data = this._fetchFromFile(data);
    } catch (err) {
      this._finishTask(err);
      return this;
    }
  }

  // add one to pending count
  this._beginTask();

  // ensure the data was loaded, then remove it
  var ok = false;
  for(var i = 0; i < this.data.length; i += 1) {
    if(!_.isEqual(data, _.omit(this.data[i], '_id'))) { continue; }
    this.data.splice(i, 1);
    ok = true;
    break;
  }
  if(data && !ok) {
    this._finishTask(new Error('Cannot remove data that was not added to the fixture.'));
    return this;
  }

  // remove all the data if no specific data is
  // specified.
  if(!data) { this.data.length = 0; }

  // remove the data into the collection.
  this.collection.remove(data, function(err, data) {
    if(err) {
      _this._finishTask(new Error('Cannot remove fixture data. ' + err.message));
      return _this;
    }
    _this._finishTask();
  });

  // return to allow chaining.
  return this;
};

Fixture.prototype.truncate = function() {
  var _this = this;

  // begin task
  this._beginTask();

  // remove all the data from the collection
  this.collection.remove(function(err) {
    if(err) { _this._finishTask(err); return; }
    _this._finishTask();
  });

  // return to allow chaining.
  return this;
};

Fixture.prototype.drop = function(callback) {
  var _this = this;

  // begin task
  this._beginTask();

  // drop the collection
  this.collection.drop(function(err) {
    if(err) { _this._finishTask(err); return; }
    _this._finishTask();
  });

  // return to allow chaining.
  return this;
};

Fixture.prototype._fetchFromFile = function(filePath) {
  filePath = path.resolve(process.cwd(), this.opts.fixturesPath, filePath);
  return require(filePath);
};

Fixture.prototype._beginTask = function() {
  this.pending += 1;
}

Fixture.prototype._finishTask = function(err) {
  var _this = this;
  process.nextTick(function() {
    // if an error occured callback now
    if(err) {
      _this.pending = 0;
      var callbacks = _this.callbacks.slice(0);
      for(var i = 0; i < callbacks.length; i += 1) {
        callbacks[i](err);
      }
      _this.callbacks.length = 0;
      return;
    }

    // decrement the number of pending opts.
    // Exit if there are still tasks pending.
    _this.pending -= 1;
    if(_this.pending > 0) { return; }

    // if all pending tasks are complete then
    // execute the callbacks.
    var callbacks = _this.callbacks.slice(0);
    _this.callbacks.length = 0;
    for(var i = 0; i < callbacks.length; i += 1) {
      callbacks[i](undefined, _this.data);
    }
  });
};

module.exports = Fixture;
