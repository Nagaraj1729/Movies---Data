const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname,  "moviesData.db");

let db = null;
const initializeDBAndServer = async ()=> {
   try{
        db = await open({
                filename : dbPath,
                driver : sqlite3.Database
            });

        app.listen(3000, ()=>{
            console.log("Server is running at http://localhost:3000/")
        })
   }catch(e){
       console.log(`DB Error - ${e.message}`);
       process.exit(1);
   }
}

initializeDBAndServer();

const convertToCamelCase = (dbObj) => {
    return {
        movieId : dbObj.movie_id,
        directorId : dbObj.director_id,
        movieName : dbObj.movie_name,
        leadActor : dbObj.lead_actor        

    }
}

//Get all movie names API
app.get("/movies/", async (request, response) => {
    const getAllMoviesNamesQuery = 
        `
            SELECT 
               movie_name
            FROM 
                movie
        `
    const movies = await db.all(getAllMoviesNamesQuery);
    const camelCaseData = movies.map(movieObj => 
        {
            return {movieName : movieObj.movie_name}
        });
    response.send(camelCaseData) 
})

//Add new movie API
app.post("/movies/", async (request, response) => {
    const movieDetails = request.body;
    const {
        directorId,
        movieName,
        leadActor
    } = movieDetails;

    const addMovieQuery = 
        `
            INSERT INTO 
                movie (director_id, movie_name, lead_actor)
            VALUES (
                ${directorId},
                '${movieName}',
                '${leadActor}'
            )
        `
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added")
});

//Get Movie by movieId
app.get("/movies/:movieId", async (request, response) => {
    const { movieId } = request.params;
    const getMovieByIdQuery = 
        `
            SELECT
                *
            FROM
                movie
            WHERE
                movie_id = ${movieId}
                          
         `
    const dbResponse = await db.get(getMovieByIdQuery);
    const movieData = convertToCamelCase(dbResponse);
    response.send(movieData);
    
        
});

//Update Movie Data API
app.put("/movies/:movieId/", async (request, response) => {
    const {movieId} = request.params;
    const movieDetails = request.body;
    const {
        directorId,
        movieName,
        leadActor
    } = movieDetails;

    const updateMovieDataQuery = 
        `
            UPDATE
                movie
            SET
                director_id = ${directorId},
                movie_name = '${movieName}',
                lead_actor = '${leadActor}'
            WHERE
                movie_id = ${movieId}
        `
    await db.run(updateMovieDataQuery);
    response.send("Movie Details Updated")
});

//Delete Movie by movieId API
app.delete("/movies/:movieId/", async (request, response) => {
    const { movieId } = request.params;
    const deleteMovieQuery = 
        `
            DELETE FROM
                movie
            WHERE
                movie_id = ${movieId}
        `
    await db.run(deleteMovieQuery);
    response.send("Movie Removed")
});

//Get All Directors API
app.get("/directors/", async (request, response) => {
    const getAllDirectorsQuery = 
        `
            SELECT
                *
            FROM
                director
            ORDER BY
                director_id
        `
    const dbResponse = await db.all(getAllDirectorsQuery);
    const directorsList = dbResponse.map(director => {
           return {
                        directorId : director.director_id,
                        directorName : director.director_name                
                    }
        });
    response.send(directorsList);
});

//get Director's all Movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
    const { directorId } = request.params;
    const getMoviesByDirectorQuery = 
        `
            SELECT 
                movie_name
            FROM
                movie
            WHERE
                director_id = ${directorId}
        `
    const moviesByDirector = await db.all(getMoviesByDirectorQuery);
     const movieNamesWithCamelCase = moviesByDirector.map(movieObj => 
        {
            return {movieName : movieObj.movie_name}
        });
    response.send(movieNamesWithCamelCase) 
});

module.exports = app;