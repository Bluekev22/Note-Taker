const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

const uuid = require('./helpers/uuid');
const app = express();
const PORT = process.env.port || 3001;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );


app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile('./db/notes.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };

    readAndAppend(newNote, './db/notes.json');
    res.json(`Note added successfully 🚀`);
  } else {
    res.error('Error in adding note');
  }
});

app.delete('/api/notes/:id', (req, res) => {
 const id = req.params.id;
 

 fs.readFile('./db/notes.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    // Convert string into JSON object
    const parsedNotes = JSON.parse(data);
    notes = parsedNotes.filter(note => note.note_id !== id);
    
    

    // Write updated reviews back to the file
    fs.writeFile(
      './db/notes.json',
      JSON.stringify(notes, null, 4),
      (writeErr) =>
        writeErr
          ? console.error(writeErr)
          : console.info('Successfully updated notes!')
    );
  }

})});


app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);