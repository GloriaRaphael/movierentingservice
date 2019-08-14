const fs = require("fs");
const database = JSON.parse(fs.readFileSync("./database.json"));

class Admin {
  static get viewUsers() {
    return database.users.map(user => user.username);
  }
  static userProfile(user) {
    console.log(`
    Username: ${user.username}
    Email: ${user.email}
    Rented Movies: ${user.rentedMovies}
    Wallet: ${user.wallet}
    `);
  }
  static addMovie(movie) {}

  static listMovies() {
    return database.movies.map(movie => movie.title);
  }
}

module.exports = Admin;
