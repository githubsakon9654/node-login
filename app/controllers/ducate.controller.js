const db = require("../models");
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const Op = db.Sequelize.Op;
const Ducate = db.ducate;

exports.get_All = async (req, res) =>{
    try{
        const ducate = await sequelize.query(
            `
            SELECT id,name,serial FROM ducates
            `,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            ducate:ducate
        })
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};