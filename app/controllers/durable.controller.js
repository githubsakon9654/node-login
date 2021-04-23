const db = require("../models");
const Durable = db.durable;
const { sequelize } = require("../models");
const Op = db.Sequelize.Op;


exports.listAll_durable = async(req,res) => {
    try{
        const durables = await Durable.findAll();
        res.json({durable: durables});
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.createDurable = async (req,res) => {
    try{
        const durable = await Durable.create({...req.body});
        const { dataValues} = durable;

        res.json({...dataValues});
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