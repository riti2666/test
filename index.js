
const express = require('express');
const app = express();
app.use(express.urlencoded());
app.use(express.json());
var mongoose = require('mongoose');

//Set up default mongoose connection
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;

const studentSchema = mongoose.Schema({
  name : String,
  age : Number
},
{timestamps: true});

module.exports = mongoose.model('Student' , studentSchema);

const teacherSchema = mongoose.Schema({
name : String,
age : Number,
teacherCourses : [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Course',
  required: true
}]
},
{timestamps: true});

module.exports = mongoose.model('Teacher' , teacherSchema);

const courseSchema = mongoose.Schema({
  name : String,
  credits : Number,
  courseTeachers : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }]
},
{timestamps: true});

module.exports = mongoose.model('Course' , courseSchema);


const bookSchema = mongoose.Schema({
  name: String,
  publishYear: Number,
  author: String,
  publisher: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Publisher',
     required: true
  }
},
{timestamps: true});

module.exports = mongoose.model('Book', bookSchema);

const publisherSchema = mongoose.Schema({
  name: String,
  location: String,
  publishedBooks: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Book'
  }]
},
{timestamps: true});

module.exports = mongoose.model('Publisher', publisherSchema);


// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Publisher = mongoose.model('Publisher', publisherSchema);
const Book = mongoose.model('Book', bookSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Course = mongoose.model('Course', courseSchema);
const Student = mongoose.model('Student', studentSchema);


// app.listen(3000, function() {
//   console.log('listening on 3000')
// });

/***
* @action ADD A NEW PUBLISHER
* @route http://localhost:3000/addPublisher
* @method POST
*/
app.post('/addPublisher', async (req, res) => {
  try {
    const publisherData = new Publisher(req.body);
    await publisherData.save();
    
    res.status(201).json({success:true, data: publisherData });

  } catch (err) {
      console.log(err);
     res.status(400).json({success: false, message:err.message});
  }
});

/***
* @action ADD A NEW PUBLISHER
* @route http://localhost:3000/addPublisher
* @method POST
*/
app.post('/addBook', async (req, res)=>{
  try {
     const book = new Book(req.body);
     await book.save();

     const publisher = await Publisher.findById({_id: book.publisher})
     publisher.publishedBooks.push(book);
     await publisher.save();

     res.status(200).json({success:true, data: book })

  } catch (err) {
     res.status(400).json({success: false, message:err.message})
  }
})

 /***
* @action ADD A NEW TEACHER
* @route http://localhost:3000/addTeacher
* @method POST
*/
app.post("/addTeacher", async (req, res) => {
try {
    const teacher = new Teacher(req.body);
    await teacher.save();

    const courseCount = teacher.teacherCourses.length;
    if (courseCount > 0) {
      for (var i = 0; i < courseCount; i++) {
          const _id = teacher.teacherCourses[i];
          const teacherCourse = await Course.findById({_id});
          if(teacherCourse)
          {
            teacherCourse.courseTeachers.push(teacher);
            await teacherCourse.save();
          }
      }
    }

  res.status(200).json({ success: true, data: teacher });
} catch (err) {
  console.log(err);
  res.status(400).json({ success: false, message: err.message });
}
});

 /***
* @action ADD A NEW COURSE
* @route http://localhost:3000/addCourse
* @method POST
*/
app.post("/addCourse", async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();

    const teacherCount = course.courseTeachers.length;
    if (teacherCount > 0) {
      for (var i = 0; i < teacherCount; i++) {
          const _id = course.courseTeachers[i];
          const courseTeacher = await Teacher.findById({_id});

          if(courseTeacher)
          {
            courseTeacher.teacherCourses.push(course);
            await courseTeacher.save();
          }
      }
    }

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/students', (req, res, next) => {
  console.log(req.body)
  const newStudent = req.body;

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var newStudents = [
      newStudent
    ];
    dbo.collection("students").insertMany(newStudents, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });
  
  res.status(200).json(newStudent)
})

app.get('/students', (req, res, next) => {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("students").find({}).toArray(function(err, result) {
      if (err) throw err;
      result.forEach(element => {
        console.log(element._id.value)
      });
      res.status(200).json(result);
      db.close();
    });
  });
  
})

app.delete('/students/:id', (req, res, next) => {
  var ObjectId = require('mongodb').ObjectId;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var result = "";
    const _id = ObjectId(req.params.id);
    dbo.collection("students").deleteOne({_id}, function(err, obj) {
      if (err) throw err;
      this.result = "Row was deleted!";
      res.status(200).json(this.result);
      db.close();
    });
    
  });
  
})

app.get('/students/id', (req, res, next) => {

  var ObjectId = require('mongodb').ObjectId;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("students").find({_id: new ObjectId(req.body._id)}).toArray(function(err, result) {
      if (err) throw err;
      result.forEach(element => {
        console.log(element._id.value)
      });
      res.status(200).json(result);
      db.close();
    });
  });
  
})

app.put('/students/:id', (req, res, next) => {

  var ObjectId = require('mongodb').ObjectId;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    const _id = ObjectId(req.params.id);
   var newvalues = { $set: req.body };
    dbo.collection("students").updateOne({_id}, newvalues, function(err, result) {
      if (err) {
        console.log(console.err);
        throw err;
      }
      
      res.status(200).json(result);
      db.close();
    });
  });
  
})

const port = 5000

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

