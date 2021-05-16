const db = require("../models");
const Offer = db.offer;
const Op = db.Sequelize.Op;
const Supplie = db.supplie;
const Budget = db.budget;
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
var appove = false;

exports.getAll_offer = async (req, res) => {
  try {
    // const offers = await Offer.findAll();
    const offers = await sequelize.query(
      `
          SELECT id,offer_name,offer_status,SUBSTRING(createdAt, 1, 10) AS Date,price FROM offers
          `,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    )
    res.json({ offers: offers });
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.insert_off_sup = (req, res) => {
  Offer.create(
    {
      offer_name: req.body.offer_name,
      offer_status: false,
      userId: req.body.userId,
      price: req.body.price
    }
  ).then(offer => {
    if (req.body.supplie) {
      Supplie.findAll({
        where: {
          id: {
            [Op.or]: req.body.supplie
          }
        }
      }).then(sup => {
        const id = offer.id;
        const length = req.body.supplie.length;
        offer.setSupplies(sup).then(() => {
          for (i = 0; i < length; i++) {
            sequelize.query(
              `UPDATE offer_sup SET unit=${req.body.units[i]}
              WHERE offerId=${id} AND supplieId=${req.body.supplie[i]}`,
              {
                nest: true,
                type: QueryTypes.UPDATE
              }
            );
          }
          res.send({ message: 'insert offer compelete' });
        });
      });
    } else {
      res.send({ message: 'insert offer fail' });
    }
  });
};

exports.offer_appove = async (req, res) => {
  try {
    appove = req.body.appove;
    res.json({
      appove: req.body.appove
    });
  } catch (e) {

  }
};

exports.get_offer_appove = (req, res) => {
  res.json({
    appove: appove
  });
};

exports.get_datail_offer = async (req, res) => {
  const offer = await sequelize.query(
    `SELECT offers.id,sup.supplie_name,sup.price,sup.unit_name,
    os.unit,users.fullname,users.classes, os.supplieId FROM offers
    INNER JOIN offer_sup AS os ON offers.id = os.offerId
    INNER JOIN users ON users.id = offers.userId
    INNER JOIN supplies AS sup ON os.supplieId = sup.id
    WHERE offers.id = ${req.body.id}`,
    {
      nest: true,
      type: QueryTypes.SELECT
    }
  );
  const appove = await Offer.findAll({
    attributes: ['offer_status'],
    where: { id: req.body.id }
  });
  res.json({
    offer: offer,
    appove: appove
  });
};

exports.getAll_unitOfSup = (req, res) => {


  const offer = sequelize.query(
    `
    SELECT DISTINCT sup.id FROM offers
    INNER JOIN offer_sup AS os ON offers.id = os.offerId
    INNER JOIN supplies AS sup ON os.supplieId = sup.id
    ORDER BY os.supplieId
    `,
    {
      nest: true,
      type: QueryTypes.SELECT
    }
  ).then(async offer => {
    var len = offer.length
    var arr = []
    for (var i = 0; i < len; i++) {
      // console.log(offer[i].id + ' 1')
      const unit = await sequelize.query(
        `
      SELECT os.supplieId, sup.supplie_name, SUM(os.unit) AS unit,sup.unit_name,sup.price AS sum  FROM offer_sup AS os
      INNER JOIN supplies AS sup ON os.supplieId = sup.id
      WHERE os.supplieId = ${offer[i].id}
      ORDER BY os.supplieId
      `,
        {
          nest: true,
          type: QueryTypes.SELECT
        }
      ).then(unit => {
        console.log(unit[0])
        arr.push(unit[0])
      })

    }
    res.json({
      offer: arr
    })
  })
  // res.json({
  //   offer: 'd'
  // })

}

exports.clear_all = async (req, res) => {
  const offer = await sequelize.query(
    `
    DELETE FROM offers
    `
  )
  res.json({
    offer: offer
  })
}

exports.update_appove = async (req, res) => {
  try {
    const update = await Offer.update({ ...req.body }, { where: { id: req.body.id } });
    res.json({
      update: update
    });
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
};

exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.findAll({
      where: {
        [Op.and]: [{ userId: req.body.userId }, { budget_year: req.body.budget_year }]
      }
    })
    res.json({
      budget: budget
    })
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
}

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.update({ budget: req.body.budget }, {
      where: {
        [Op.and]: [{ userId: req.body.userId }, { budget_year: req.body.budget_year }]
      }
    })
    res.send({ message: "done" })
  } catch (e) {
    res.status(403).json({
      message: e
    });
  }
}