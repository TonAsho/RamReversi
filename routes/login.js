var express = require('express');
const session = require('express-session');
const pool = require('../db/pool');
const bcrypt = require("bcrypt");

var router = express.Router();

router.get('/', (req, res) => {
    if(session.isLogined) {
        res.render("index");
    } else {
        res.render("login");
    }
})
router.post('/', (req, res) => {
    let name = req.body.name;
    let password = req.body.password;
    let isOK = false;
    pool.query('SELECT * FROM users WHERE name=$1', [name])
    .then(result => {
        if(result.rows.length > 0) {
            if(bcrypt.compare(password, result.rows[0].password)) {
                isOK = true;
            }
        }
    })
    .catch(error => console.log(error))
    .then(() => {
        if(isOK) {
            session.isLogined = true;
            session.userName = name;
            res.redirect("/");
        } else {
            res.redirect("/login")
        }
    });
})
module.exports = router;
