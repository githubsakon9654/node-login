const db = require("../models");
const User = db.user;
const { sequelize } = require("../models");
const { QueryTypes } = require('sequelize');
var bcrypt = require("bcryptjs");

exports.allAccess = async(req, res) => {
  try {
    const users = await User.findAll();
    res.json({users: users});
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.findUser = async (req, res) => {
  try{
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });
    res.json({user: user});
  } catch (e){
    res.status(403).json({
      message: e
    });
  }
};

exports.findUserById = async (req, res) => {
  try{
    const user = await User.findOne({
      where: {
        id: req.body.id
      }
    });
    res.json({user: user});
  } catch (e){
    res.status(403).json({
      message: e
    });
  }
};

exports.update_user = async (req,res) => {
  try{
    const user = await User.update({...req.body},{where: {id:req.body.id}});
    res.json({
      user: user
    });
  } catch (e){
    res.status(403).json({
      message:e
  });
  }
};

exports.deleteUser = async (req, res) => {
  try{
    const user = await sequelize.query(`DELETE FROM users WHERE id = ${req.body.id}`);
    res.json({user: user});
  } catch (e){
    res.status(403).json({
      message: e
    });
  }
};

exports.defaultPass = async (req, res) => {

  try{
    const user = await User.update(
      {
        password: bcrypt.hashSync("12345678", 8)
      },
      {
        where: {
          id: req.body.id
        }
      }
    );
    res.json({
      user: user
    });
  } catch (e){
    res.status(403).json({
      message:e
  });
  }
};

exports.changePass = (req, res) => {
   const pass = User.findOne({
    where: {
      id: req.body.id
    }
  }).then(user => {
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (passwordIsValid) {
        user.update({
          password: bcrypt.hashSync(req.body.newpassword, 8)
        });
        res.json({
          pass: true
        })
      } else{
        res.json({
          pass: false
        })

      }
  }).catch(err => {
      res.status(500).send({ message: err.message });
  });
};

exports.checkPass = async (req, res) => {
  try{
    const pass = await sequelize.query(
      `SELECT password FROM users WHERE id = ${req.body.id}`, 
      {
        type: QueryTypes.SELECT
      }
    )
    var passwordIsValid = bcrypt.compareSync(pass.password,pass.password)
    console.log(pass)
    res.json({
      pass:pass
    })
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
};