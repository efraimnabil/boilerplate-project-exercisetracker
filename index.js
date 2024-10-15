const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()


app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = [];
const exercises = [];


app.post('/api/users', function (req, res) {
  console.log("HI");
  const { username } = req.body;
  const newUser = { username, _id: Date.now().toString() };
  users.push(newUser);
  res.json(newUser);
})

app.get('/api/users', function (req, res) {
  res.json(users)
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find((user) => user._id == _id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const newExercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(ex => ex.userId === _id);

  if (from) userExercises = userExercises.filter(ex => new Date(ex.date) >= new Date(from));
  if (to) userExercises = userExercises.filter(ex => new Date(ex.date) <= new Date(to));
  if (limit) userExercises = userExercises.slice(0, parseInt(limit));

  res.json({
      username: user.username,
      count: userExercises.length,
      _id: user._id,
      log: userExercises.map(ex => ({
          description: ex.description,
          duration: ex.duration,
          date: ex.date
      }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
