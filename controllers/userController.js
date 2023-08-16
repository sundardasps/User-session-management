const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// for send mail
const sendVarifyMail = async (name, email, user_id) => {
  try {
   
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "sundardasps0055@gmail.com",
        pass: "caayxpkrizmikgtq",
      },
    });
    const mailOptions = {
      from: "sundardasps0055@gmail.com",
      to: email,
      subject: "For varification mail",
      html:
        "<p>Hii " +
        name +
        ',please click here to <a href="http://localhost:3000/verify?id=' +
        user_id +
        '"> Verify </a> your mail.</p>',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};
const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: spassword,
      is_admin: 0,
    });
    const userData = await user.save();

    if (userData) {
      sendVarifyMail(req.body.name, req.body.email, userData._id);
      res.render("registration", {
        message: "Your registration has been done , Please varify Your mail.",
      });
    } else {
      res.render("registration", {
        message: "Your registration has been failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_varified: 1 } }
    );

    console.log(updateInfo);
    res.render("email-verified");
  } catch (error) {
    console.log(error.message);
  }
};
// login user methods started

const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
            if (userData.is_varified === 1) {
               req.session.user_id = userData._id;

               res.render("home");
            }
            } else {
               res.redirect("/login");
            }
    } else {
            res.render("login", { message: "Email and Password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.user_id = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
};
