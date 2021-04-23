const db = require("../models");
const User = db.user;
const { sequelize } = require("../models");

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
  User.findOne({
    where: {
      id: req.body.id
    }
  }).then(user => {
    console.log('yes');
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      console.log('yes');
      if (passwordIsValid) {
        user.update({
          password: bcrypt.hashSync(req.body.newpassword, 8)
        });
        res.send({message: 'yes'});
      }
  }).catch(err => {
      res.status(500).send({ message: err.message });
  });
};