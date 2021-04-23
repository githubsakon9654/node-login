const db = require("../models");
const Offer = db.offer;
const Op = db.Sequelize.Op;
const Supplie = db.supplie;
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
var appove = false;

exports.getAll_offer = async (req, res) => {
    try{
        const offers = await Offer.findAll();
        res.json({offers:  offers});
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.insert_off_sup = (req, res) =>{
  Offer.create(
    {
      offer_name: req.body.offer_name,
      offer_status: false,
      userId: req.body.userId
    }
  ).then( offer => {
    if(req.body.supplie){
      Supplie.findAll({
        where: {
          id: {
            [Op.or]: req.body.supplie
          }
        }
      }).then(sup => {
        const id = offer.id;
        const length = req.body.supplie.length;
        offer.setSupplies(sup).then(()=>{
          for(i=0;i< length; i++){
            sequelize.query(
              `UPDATE offer_sup SET unit=${req.body.units[i]}
              WHERE offerId=${id} AND supplieId=${req.body.supplie[i]}`,
              {
                  nest: true,
                  type: QueryTypes.UPDATE
              }
            );
          }
          res.send({message: 'insert offer compelete'});
        });
      });
    } else{
      res.send({ message: 'insert offer fail'});
    }
  });
};

exports.offer_appove = async (req, res) => {
  try{
      appove = req.body.appove;
      res.json({
        appove: req.body.appove
      });
  } catch (e){  
    
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
    where: {id: req.body.id}
  });
  res.json({
    offer: offer,
    appove: appove
  });
};

exports.update_appove = async (req, res) => {
  try{
      const update = await Offer.update({...req.body},{where: {id:req.body.id}});
      res.json({
          update: update
      });
  } catch (e){
      res.status(403).json({
          message:e
      });
  }
};