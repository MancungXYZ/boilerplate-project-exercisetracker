const express = require('express')
const app = express()
const cors = require('cors')
let mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
let bodyParser = require('body-parser');
require('dotenv').config()

// Basic Configuration
const port = process.env.PORT || 3001;

// Inisialisasi schema
const Schema = mongoose.Schema;

// Buat schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
});

const exerciseSchema = new Schema({
  user: {
    type: ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  unix: {
    type: Number
  },
});

// inisialisasi model
let User = mongoose.model('users', userSchema);
let Exercise = mongoose.model('exercises', exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async function(req, res) {
  try {
    const cariPengguna = await User.find().exec()
    res.send(cariPengguna)
  }
  catch (e) {
    console.log('Terjadi kesalahan get api user');
  }
})

app.get('/api/users/:_id/exercises', async function(req, res) {
  const id_pengguna = req.params._id;
  try {
    const cariPengguna = await User.findById({
      _id : id_pengguna
    }).exec()
    res.send(cariPengguna)
  }
  catch (e) {
    console.log('Terjadi kesalahan get api user');
  }
})

app.post('/api/users', async function(req, res) {
  const username = req.body.username;
  console.log(username)

  let newUser = new User({
    'username': username,
  })

  try {
    await newUser.save()
    res.json({
      username: newUser.username,
      _id: newUser._id
    })
  }
  catch (e) {
    console.log('Terjadi kesalahan post api user');
  }
})

app.post('/api/users/:_id/exercises', async function (req, res) {
  let id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  let unix, newExercise;

  // Pengecekan date (membuat date saat ini jika date tidak dikirimkan dari client)
  if (!date) {
    date = new Date().toDateString()
    unix = new Date().getTime();
  } else {
    unix = new Date().getTime();
    date = new Date(date).toDateString()
  }

  // Menambil data user
  let user = await User.findById(id);

  // Mengembalikan error jika data user tidak ditemukan
  if (!user) {
    return res.json({
      error: "Invalid User"
    });
  }

  try {
    // Membuat exercise baru
    let newExerciseObj = new Exercise({
      user: new ObjectId(id),
      date: date,
      unix: unix,
      duration: duration,
      description: description,
    });

    // Menyimpkan exercise baru
    newExercise = await newExerciseObj.save();
  } catch (e) {
    console.error(e);
  }

  // Mengembalikan data user dengan data exercise terkait
  return res.send({
    _id: user._id,
    username: user.username,
    date: newExercise.date,
    duration: newExercise.duration,
    description: newExercise.description
  });
})

// database
let MONGO_URI = "mongodb+srv://mancung:Domesherpa@cluster0.ow4xrje.mongodb.net/?retryWrites=true&w=majority";

const start = async () => {
  try {
    // menghubungkan ke database
    await mongoose.connect(MONGO_URI);

    app.listen(port, function() {
      console.log(`Listening on port ${port}`);
      console.log('Databse terhubung');
    });
  } catch (e) {
    console.log(e.message)
  }
}

start();