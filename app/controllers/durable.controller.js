const db = require("../models");
const Durable = db.durable;
const Ducate = db.ducate;
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const Op = db.Sequelize.Op;
const time = new Date;


exports.listAll_durable = async(req, res) => {
    try {
        // const durables = await Durable.findAll();
        const durables = await sequelize.query(
            `
            SELECT db.id,db.du_name,db.du_status,db.du_serial,clas.name,db.userId,db.date,db.du_price,db.get FROM durables AS db
            LEFT JOIN users ON users.id = db.userId 
            LEFT JOIN clas ON users.claId = clas.id
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({ durable: durables });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.listUser_durable = async(req, res) => {
    try {
        // const durables = await Durable.findAll({
        //     where: {
        //         userId: req.body.id
        //     }
        // });
        const durables = await sequelize.query(
            `
            SELECT db.id,db.du_name,db.du_status,db.du_serial,users.fullname,db.userId,db.date,db.du_price,db.get FROM durables AS db
            INNER JOIN users ON users.id = db.userId
            WHERE db.userId = ${req.body.id}
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({ durable: durables });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.createDurableCate = async(req, res) => {
    try {
        const ducate = await Ducate.create({...req.body });
        res.json({ ducate: ducate });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};
exports.findDurableCate = async(req, res) => {
    try {
        const ducate = await Ducate.findAll();
        res.json({ ducate: ducate });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};
exports.findDurableCateByid = async(req, res) => {
    try {
        const ducate = await Ducate.findAll({
            where: {
                id: req.body.id
            }
        });
        res.json({ ducate: ducate });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};
exports.createDurable = async(req, res) => {
    try {
        // const durable = await Durable.create({
        //     du_name: req.body.du_name,
        //     du_status: req.body.du_status
        // }).then( du => {
        //     const date = req.body.du_serial + '/'  + (Date(du.createdAt)).substring(8,10)+ '-' +(Date(du.createdAt)).substring(4,7) +'-'+ (Date(du.createdAt)).substring(11,15) + '/'+ du.id;
        //     console.log(Date(du.createdAt))
        //     du.update({du_serial:date},{where:{id:du.id}})
        // })
        const date = Date(req.body.date);
        const durable = await Durable.create({
            du_name: req.body.du_name,
            du_status: req.body.du_status,
            du_price: req.body.du_price,
            get: req.body.get,
            userId: null,
            date: req.body.date,
            du_serial: req.body.du_serial,
            ducateId: req.body.ducateId
        });
        res.json({ durable: durable });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};

exports.updateDurable = async(req, res) => {
    try {
        const durable = await Durable.update({...req.body }, { where: { id: req.body.id } });
        res.json({
            message: `This Column Updated is ${durable ? true : false}`
        });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};

exports.deleteDurable = async(req, res) => {
    try {
        const durable = await sequelize.query(`DELETE FROM durables WHERE id = ${req.body.id}`);
        res.json({
            message: `number of delete is ${durable ? true : false}`
        });
    } catch (e) {
        res.status(403).json({
            message: e.message
        });
    }
};

exports.fillter = async(req, res) => {
    const filter = req.body.filter;
    console.log(filter);
    try {
        const durable = await Durable.findAll({
            where: {
                du_name: {
                    [Op.substring]: `${filter}`
                },
                userId: null
            }
        });
        if (durable === null) {
            res.json({
                message: 'This Durable Not Found!'
            });
            return;
        }
        console.log('2');
        res.json({
            return: durable
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
        console.log('4');
    }
};

exports.update_appove_null = async(req, res) => {
    try {
        const durable = await Durable.update({...req.body }, { where: { id: req.body.id } });
        res.json({
            message: `This Column Updated is ${durable ? true : false}`
        });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};