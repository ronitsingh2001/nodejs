const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf');
const flash = require('connect-flash')
const multer = require('multer')

const errorController = require('./controllers/error')
const User = require('./models/user')

const MONGODB_URI = 'mongodb+srv://ronit2001krish:kkNCbvJXytrV5fFe@cluster0.pzq3t8g.mongodb.net/shop';


const app = express();
const store = new mongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/my-uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images');
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString() + '-' + file.originalname)
//     }
// })

const csrfProtection = csrf()

app.set('view engine', 'ejs');
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).single('image'))
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
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next()
})

app.use((req, res, next) => {
    // throw new Error('Dummy')
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next()
            }
            req.user = user;
            next()
        })
        .catch(err => {
            next(new Error(err))
            // throw new Error(err)
        })
})


app.use('/admin/', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use('/500', errorController.get500Page)
app.use(errorController.get404Page);

app.use((err, req, res, next) => {
    // console.log(req.session)
    res.status(500).render('500', {
        pageTitle: 'Error', path: '/500', isAuthenticated: req.session.isLoggedIn
    });
})


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
