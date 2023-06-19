const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const errorController = require('./controllers/error')
const User = require('./models/user')


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User.findById("648d79822a5ae69034445826")
        .then(user => {
            req.user = new User(user.username, user.email, user.cart, user._id)
            next()
        })
        .catch(err => {
            console.log(err)
        })
})

app.use('/admin/', adminRoutes)
app.use(shopRoutes)



app.use(errorController.get404Page);

mongoose.connect('mongodb+srv://ronit2001krish:kkNCbvJXytrV5fFe@cluster0.pzq3t8g.mongodb.net/')
    .then(result => {
        console.log('Connected!')
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
