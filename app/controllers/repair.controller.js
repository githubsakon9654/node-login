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
            SELECT id,rep_name,rep_detail,rep_price,DATE_FORMAT(DATE_ADD(createdAt, INTERVAL 543 YEAR), "%d %M %Y") AS Date FROM repairs
            WHERE durableId = ${req.body.duId}
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
exports.all_repair_list = async(req,res) => {
    try{
        const repairs = await sequelize.query(
            `
            SELECT rp.id,rp.rep_name,rp.rep_detail,rp.rep_price,DATE_FORMAT(DATE_ADD(rp.createdAt, INTERVAL 543 YEAR), "%d %M %Y") AS Date, db.du_name, db.du_serial FROM repairs AS rp
            INNER JOIN durables AS db ON rp.durableId = db.id 
            `,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            repair:repairs
        })
    }catch (e) {
        res.status(403).json({
            message: e
        });
    }
}