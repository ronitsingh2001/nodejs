const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const { validationResult } = require('express-validator')

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
    errorMessage: message,
    oldInput: {
      email: "",
      password: ''
    },
    validationError: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  // console.log(message)
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    validationError: []

  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationError: errors.array()
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'This E-mail doesnot exists!',
          oldInput: {
            email: email,
            password: password
          },
          validationError: [{ path: 'email' }]
        });
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Incorrect Password!',
            oldInput: {
              email: email,
              password: password
            },
            validationError: [{ path: 'password' }]
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        })
    })
    .catch(err => console.log(err))
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationError: errors.array()
    });
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
      console.log(email)
      return transporter.sendMail({
        to: email,
        from: 'ronit2001krish@gmail.com',
        subject: 'SignUp Successfully!',
        html: '<h1>You Have Successfully Signed Up!!</h1>'
      })
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  // console.log(message)
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}

exports.postReset = (req, res, next) => {

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No Account with that email found!');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save().then(result => {
          return transporter.sendMail({
            from: 'ronit2001krish@gmail.com',
            to: req.body.email,
            subject: 'Password Reset!',
            html: `
            <p>You Have Requested a password reset.</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password!!</p>
            `
          })
        }).then(() => {
          res.redirect('/')
        })
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      // console.log(message)
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        token: token
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.postNewPassword = (req, res, next) => {
  const NewPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      resetUser = user
      return bcryptjs.hash(NewPassword, 12)
    })
    .then(hashedPass => {
      resetUser.password = hashedPass;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save()
    })
    .then(() => {
      console.log('successfully updated')
      res.redirect('/login')
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}