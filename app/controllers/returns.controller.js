const db = require("../models");
const Op = db.Sequelize.Op;
const Returns = db.returns;
const Durable = db.durable;
const { QueryTypes } = require('sequelize');
const { sequelize} = require("../models");


exports.returns_Alllist = async(req,res) => {
    try{
        // const returns = await Returns.findAll();
        const returns = await sequelize.query(
            `
            SELECT id,re_name,status,SUBSTRING(createdAt, 1, 10) AS Date FROM returns
            `,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            returns: returns
        });
    } catch (e){
        res.status(403).json({
            message: e
        });
    }
};

exports.return_user_list = async(req,res)=>{
    try{
        // const returns = await Returns.findAll({
        //     where: {
        //         userId: req.body.userId
        //     }
        // });
        const returns = await sequelize.query(
            `
            SELECT id,re_name,status,SUBSTRING(createdAt, 1, 10) AS Date FROM returns
            WHERE userId = ${req.body.userId}
            `,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            returns: returns
        });
    } catch (e){
        res.status(403).json({
            message: e
        });
    }
};

exports.insert_return = async(req,res) => {
    try{
        Returns.create(
            {
                re_name: req.body.re_name,
                status: false,
                userId: req.body.userId,
            }
        ).then( returns => {
            if(req.body.durable){
                Durable.findAll({
                    where:{
                        id: {
                            [Op.or]: req.body.durable
                        }
                    }
                }).then( durable => {
                    returns.setDurables(durable).then(()=>{
                        res.send({ message: 'yes'});
                    });
                });
            } else{
                res.send({ message: 'insert return fail'});
            }
        });
    } catch (e){
        res.status(403).json({
            message: e
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
                userId: req.body.userId
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

exports.update_status = async (req, res) => {
    try{
        const update = await Returns.update({...req.body},{where: {id:req.body.id}});
        res.json({
            update: update
        });
    } catch (e){
        res.status(403).json({
            message:e
        });
    }
};

exports.return_detail = async (req,res) => {
    try{
        const returns = await sequelize.query(
            `SELECT rt.id,rt.re_name,us.classes,db.du_name,db.du_status,db.du_serial, 
            rd.duId,rt.userId FROM returns AS rt
            INNER JOIN re_du AS rd ON rt.id = rd.returnId
            INNER JOIN durables AS db ON rd.duId = db.id
            INNER JOIN users AS us ON us.id = rt.userId
            WHERE rt.id = ${req.body.id}`,
            {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        const status = await Returns.findAll({
            attributes: ['status'],
            where: {id: req.body.id}
        });
        res.json({
            return: returns,
            status:status
        });
    } catch (e) {
        res.status(403).json({
            message:e
        });
    }
};