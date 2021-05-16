const db = require("../models");
const Op = db.Sequelize.Op;
const Buyform = db.buyform;
const Supplie = db.supplie;
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");

exports.buyList = async (req, res) => {
    try{
        // const buy = await Buyform.findAll();
        const buy = await sequelize.query(
            `
            SELECT id,name,status,repel,accept,buyprice,SUBSTRING(createdAt, 1, 10) AS Date FROM buyforms
            `,
            {
                nest: true,
                type: QueryTypes.SELECT
            })
        res.json({buyform: buy});
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.insert_buy_sup = (req,res) => {
        Buyform.create(
            {
                status: false,
                repel: false,
                buyprice: req.body.buyprice,
                userId: req.body.userId,
            }
        ).then( buy =>{
            if(req.body.supplie){
                Supplie.findAll({
                    where: {
                        id: {
                            [Op.or] : req.body.supplie
                        }
                    }
                }).then(sup => {
                    const id = buy.id;
                    const length = req.body.supplie.length;
                    console.log(id);
                    buy.setSupplies(sup).then(() => {
                        for(i=0;i< length; i++){
                            console.log(req.body.supplie[i]);
                            console.log(req.body.units[i]);
                            sequelize.query(
                                `UPDATE supplie_buy SET unit=${req.body.units[i]}, sum=${req.body.sum[i]}
                                WHERE buyId=${id} AND supplieId=${req.body.supplie[i]}`,
                                {
                                    nest: true,
                                    type: QueryTypes.UPDATE
                                }
                            );
                        }
                        res.send({ message: 'insert buyform compelete'});
                    });
                });
            } else {
                res.send({ message: 'insert buyform fail'});
            }
        });
};

exports.get_by_id = async (req, res) => {
    try{
        const buy = await sequelize.query(
            `SELECT bf.repel,bf.accept,bf.store, bf.id,bf.status,bf.buyprice,users.fullname,users.classes,sup.supplie_name,
            sup.price,sb.unit,sup.unit_name,sb.supplieId FROM buyforms AS bf
            INNER JOIN supplie_buy AS sb ON bf.id = sb.buyId
            INNER JOIN users ON users.id = bf.userId
            INNER JOIN supplies AS sup ON sb.supplieId = sup.id
            WHERE bf.id = ${req.body.id}`,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({buy:buy});
      } catch (e){
        res.status(403).json({
          message: e
        });
      }
};

exports.set_buy_status = async (req, res) => {
    try{
        const update = await Buyform.update({...req.body},{where: {id:req.body.id}});
        res.json({
            update: update
        });
    } catch (e){
        res.status(403).json({
            message:e
        });
    }
};