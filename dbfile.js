var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var allStudents = [
    { name: 'Riti', age: '19'},
    { name: "Jack", age: "20"}
  ];
  dbo.collection("students").insertMany(allStudents, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});