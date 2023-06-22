const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  console.log(message)
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid Email or Password.')
        return res.redirect('/login')
      }
      bcryptjs.compare(password, user.password)
        .then(result => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err)
              res.redirect('/')
            })
          }
          req.flash('error', 'Invalid Password.')
          res.redirect('/login')

        })
        .catch(err => {
          console.log(err)
          res.redirect('/login')
        })
    })
    .catch(err => console.log(err))
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email }).then(userDoc => {

    if (userDoc) {
      req.flash('error', 'Email already exists!')
      return res.redirect('/signup')
    }
    return bcryptjs
      .hash(password, 12)
      .then(hashedPass => {
        const user = new User({
          email: email,
          password: hashedPass,
          cart: { items: [] }
        })
        return user.save()
      }).then(() => {
        res.redirect('/login')
        return transporter.sendMail({
          to: email,
          from: 'ronit2001krish@gmail.com',
          subject: 'SignUp Successfully!',
          html: '<h1>You Have Successfully Signed Up!!</h1>'
        })
      })
  }).catch(err => console.log(err))
    .catch(err => {
      console.log(err)
      req.flash('error', 'Some Error occured!!')

    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
