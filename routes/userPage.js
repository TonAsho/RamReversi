var express = require('express');
const session = require('express-session');
const pool = require('../db/pool');
var router = express.Router();

router.get('/', (req, res) => {
    let userInformation = {
        name: "",
        win: 0,
        lose: 0,
        lebel: 500,
    }
    if(session.isLogined) {
        pool.query('select * from userinfo where name=$1', [session.userName])
        .then(results => {
            let info = results.rows[0];
            userInformation.name = info.name;
            userInformation.win = info.win;
            userInformation.lose = info.lose;
            userInformation.lebel = info.lebel;
        })
        .catch(error => console.log(error))
        .then(() => {res.render("userPage", {userInformation: userInformation})});
    } else {
        res.render("login")
    }
})
module.exports = router;
