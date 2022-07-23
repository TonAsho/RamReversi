var express = require('express');
const session = require('express-session');
var router = express.Router();
const bcrypt = require("bcrypt");

const pool = require("../db/pool");

router.post('/', (req, res) => {
    let email = req.body.email;
    let name = req.body.name;
    let password = req.body.password;
    let isEmail = true;
    let isName = true;
    let emailQuery = 'SELECT * FROM users WHERE email=$1';
    let nameQuery = 'SELECT * FROM users WHERE name=$1';
    new Promise((resolve, reject) => {
        pool.query(emailQuery, [email])
        .then(result => {if(result.rows.length > 0){isEmail = false;}})
        .catch(error => console.log(error));
        pool.query(nameQuery, [name])
        .then(result => {if(result.rows.length > 0){isName = false;}})
        .catch(error => console.log(error))
        .then(() => {resolve()});
    })
    .then(() => {
        console.log(isEmail, isName)
        if(isEmail && isName) {
            pool.query('insert into users (name, email, password) values ($1, $2, $3)', [name, email, bcrypt.hash(password, 10)])
            .catch(err => console.log(err))
            .then(() => {session.isLogined = true;session.userName = name;});
            pool.query('insert into userInfo (name, win, lose, lebel) values ($1,$2,$3,$4)', [name, 0, 0, 500])
            .catch(err => console.log(err))
            .then(() => {res.redirect('/')});
        } else {
            res.redirect("/login")
        }
    })



})
module.exports = router;