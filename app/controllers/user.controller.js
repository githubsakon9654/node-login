const db = require("../models");
const User = db.user;
const Budget = db.budget;
const { sequelize, budget } = require("../models");
const { QueryTypes, NOW, EmptyResultError } = require('sequelize');
const { Op } = require("sequelize");
var bcrypt = require("bcryptjs");

exports.allAccess = async (req, res) => {
  try {
    const users = await sequelize.query(
      `
      SELECT * FROM users
      `,{
        nest: true,
        type: QueryTypes.SELECT
      }
      // WHERE budgets.budget_year = "${budget_year}"
    ).then( async budget => {
      var arr = budget.length
      console.log(arr)
      if(arr == 0){
        const users = await User.findAll()
        res.json({
          users:users
        })
      }
      res.json({
         users: budget
        });

    })
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.findUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });
    res.json({ user: user });
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.findUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.body.id
      }
    });
    const budget = await Budget.findOne({
      where: {
        [Op.and]: [{ userId: req.body.id }, {budget_year:req.body.budget_year}]
      }
    })
    res.json({ user: user,budget:budget });
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.update_user = async (req, res) => {
  try {
    const user = await User.update({ ...req.body }, { where: { id: req.body.id } });
    res.json({
      user: user
    });
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await sequelize.query(`DELETE FROM users WHERE id = ${req.body.id}`);
    res.json({ user: user });
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.defaultPass = async (req, res) => {

  try {
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
  } catch (e) {
    res.status(403).json({
      message: e
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
    } else {
      res.json({
        pass: false
      })

    }
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
};

exports.checkPass = async (req, res) => {
  try {
    const pass = await sequelize.query(
      `SELECT password FROM users WHERE id = ${req.body.id}`,
      {
        type: QueryTypes.SELECT
      }
    )
    var passwordIsValid = bcrypt.compareSync(pass.password, pass.password)
    console.log(pass)
    res.json({
      pass: pass
    })
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.insert_budget = (req, res) => {
  try {
    Budget.findOne({
      where: {
        [Op.and]: [{ userId: req.body.userId }, {budget_year:req.body.budget_year}]
        
      }
    }).then( budget => {
      if(!budget){
        Budget.create({
          userId:req.body.userId,
          budget_year:req.body.budget_year,
          year: NOW(),
          budget: req.body.budget
        })
      }
    })
    console.log("----5")
  } catch (e) {
    res.status(500).send({ message: err.message });
  }
}

exports.getbudget = async (req, res) => {
  try{
    const user = await sequelize.query(
      `
      SELECT bg.budget,bg.budget_year,users.id FROM users
      INNER JOIN budgets AS bg ON bg.userId = users.id
      WHERE bg.budget_year = "${req.body.budget_year}" AND users.id = ${req.body.userId}
      `,{
        nest: true,
        type: QueryTypes.SELECT
      }
    )
    res.json({
      user:user
    })
  } catch (e) {
    res.status(500).send({ message: err.message });
  }
} 

exports.getAllBudget = async (req, res) => {
  try{
    const user = await sequelize.query(
      `
      SELECT SUM(bg.budget) AS sum,bg.budget_year FROM users
      INNER JOIN budgets AS bg ON bg.userId = users.id
      WHERE bg.budget_year = "${req.body.budget_year}"
      `,{
        nest: true,
        type: QueryTypes.SELECT
      }
    )
    res.json({
      user:user
    })
  } catch (e) {
    res.status(500).send({ message: err.message });
  }
} 