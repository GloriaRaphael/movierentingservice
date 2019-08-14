const fs = require("fs");
const database = JSON.parse(fs.readFileSync("./database.json"));

function viewMovies(movie) {
  console.log(`
          Title: ${movie.title}
          Genre: ${movie.genre}
          Synopsis: ${movie.synopsis}
          Duration: ${movie.duration}
          Size: ${movie.size}
          Price: ${movie.price}
          `);
}

module.exports = viewMovies;
