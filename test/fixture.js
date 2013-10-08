var Fixture = require('../lib/arboria');

var mongodb = require('mongodb');
var Server = mongodb.Server;
var MongoClient = mongodb.MongoClient;

describe('Fixture', function(){

  it('can take a collectionName, fixture and db and get fixture data', function(done){
    var server = new Server('localhost', '27017', { native_parser: true });
    var _connection = new MongoClient(server);
    var fixture = new Fixture({collectionName: 'people', fixture: [{name: 'Shane', age: 25}], db: _connection.db('test')});
    var data = fixture.getFixtureData()
    data.should.eql([{ "name": "Shane", "age": 25 }]);
    done();
  });

  it('can add items to mongodb', function(done){
    var server = new Server('localhost', '27017', { native_parser: true });
    var _connection = new MongoClient(server);
    _connection.open(function(err, mongoClient) {
      var fixture = new Fixture({collectionName: 'people', fixture: {name: 'Shane', age: 25}, db: _connection.db('test')});
      fixture.load(done);
    });
  });

  it('can remove items from mongodb', function(done){
    var server = new Server('localhost', '27017', { native_parser: true });
    var _connection = new MongoClient(server);
    _connection.open(function(err, mongoClient) {
      var fixture = new Fixture({collectionName: 'people', fixture: {name: 'Shane', age: 25}, db: _connection.db('test')});
      fixture.load(function(){
        fixture.remove(done);
      });
    });
  });

  it('can take in an object instead of a filename', function(done){
    var server = new Server('localhost', '27017', { native_parser: true });
    var _connection = new MongoClient(server);
    _connection.open(function(err, mongoClient) {
      var fixture = new Fixture({collectionName: 'people', fixture: {name: 'Shane'}, db: _connection.db('test')});
      fixture.load(function(){
        fixture.remove(done);
      });
    });
  });

});
