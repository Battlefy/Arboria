var Fixture = require('../lib/arboria');

var mongodb = require('mongodb');
var Server = mongodb.Server;
var MongoClient = mongodb.MongoClient;

describe('Fixture', function(){

  it('can take a file path', function(done){
    var fixture = new Fixture({fixture: 'people', db: ''})
    var data = fixture.getFixtureData()
    data.should.eql([{ "name": "Shane", "age": 25 }]);
    done();
  });

  it('can add items to mongodb', function(done){
    var server = new Server('localhost', '27017', { native_parser: true });
    var _connection = new MongoClient(server);
    _connection.open(function(err, mongoClient) {
      var fixture = new Fixture({fixture: 'people', db: _connection.db('test')});
      fixture.load(done);
    });
  });

  it('can remove items from mongodb', function(done){
    var server = new Server('localhost', '27017', { native_parser: true });
    var _connection = new MongoClient(server);
    _connection.open(function(err, mongoClient) {
      var fixture = new Fixture({fixture: 'people', db: _connection.db('test')});
      fixture.load(function(){
        fixture.remove(done);
      });
    });
  });

});
