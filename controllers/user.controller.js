

var db = require("../database-mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

////// 
var selectAll = function (req, res) {
  db.query("SELECT * FROM users ", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
};
//////////////// signup for users 
var signup = function (req, res) {
  var {
    userName,
    email,
    password,
    phoneNumber,
  } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send({ msg: err });
    } else {
      db.query(
        "INSERT INTO users (userName,email,password,phoneNumber) VALUES (?,?,?,?)",
        [
          userName,

          email,
          hash,
          phoneNumber,
          
        ],
        (err, items) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send(items);
          }
        }
      );
    }
  });
};
///////////// login for Users

var login = function (req, res) {
  var { email } = req.body;
  db.query(`SELECT * FROM doctor WHERE email = ?`, [email], (err, result) => {
    // user does not exists
    if (err) {
      throw err;
    }
    if (!result.length) {
      return res.status(401).send({
        msg: "Email or password is incorrect!",
      });
    }
    // check password
    bcrypt.compare(
      req.body.password,
      result[0]["password"],
      (bErr, bResult) => {
        // wrong password
        if (bErr) {
          throw bErr;
          return res.status(401).send({
            msg: "Email or password is incorrect!",
          });
        }
        if (bResult) {
          const token = jwt.sign(
            { id: result[0].id },
            "the-super-strong-secrect",
            { expiresIn: "1h" }
          );

          return res.status(200).send({
            token,
            user: result[0],
          });
        }
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }
    );
  });
};


module.exports = { selectAll,signup,login };
