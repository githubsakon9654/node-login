const { sequelize } = require("../models");
const db = require("../models");
const Supplie = db.supplie;
const Op = db.Sequelize.Op;

exports.listAll_supplie = async (req, res) => {
    try{
        const supplies = await Supplie.findAll();
        res.json({supplies: supplies});
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.getSupplie = async (req, res) => {
    const { id } = req.params;
    try{
        const supplie = await Supplie.findByPk(+id);
        if(supplie === null){
            res.json({
                message: 'This Column Not Found!'
            });
            return;
        }
        res.json({
            supplie: supplie
        });
    } catch(e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.createSupplie = async (req, res) =>{
    try{
        const supplie = await Supplie.create({...req.body});
        const {dataValues } = supplie;

        res.json({ ...dataValues});
    } catch(e) {
        res.status(403).json({message: e.errors[0].message});
    }
};

exports.updateSupplie = async(req,res) => {
    const id = req.body.id;
    try{
        const supplie = await Supplie.update({...req.body},{where: {id: id}});
        res.json({
            message: `This Column Updated is ${supplie[0]? true: false}`
        });
    } catch(e){
        res.status(403).json({message: e.errors[0].message});
    }
};

exports.deleteSuppie = async (req, res) => {
    try{
        const supplie = await sequelize.query(`DELETE FROM supplies WHERE id = ${req.body.id}`);
        res.json({
            message: `supplile of deleted is ${supplie? true:false}`
        });
    } catch (e) {
        res.status(403).json({
            message: e.message
            
        });
    }
};

exports.filter = async (req, res) => {
    const filter = req.body.filter;
    console.log(filter);
    try{
        const supplie = await Supplie.findAll({
            where: {
                supplie_name: {
                    [Op.substring]: `${filter}`
                }
            }
        });
        if(supplie === null){
            res.json({
                message: 'This Supplie Not Found!'
            });
            return;
        }
        res.json({
            return: supplie
        });
    } catch(e) {
        res.status(403).json({
            message: e
        });
    }
};