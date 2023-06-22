const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf');
const flash = require('connect-flash')

const errorController = require('./controllers/error')
const User = require('./models/user')

const MONGODB_URI = 'mongodb+srv://ronit2001krish:kkNCbvJXytrV5fFe@cluster0.pzq3t8g.mongodb.net/shop';


const app = express();
const store = new mongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const csrfProtection = csrf()

app.set('view engine', 'ejs');
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use(csrfProtection);
app.use(flash())

app.use((req, res, next) => {
    User.findById(req.session.user?._id)
        .then(user => {
            req.user = user;
            next()
        })
        .catch(err => {
            console.log(err)
        })
})

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next()
})

app.use('/admin/', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)



app.use(errorController.get404Page);

mongoose.connect(MONGODB_URI)
    .then(result => {
        // User.findOne().then(user => {
        //     if (!user) {
        //         const user = new User({
        //             name: 'Krish',
        //             email: 'kt@g.com',
        //             cart: {
        //                 items: []
        //             }
        //         })
        //         user.save().then(result => {
        //             console.log('User Created!')
        //         })
        //     }
        // })
        app.listen(3000)
        console.log('Connected!')
    })
    .catch(err => {
        console.log(err)
    })
