const db = require("../models");
const Op = db.Sequelize.Op;
const Reveal = db.reveal;
const Supplie = db.supplie;
const { QueryTypes } = require('sequelize');
const { sequelize, buyform } = require("../models");

exports.reveal_list_all = async (req, res) => {
    try{
        const reveals = await Reveal.findAll();
        res.json({
            reveal: reveals
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.reveal_list_user = async (req, res) => {
    try{
        const reveal = await Reveal.findAll({
            where: {
                userId: req.body.userId
            }
        });
        res.json({
            reveal: reveal
        });
    } catch (e) {
        res.status(403).json({
            message:e
        });
    }
};

exports.insert_reveal_sup = (req, res) =>{
    Reveal.create(
        {
            admin_approve: false,
            dire_approvev: false,
            total_price: req.body.total_price,
            userId: req.body.userId
        }
    ).then( reveal => {
        if(req.body.supplie){
            Supplie.findAll({
                where: {
                    id: {
                        [Op.or]: req.body.supplie
                    }
                }
            }).then(sup => {
                const id = reveal.id;
                const length = req.body.supplie.length;
                console.log(id);
                reveal.setSupplies(sup).then(() => {
                    for(i=0;i< length; i++){
                        console.log(req.body.supplie[i]);
                        console.log(req.body.units[i]);
                        sequelize.query(
                            `UPDATE reveal_sup SET unit=${req.body.units[i]}
                            WHERE revealId=${id} AND supplieId=${req.body.supplie[i]}`,
                            {
                                nest: true,
                                type: QueryTypes.UPDATE
                            }
                        );
                    }
                    res.send({ message: 'insert reveal compelete'});
                });
            });
        } else {
            res.send({ message: 'insert reveal fail'});
        }
    });
};

exports.get_detail_reveal = async (req, res) => {
    const reveal = await sequelize.query(
        `SELECT reveals.id, reveals.total_price,rs.supplieId,sup.supplie_name,sup.price,rs.unit,sup.unit_name, 
        users.fullname,users.classes,rs.supplieId FROM reveals
        INNER JOIN reveal_sup AS rs ON reveals.id = rs.revealId
        INNER JOIN users ON users.id = reveals.userId
        INNER JOIN supplies AS sup ON rs.supplieId = sup.id
        WHERE reveals.id = ${req.body.id}`,
        {
            nest: true,
            type: QueryTypes.SELECT
        }
    );
    const appove = await Reveal.findAll({
        attributes: ['admin_approve', 'dire_approvev'],
        where: {id: req.body.id}
    });
    res.json({
        reveal: reveal,
        appove: appove
    });
};

exports.update_appove = async (req, res) => {
    try{
        const update = await Reveal.update({...req.body},{where: {id:req.body.id}});
        res.json({
            update: update
        });
    } catch (e){
        res.status(403).json({
            message:e
        });
    }
};