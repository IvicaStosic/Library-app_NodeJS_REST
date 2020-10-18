const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const nodemailer = require('nodemailer');

// var transport = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: process.env.MAILTRAP_USER,
//     pass: process.env.MAILTRAP_PASSWORD
//   }
// });
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)


exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username: username,
      password: hashedPassword,
      email: email,
    });
    const result = await user.save();
    const msg = {
      to: 'email', // Change to your recipient
      from: 'nodejs.practice.ivica@gmail.com', // Change to your verified sender
      subject: 'Signup succeded!',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>You successfully signed up!</strong>',
    }
    // await transport.sendMail({
    //   to: email,
    //   from: process.env.MAILTRAP_SENDER,
    //   subject: 'Signup succeded!',
    //   html: '<h1>You successfully signed up!</h1>'
    // })
    await sgMail.send(msg).then(() => {
      console.log('Email sent')
    })
      .catch((error) => {
        console.error(error)
      })
    res.status(201).json({ message: "User created successfully.", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      const error = new Error("A user with that username does not exist.");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password.");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        username: loadedUser.username,
        userId: loadedUser._id.toString(),
      }, process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changePassword = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, async (err, buffer) => {
    try {
      if (err) {
        console.log(err);
      }
      const token = buffer.toString('hex');
      const user = await User.findOne({ email: email });

      if (!user) {
        const error = new Error("A user with that email does not exist.")
        error.statusCode(401);
        throw error
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000 /** 1h */
      await user.save();

      await transport.sendMail({
        to: email,
        from: MAILTRAP_SENDER,
        subject: 'Password Reset',
        html: `<body>
              <p>You requested password reset</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
              <p>Time till expiration ${user.resetTokenExpiration.toString} </p>
              </body>`
      })
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  })
}

