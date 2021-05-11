const db = require("../models");
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const Op = db.Sequelize.Op;
const Repair = db.repair;

exports.get_All = async (req, res) =>{
    try{
        // const repairs = await Repair.findAll();
        const repairs = await sequelize.query(
            `
            SELECT id,rep_name,rep_detail,rep_price,SUBSTRING(createdAt, 1, 10) AS Date FROM repairs
            `,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            repair:repairs
        })
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};
exports.insert = async (req, res) => {
    try{
        const repair = await Repair.create({
            rep_name: req.body.name,
            rep_detail: req.body.detail,
            rep_price: req.body.price,
            durableId: req.body.duId
        })
        res.json({
            repair:repair
        })
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};