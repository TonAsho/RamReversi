var express = require('express');
const session = require('express-session');
const pool = require('../db/pool');
var router = express.Router();

router.post('/', (req, res) => {
    session.isLogined = undefined;
    res.redirect("/")
})
module.exports = router;
