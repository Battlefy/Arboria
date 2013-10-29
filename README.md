Arboria
=======

A fixture loader for mongo (that doesn't db.open)


Example
=======

```javascript

var arboria = require('arboria');

var mongodb = require('mongodb');
var Server = mongodb.Server;
var MongoClient = mongodb.MongoClient;

var server = new Server('localhost', '27017', { native_parser: true });
var connection = new MongoClient(server);

connection.open(function(err, mongoClient) {
  
  var a = arboria(mongoClient.db('test-db'));
  var fixture = a.fixture('test-collection');

});

```


Add Some Data
-------------

```javascript
  
fixture
  .add({ name: "Shane", age: 25 })
  .add({ name: "Robert", age: 23 })
  .done(function(err, data) {
    console.log('added Shane and Robert');
  });

```


Remove Some Data
----------------

```javascript

fixture
  .remove({ name: "Robert", age: 23 })
  .done(function(err, data) {
    console.log('removed Robert.');
  });

```


Do Both at the Same Time
------------------------

```javascript

fixture
  .add('justin')
  .remove({ name: "Shane", age: 25 })
  .done(function(err, data) {
    console.log('added Justin from \'/test/fixtures/justin.json\' and removed Shane.');
  });

```



