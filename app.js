const netchick = require("inquirer");
const viewMovie = require("./movies.js");
const admin = require("./admin.js");

const fs = require("fs");
const database = JSON.parse(fs.readFileSync("./database.json"));
// ===========================================VARIABLES=============================================================
/**
 *Important variables declared at the top here so therefore they are global to all scopes
 */
let onlineUser;
let movieObj = {};
let userObj = {};
welcome();
// ===========================================OPERATIONS TO CHOOSE FROM=============================================================
/**
 * These operations allow you to log in as a USER or as an ADMIN;
 * If logged in as a USER customer views/ access only user functionalities
 * And if logged in as an ADMIN, admin acesses functionalities under the admin scope
 */
function welcome() {
  console.clear();
  netchick
    .prompt([
      {
        type: "list",
        name: "welcome",
        message:
          "Welcome to Netchick and Flex.\n  because Netflix is overkill \n  Login as: ",
        choices: ["Admin", "User"],
      },
    ])
    .then(answer => {
      if (answer.welcome === "User") {
        return login();
      } else {
        return adminOperations();
      }
    });
}

function login() {
  console.clear();
  netchick
    .prompt([
      {
        type: "list",
        name: "login",
        message:
          "Sign in if you have an account\n  Create new account if you dont",
        choices: ["Sign in", "Create account"],
      },
    ])
    .then(answer => {
      if (answer.login == "Sign in") {
        return userName();
      } else if (answer.login == "Create account") {
        return createUserName();
      }
    });
}

function createUserName() {
  netchick
    .prompt([
      {
        type: "input",
        name: "username",
        message: "Enter your Username: ",
      },
    ])
    .then(answer => {
      if (answer.username != "") {
        userObj.username = answer.username;
        return createPassword();
      } else {
        console.log("Invalid Username!");
        return createUserName();
      }
    });
}

function createPassword() {
  netchick
    .prompt([
      {
        type: "input",
        name: "password",
        mask: true,
        message: "Enter your Password:  ",
        mask: true,
      },
    ])
    .then(answer => {
      if (answer.password != "") {
        userObj.password = answer.password;
        return createEmail();
      } else {
        console.log("Invalid Email!");
        return createPassword;
      }
    });
}

function createEmail() {
  netchick
    .prompt([
      {
        type: "input",
        name: "email",
        message: "Enter your Email:  ",
      },
    ])
    .then(answer => {
      if (answer.email != "") {
        userObj.email = answer.email;
        return createAccount();
      }
    });
}

function createAccount() {
  netchick
    .prompt([
      {
        type: "list",
        name: "create",
        message: "Do you want to create account? ",
        choices: ["Create account"],
      },
    ])
    .then(answer => {
      if (answer.create == "Create account") {
        userObj.rentedMovies = [];
        userObj.wallet = 0;
        database.users.push(userObj);
        updateJsonfile();
        console.log(`Sign Up successful!`);
        userName();
      }
    });
}

// ===========================================OPERATIONS OF THE USER=============================================================
/**
 * These operations of the Admin include;
 * =================Login to Netchick
 * =================View Movies
 * =================Rent Movies
 * =================Recharge Wallet
 * =================Return Movies
 */

//=================Verifies User and matches password, email to the users profile or account. This cannot be bipassed
function userExists(username) {
  for (user of database.users) {
    if (user.username == username) {
      onlineUser = user;
      return true;
    }
  }
  return false;
}
// Inquires user details like Username, Password, Email.
function userName() {
  console.clear();
  netchick
    .prompt([
      {
        type: "input",
        name: "username",
        message: "Please login to access you account\n  Enter your Username: ",
      },
    ])
    .then(answer => {
      if (userExists(answer.username)) {
        return userEmail();
      }
      console.log("Invalid username!");
      userName();
    });
}

function userEmail() {
  netchick
    .prompt([
      {
        type: "input",
        name: "email",
        message: "Enter your Email: ",
      },
    ])
    .then(answer => {
      if (onlineUser.email == answer.email) {
        return password();
      }
      console.log("Invalid email");
      console.clear();
      return userEmail();
    });
}

function password() {
  //console.clear();
  netchick
    .prompt([
      {
        type: "password",
        name: "password",
        mask: true,
        message: "Enter your Password: ",
      },
    ])
    .then(answer => {
      if (onlineUser.password == answer.password) {
        return services();
      }
      console.log("Invalid password");
      console.clear();
      return password();
    });
}

function services() {
  console.clear();
  netchick
    .prompt([
      {
        type: "list",
        name: "services",
        message:
          "Login Successful! \n  Welcome to Netchick and Flex\n  Please select a service ",
        choices: ["Rent Movie(s)", "View Rented Movie(s)", "Wallet"],
      },
    ])
    .then(answer => {
      if (answer.services === "Rent Movie(s)") {
        rentMovie();
      } else if (answer.services === "Wallet") {
        return walletoptions();
      } else if (answer.services === "View Rented Movie(s)") {
        return viewRentedMovies();
      }
    });
}

function walletoptions() {
  console.clear();
  netchick
    .prompt([
      {
        type: "list",
        name: "wallet",
        message: `Netchick and Flex Wallet `,
        choices: ["Check Balance", "TopUp account"],
      },
    ])
    .then(answer => {
      if (answer.wallet == "Check Balance") {
        return checkBalance();
      } else {
        return topUp();
      }
    });
}

function rentMovie() {
  // console.clear();
  netchick
    .prompt([
      {
        type: "list",
        name: "selection",
        message: "List of NetChick Movies: ",
        choices: database.movies.map((movie, index) => movie.title),
      },
    ])
    .then(answer => {
      database.movies.forEach(movie => {
        if (movie.title == answer.selection) {
          viewMovie(movie);
          return leaseMovie(movie);
        }
      });
    });
}

function leaseMovie(movie) {
  netchick
    .prompt([
      {
        type: "list",
        name: "lease",
        message: "Would you like to rent movie? ",
        choices: ["Rent Movie", "Back"],
      },
    ])
    .then(answer => {
      if (answer.lease == "Rent Movie") {
        if (onlineUser.wallet < movie.price) {
          console.log("Insuffient Balance to rent movie");
          insuffient();
        } else if (onlineUser.rentedMovies.includes(movie.title)) {
          console.log(
            "Sorry but you've rented this movie already! Try renting another movie."
          );
          rentMovie();
        } else {
          onlineUser.rentedMovies.push(movie.title);
          console.log("Movie rented!!!");
          onlineUser.wallet -= movie.price;
          updateJsonfile();
        }
      } else if (answer.lease == "Back") {
        console.clear();
        return rentMovie();
      }
    });
}

function viewRentedMovies() {
  netchick
    .prompt([
      {
        type: "list",
        name: "movieList",
        message: " List of Rented movies",
        choices: database.users.map(movie => movie.rentedMovies),
      },
    ])
    .then(answer => {
      console.log("Hello There");
    });
}
function insuffient() {
  netchick
    .prompt([
      {
        type: "list",
        name: "insuffient",
        message: "Would you like to toUp? ",
        choices: ["Yes", "No"],
      },
    ])
    .then(answer => {
      if (answer.insuffient == "Yes") {
        return topUp();
      }
      return quitProcess();
    });
}

function topUp() {
  netchick
    .prompt([
      {
        type: "number",
        name: "amount",
        message: "Enter Amount to top Up",
      },
    ])
    .then(answer => {
      onlineUser.wallet += answer.amount;
      updateJsonfile();
      console.log(
        `Congratulation ${
          answer.amount
        } Successfully credited to you Wallet \nNew balance: ${
          onlineUser.wallet
        }`
      );
      quitProcess();
    });
}

function checkBalance() {
  console.log(`Netchick account balance: `);
}

function quitProcess() {
  netchick
    .prompt([
      {
        type: "list",
        name: "option",
        message: `Would you like to go Home?`,
        choices: ["Yes sure", "No quit"],
      },
    ])
    .then(answer => {
      if (answer.option == "Yes sure") {
        return services();
      }
      console.log("Exiting Netchick... Bye!");
      quitProcess();
    });
}

// ===========================================OPERATIONS OF THE ADMIN=============================================================
/**
 * These operations of the Admin include;
 * =================Add Movie
 * =================Remove Movie
 * =================View Users
 * =================Remove Users
 */
function adminOperations() {
  console.clear();
  netchick
    .prompt([
      {
        type: "list",
        name: "operation",
        message: "Welcome Admin\n  Please select an operation: ",
        choices: [
          "View Users",
          "View Movie(s)",
          "Add Movie(s)",
          "Remove Movie",
          "Back",
        ],
      },
    ])
    .then(answer => {
      if (answer.operation === "View Users") {
        return viewUsers();
      } else if (answer.operation === "Remove Movie") {
        return removeMovie();
      } else if (answer.operation === "View Movie(s)") {
        return viewAllMovies();
      } else if (answer.operation === "Add Movie(s)") {
        return addTitle();
      }
    });
}

function back(message, action, action2) {
  netchick
    .prompt([
      {
        type: "list",
        name: "back",
        message: `${message}`,
        choices: ["Yes", "No"],
      },
    ])
    .then(answer => {
      if (answer.back == "Yes") {
        action;
      } else {
        action2;
      }
    });
}
function exit() {
  console.log("Exiting Netchick.");
}

function viewUsers() {
  console.clear();
  netchick
    .prompt([
      {
        type: "list",
        name: "users",
        message: "List of Users in Admin ",
        choices: admin.viewUsers,
      },
    ])
    .then(answer => {
      database.users.forEach(user => {
        if (user.username == answer.users) {
          admin.userProfile(user);
        }
      });
    });
}

function addTitle() {
  netchick
    .prompt([
      {
        type: "input",
        name: "title",
        message: "Enter title: ",
      },
    ])
    .then(answer => {
      if (answer.title != "" && !database.movies.includes(answer.title)) {
        movieObj.title = answer.title;
        return addGenre();
      } else {
        console.log("invalid entry");
        addTitle();
      }
    });
}

function addGenre() {
  netchick
    .prompt([
      {
        type: "input",
        name: "genre",
        message: "Enter genre: ",
      },
    ])
    .then(answer => {
      if (answer.genre != "") {
        newGenre = answer.genre.split(",");
        movieObj.genre = newGenre;
        return addSynopsis();
      } else {
        console.log("invalid entry");
        addGenre();
      }
      console.log(movieObj);
    });
}

function addSynopsis() {
  netchick
    .prompt([
      {
        type: "input",
        name: "synopsis",
        message: "",
      },
    ])
    .then(answer => {
      if (answer.synopsis != "") {
        movieObj.synopsis = answer.synopsis;
        addDuration();
      } else {
        console.log("invalid entry");
        addSynopsis();
      }
    });
}

function addDuration() {
  netchick
    .prompt([
      {
        type: "input",
        name: "duration",
        message: "Enter duration: ",
      },
    ])
    .then(answer => {
      if (answer.duration != "") {
        movieObj.duration = answer.duration;
        addSize();
      } else {
        console.log("invalid entry");
        addDuration();
      }
    });
}

function addSize() {
  netchick
    .prompt([
      {
        type: "input",
        name: "size",
        message: "Enter Size: ",
      },
    ])
    .then(answer => {
      if (answer.size != "") {
        movieObj.size = answer.size;
        addPrice();
      } else {
        console.log("invalid entry");
        addSize();
      }
    });
}

function addPrice() {
  netchick
    .prompt([
      {
        type: "number",
        name: "price",
        message: "Enter Price: ",
      },
    ])
    .then(answer => {
      if (answer.price != "") {
        movieObj.price = answer.price;
        //console.log("Thank you!!");
        commitMovie();
      } else {
        console.log("invalid entry");
        addPrice();
      }
    });
}

function commitMovie(movie) {
  netchick
    .prompt([
      {
        type: "list",
        name: "commit",
        message: "Do you want to commit movie?",
        choices: ["Yes", "No"],
      },
    ])
    .then(answer => {
      if (answer.commit == "Yes") {
        console.log(movieObj);
        database.movies.push(movieObj);
        updateJsonfile();
        console.log("Movie successfully uploaded!");
      }
    });
}

//=================================REMOVE MOVIE========================================================
function removeMovie() {
  netchick
    .prompt([
      {
        type: "list",
        name: "movieId",
        message: "Please select movie to remove",
        choices: admin.listMovies,
      },
    ])
    .then(answer => {
      movieid = answer.movieId;
      //checked inside MOVIES to make sure it exists and prints movie details
      database.movies.forEach(movie => {
        let moviecont = movie.title;
        //index = user.rentedMovies.indexOf(movieId);
        index = database.movies.indexOf(movie);
        if (answer.movieId == movie.title) {
          console.log(index);
          viewMovie(movie);
          confirmAction(movieid, index);
        }
      });
    });
}

function confirmAction(movieid, index) {
  netchick
    .prompt([
      {
        type: "list",
        name: "remove",
        message: "Do you want to remove movie?",
        choices: ["Yes", "No"],
      },
    ])
    .then(answer => {
      if (answer.remove == "Yes") {
        database.users.forEach(user => {
          if (user.rentedMovies.includes(movieid)) {
            return console.log(
              `Movie Unavailable! \nReason: ${
                user.username
              } Rented ${movieid}. `
            );
          } else {
            database.movies.splice(index, 1);
            updateJsonfile();
            return console.log(`${movieid} movie removed!!!`);
          }
        });
      }
    });
}
function viewAllMovies() {
  netchick
    .prompt([
      {
        type: "list",
        name: "movielist",
        message: "NetChick Movies:",
        choices: admin.listMovies,
      },
    ])
    .then(answer => {
      database.movies.forEach(movie => {
        if (answer.movielist == movie.title) {
          viewMovie(movie);
        }
      });
    });
}
function updateJsonfile() {
  fs.writeFileSync("./database.json", JSON.stringify(database, null, 1));
}
