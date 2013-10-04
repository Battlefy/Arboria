Mingo
=====

A fixture loader for mongo (that doesn't db.open)


Example
=======

```javascript
    var Fixture = require('fixture');

    var mongodb = require('mongodb');
    var Server = mongodb.Server;
    var MongoClient = mongodb.MongoClient;

    var server = new Server('localhost', '27017', { native_parser: true });
    _connection = new MongoClient(server);
    _connection.open(function(err, mongoClient) {
      var fixture = new Fixture({fixture: 'people', db: mongoClient.db('test')});
      fixture.load(function(){
        console.log('loaded fixture!')
        fixture.remove(function(){
          console.log('removed fixture!');
        });
      });
    });
```
