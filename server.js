/*********************************************************************************
*  WEB422 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Wai Hing William Tse   Student ID: 149 992 216     Date: 5/18/2023
*  Cyclic Link: https://blue-violet-stingray-wrap.cyclic.app
*
********************************************************************************/ 
const express = require('express');
const cors = require('cors');
const env = require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const MoviesDB = require("./modules/moviesDB.js");
const { title } = require('process');
const db = new MoviesDB();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

//  Middleware and supports
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));

// Init message
app.get('/', (req, res) => {
    //res.json('API Listening');
    res.sendFile(path.join(__dirname, "/index.html"))
  });

// This route uses the body of the request to add a new "Movie" document to the collection and return the newly created movie object / fail message to the client
app.post('/api/movies', (req, res) => {
    if (req.body) {
        db.addNewMovie(req.body).then((data) => {
            res.status(201).json({ message: `Successfully added movie: ${data.title} to the collection` });
        }).catch ((err) => {
            res.status(500).json({message: 'Failed to add the movie ' + err});
        })
    }
});

// Get All, this route must accept the numeric query parameters "page", "perPage", and an optional string parameter "title" to return movie objects
app.get('/api/movies', (req, res) => {
    let {page, perPage, title = null} = req.query;
    page = parseInt(req.query.page);
    perPage = parseInt(req.query.perPage);
    
    if (page && perPage) {
        db.getAllMovies(page, perPage, title).then((data) => {
            if (data.length > 0) {
                res.status(200).json(data);
            } else {
                res.send({ message: 'Movie title not found' });
            }
        }).catch((err) => {
            res.status(500).send({ message: 'Internal server error. ' + err });
        });
    } else {
        res.send({ message: 'Please input either 1.) page, perPage and/or title  2.) movie ID in the query'});
    }
});

// Get one, This route must accept a route parameter that represents the _id of the desired movie object
app.get('/api/movies/:id', (req, res) => {    
    let searchId = req.params.id;
    
    if (searchId) {
        db.getMovieById(searchId).then((data) => {
            res.status(200).json(data);
        }).catch((err) => {
            res.status(500).send({ message: 'Movie ID not found. ' + err });
        });
    }
});

// Edit existing, this route must accept a route parameter that represents the _id of the desired movie object and update the object with the data inputs
app.put('/api/movies/:id', async (req, res) => {
    let changeId = req.params.id;    
    let changeData = req.body;

    if (changeId && changeData) {
        db.updateMovieById(changeData, changeId).then((data) => {
            res.status(200).send({ message: `Successfully edited the content of movie ID: ${changeId} from the collection` });
        }).catch ((err) => {
            res.status(500).send({message: 'Failed to update movie. ' + err});
        });
    }
});

// Delete, This route must accept a route parameter that represents the _id of the desired movie object and delete the object as found
app.delete('/api/movies/:id', async (req, res) => {
    let deleteId = req.params.id;

    if (deleteId) {
        db.deleteMovieById(deleteId).then((data) => {
            if (data.deletedCount) {
                res.status(200).send({ message: `Successfully deleted movie ID: ${deleteId} from the collection` });
            } else {
                res.send({message: 'No content is found'});
            }
        }).catch ((err) => {
            res.status(500).send({message: 'Failed to delete movie ' + err});
        });
    }
});

// 404 not found status
app.use((req, res) => {
    res.status(404).send('Resource not found');
  });

// Initialize the module before the server starts
db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
  app.listen(HTTP_PORT, ()=>{
      console.log(`server listening on: ${HTTP_PORT}`);
  });
}).catch((err)=>{
    console.log(err);
});
