
const db = require("../models");
const Durable = db.durable;
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const Op = db.Sequelize.Op;
const time = new Date


exports.listAll_durable = async(req,res) => {
    try{
        // const durables = await Durable.findAll();
        const durables = await sequelize.query(
            `
            SELECT db.id,db.du_name,db.du_status,db.du_serial,users.fullname,db.userId FROM durables AS db
            LEFT JOIN users ON users.id = db.userId 
            `,{
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({durable: durables});
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.listUser_durable = async(req,res) => {
    try{
        // const durables = await Durable.findAll({
        //     where: {
        //         userId: req.body.id
        //     }
        // });
        const durables = await sequelize.query(
            `
            SELECT db.id,db.du_name,db.du_status,db.du_serial,users.fullname,db.userId FROM durables AS db
            INNER JOIN users ON users.id = db.userId
            WHERE db.userId = ${req.body.id}
            `,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({durable: durables});
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.createDurable = async (req,res) => {
    try{
        const durable = await Durable.create({
            du_name: req.body.du_name,
            du_status: req.body.du_status
        }).then( du => {
            const date = req.body.du_serial + '/'  + (Date(du.createdAt)).substring(8,10)+ '-' +(Date(du.createdAt)).substring(4,7) +'-'+ (Date(du.createdAt)).substring(11,15) + '/'+ du.id;
            console.log(Date(du.createdAt))
            du.update({du_serial:date},{where:{id:du.id}})
        })
        res.json({durable:durable});
    } catch (e) {
        res.status(403).json({message: e.errors[0].message});
    }
};

exports.updateDurable = async(req,res) => {
    try{
        const durable = await Durable.update({...req.body},{where: {id: req.body.id}});
        res.json({
            message: `This Column Updated is ${durable? true: false}`
        });
    } catch (e) {
        res.status(403).json({message: e.errors[0].message});
    }
};

exports.deleteDurable = async (req, res) => {
    try{
        const durable = await sequelize.query(`DELETE FROM durables WHERE id = ${req.body.id}`);
        res.json({
            message: `number of delete is ${durable? true: false}`
        });
    } catch (e) {
        res.status(403).json({
            message: e.message
        });
    }
};

exports.fillter = async (req, res) => {
    const filter = req.body.filter;
    console.log(filter);
    try{
        const durable = await Durable.findAll({
            where: {
                du_name: {
                    [Op.substring]: `${filter}`
                },
                userId: null
            }
        });
        if(durable === null){
            res.json({
                message: 'This Durable Not Found!'
            });
            return;
        }
        console.log('2');
        res.json({
            return: durable
        });
    } catch(e) {
        res.status(403).json({
            message: e
        });
        console.log('4');
    }
};

exports.update_appove_null = async (req, res) => {
    try{
        const durable = await Durable.update({...req.body},{where: {id: req.body.id}});
        res.json({
            message: `This Column Updated is ${durable? true: false}`
        });
    } catch (e) {
        res.status(403).json({message: e.errors[0].message});
    }
};