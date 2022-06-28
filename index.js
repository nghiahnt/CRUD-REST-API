const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const handlebars = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const { pool } = require('./queries');

pool.connect();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    timeout: 60000
}));

app.use(express.static(path.join(__dirname, 'views')));

const hbs = handlebars.create({
    defaultLayout: 'main',
    extname: '.hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

const db = require('./queries');
const isAuthenticated = require('./middleware/authenticate');
const { time } = require('console');

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home')
});

app.get('/home', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => {
    req.session.regenerate(function(err) {
        if (err) next(err)
        req.session.user = req.body.user;
        req.session.save(function(err) {
            if (err) return next(err)
            res.render('home')
        })
    })
});

app.get('/logout', function(req, res, next) {
    req.session.user = null
    req.session.save(function(err) {
        if (err) next(err)
        req.session.regenerate(function(err) {
            if (err) next(err)
            res.redirect('/home');
        })
    })
});

app.get('/users', db.getUsers, (req, res) => {});
app.get('/users/:id', db.getUserById);
app.post('/users', db.createUser);
app.put('/users/:id', db.updateUser);
app.delete('/users/:id', db.deleteUser);

app.listen(port, () => {
    console.log(`App running on port http://localhost:${port}.`);
});