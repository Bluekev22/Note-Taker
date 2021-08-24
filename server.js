//import all required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

const uuid = require('./helpers/uuid');
const app = express();
const PORT = process.env.port || 3001;

//add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//promisify read file
const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

//get html homepage
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

//function to read and append json file
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

//get notes html page
app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile('./db/notes.json').then((data) => res.json(JSON.parse(data)));
});

//post for adding notes
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };
    //call function with note
    readAndAppend(newNote, './db/notes.json');
    res.json(`Note added successfully 🚀`);
  } else {
    res.error('Error in adding note');
  }
});
//delete for deleting notes from json file
app.delete('/api/notes/:id', (req, res) => {
 const id = req.params.id;
  //reads json file
 fs.readFile('./db/notes.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    // Convert string into JSON object
    const parsedNotes = JSON.parse(data);
    //filter notes and remove the note to be deleted
    const notes = parsedNotes.filter(note => note.note_id !== id);
    
    

    // Write updated reviews without deleted note back to the file
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

//get homepage for all other routes
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);