const { Admin } = require("mongodb");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
   try {
     const passwordHash = await bcrypt.hash(password, 10);
     return passwordHash;
   } catch (error) {
     console.log(error.message);
   }
 };

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.messege);
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
        if (userData.is_admin === 1) {
          req.session.admin_id = userData._id;

          console.log(userData._id);
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { messege: "Email and password is incorrect " });
      }
    } else {
      res.render("login", { messege: "Email and password is incorrect " });
    }
  } catch (error) {
    console.log(error.messege);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id });
    res.render("home", { admin: userData });
  } catch (error) {
    console.log(error.messege);
  }
};

const logout = async (req, res) => {
  try {
    req.session.admin_id = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.messege);
  }
};

const adminDashboard = async (req, res) => {
  try {
    const usersData = await User.find({ is_admin: 0 });
    res.render("dashboard", { users: usersData });
  } catch (error) {
    console.log(error.messege);
  }
};
//edit user functionability

const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.messege);
  }
};

const updateUsers = async (req, res) => {

  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
      
        },
      }
    );
    
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.messege);
  }
};

const deleteUser=async(req,res)=>{
   try {
      await User.findByIdAndDelete(req.query.id)
      res.redirect('/admin/dashboard')
      
   } catch (error) {
      console.log(error.messege);
   }
}


const addUser=async(req,res)=>{
   try {
      res.render('add-user')
   } catch (error) {
      console.log(error.messege);
   }
}

const addUserPost=async(req,res)=>{
   try {
      const spassword = await securePassword(req.body.password);
      const userData = new User({
        name: req.body.name,
        email: req.body.email,
        password: spassword,
        is_admin: 0,
      });
      const user=await userData.save();
      res.redirect('/admin/dashboard')
   } catch (error) {
      console.log(error.message);
   }
}


const searchUser = async (req,res) => {
  try {
    let value = req.body.search;
    value = value.trim()

    const user = await User.find({name : {$regex : `^${value}`}, is_admin: 0 })
    res.render("dashboard", { users: user });
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  adminDashboard,
  editUserLoad,
  updateUsers,
  deleteUser,
  addUser,
  addUserPost,
  searchUser
};
