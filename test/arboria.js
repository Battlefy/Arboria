
// modules
var MongoClient = require('mongodb').MongoClient;

// libs
var arboria = require('../');
var Connection = arboria.Connection;
var Fixture = arboria.Fixture;

// setup a database connection
before(function(done) {
  var _this = this;
  var url = 'mongodb://localhost:27017/arboria-test';
  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    }
    _this.db = db;
    done();
  });
});


describe('arboria', function() {

  it('takes a database and returns a Connection instance', function() {
    var connection = arboria(this.db);
    connection.should.be.an.instanceOf(Connection);
  });
});


describe('connection.fixture', function() {

  beforeEach(function() {
    this.connection = arboria(this.db);
  });

  it('takes a collection name and returns a Fixture instance', function() {
    var fixture = this.connection.fixture('test');
    fixture.should.be.an.instanceOf(Fixture);
  });
});


describe('fixture.add', function() {

  beforeEach(function() {
    this.connection = arboria(this.db);
    this.fixture = this.connection.fixture('test');
  });

  it('takes a doc', function() {
    this.fixture.add({ name: 'Shane', age: 25 });
  });

  it('takes an array of docs', function() {
    this.fixture.add([
      { name: 'Shane', age: 25 },
      { name: 'Robert', age: 23 }
    ]);
  });

  it('is chainable', function() {
    var fixture = this.fixture.add({ name: 'Shane', age: 25 });
    fixture.should.equal(this.fixture);
  });

  it('increments pending tasks', function() {
    this.fixture
      .add({ name: 'Shane', age: 25 })
      .add({ name: 'Robert', age: 23 })
    this.fixture.pending.should.equal(2);
  });

  it('calls callbacks passed to done when all pending tasks are finished', function(done) {
    var _this = this;
    this.fixture
      .add({ name: 'Shane', age: 25 })
      .add({ name: 'Robert', age: 23 })
      .done(function(err, fixtureData) {
        if(err) { throw err; }
        _this.fixture.pending.should.equal(0);
        _this.fixture.callbacks.length.should.equal(0);
        done();
      });
  });

  it('extracts data from json fixture files', function(done) {
    this.fixture.add('justin').done(function(err, fixtureData) {
      fixtureData[0].name.should.equal('Justin');
      fixtureData[0].age.should.equal(28);
      done();
    });
  });

  it('adds the data to mongo', function(done) {
    var _this = this;
    this.fixture.add({ name: 'Shane', age: 25 }).done(function(err) {
      if(err) { throw err; }
      _this.fixture.collection.findOne({ name: 'Shane' }, function(err, doc) {
        doc._id.should.be.OK;
        doc.name.should.equal('Shane');
        done();
      });
    });
  });
});


describe('fixture.remove', function() {

  beforeEach(function(done) {
    var _this = this;
    this.connection = arboria(this.db);
    this.fixture = this.connection.fixture('test');
    this.fixture.add([
      { name: 'Shane', age: 25 },
      { name: 'Robert', age: 23 }
    ]).done(done);
  });

  it('takes a doc', function() {
    this.fixture.remove({ name: 'Shane', age: 25 });
  });

  it('takes an array of docs', function() {
    this.fixture.remove([
      { name: 'Shane', age: 25 },
      { name: 'Robert', age: 23 }
    ]);
  });

  it('is chainable', function() {
    var fixture = this.fixture.remove({ name: 'Shane', age: 25 });
    fixture.should.equal(this.fixture);
  });

  it('increments pending tasks', function() {
    this.fixture
      .remove({ name: 'Shane', age: 25 })
      .remove({ name: 'Robert', age: 23 })
    this.fixture.pending.should.equal(2);
  });

  it('calls callbacks passed to done when all pending tasks are finished', function(done) {
    var _this = this;
    this.fixture
      .remove({ name: 'Shane', age: 25 })
      .remove({ name: 'Robert', age: 23 })
      .done(function(err, fixtureData) {
        if(err) { throw err; }
        _this.fixture.pending.should.equal(0);
        fixtureData.length.should.equal(0);
        _this.fixture.callbacks.length.should.equal(0);
        done();
      });
  });

  it('removes everthing added to the fixture if no query is passed', function(done) {
    var _this = this;
    this.fixture.remove().done(function(err, fixtureData) {
      if(err) { throw err; }
      _this.fixture.pending.should.equal(0);
      fixtureData.length.should.equal(0);
      _this.fixture.callbacks.length.should.equal(0);
      done();
    });
  });

  it('does not remove data that it was not asked to remove', function(done) {
    var _this = this;
    this.fixture
      .remove({ name: 'Shane', age: 25 })
      .done(function(err, fixtureData) {
        if(err) { throw err; }
        fixtureData.length.should.equal(1);
        fixtureData[0].name.should.equal('Robert');
        fixtureData[0].age.should.equal(23);
        done();
      });
  });

  it('removes the data from mongo', function(done) {
    var _this = this;
    this.fixture.remove({ name: 'Shane', age: 25 }).done(function(err) {
      if(err) { throw err; }
      _this.fixture.collection.findOne({ name: 'Shane' }, function(err, doc) {
        if(err) { throw err; }
        (!doc).should.be.true;
        done();
      });
    });
  });
});


describe('fixture.truncate', function() {

  beforeEach(function(done) {
    var _this = this;
    this.connection = arboria(this.db);
    this.fixture = this.connection.fixture('test');
    this.fixture.add([
      { name: 'Shane', age: 25 },
      { name: 'Robert', age: 23 }
    ]).done(done);
  });

  it('is chainable', function() {
    var fixture = this.fixture.truncate();
    fixture.should.equal(this.fixture);
  });

  it('increments pending tasks', function() {
    this.fixture.truncate().truncate();
    this.fixture.pending.should.equal(2);
  });

  it('clears out the entire fixture', function(done) {
    var _this = this;
    this.connection = arboria(this.db);
    this.fixture = this.connection.fixture('test');
    this.fixture.truncate().done(function(err, fixtureData) {
      fixtureData.length.should.equal(0);
      done();
    });
  });

  it('clears out the entire mongo collection', function(done) {
    var _this = this;
    this.connection = arboria(this.db);
    this.fixture = this.connection.fixture('test');
    this.fixture.truncate().done(function(err, fixtureData) {
      _this.fixture.collection.count(function(err, count) {
        if(err) { throw err; }
        count.should.equal(0);
        done();
      });
    });
  });

});

