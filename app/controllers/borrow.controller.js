const db = require("../models");
const Op = db.Sequelize.Op;
const Borrow = db.borrow;
const Durable = db.durable;
const User = db.user;
const { QueryTypes } = require('sequelize');
const { sequelize, buyform, durable } = require("../models");


exports.list_all = async(req, res) => {
    try {
        // const borrow = await Borrow.findAll();
        const borrow = await sequelize.query(
            `SELECT id,borrow_name,admin_approve,dire_approvev,createdAt AS Date,accept FROM borrows`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            borrow: borrow
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.list_user = async(req, res) => {
    try {
        // const borrow = await Borrow.findAll({
        //     where: {
        //         userId: req.body.userId
        //     }
        // });
        const borrow = await sequelize.query(
            `SELECT id,borrow_name,admin_approve,dire_approvev,createdAt AS Date,accept FROM borrows
            WHERE userId = ${req.body.userId}`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            borrow: borrow
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};


exports.fill_date = async(req, res) => {
    try {
        const reveal = await sequelize.query(
            `
            SELECT id,borrow_name,admin_approve,dire_approvev,createdAt AS Date,accept FROM borrows
            WHERE createdAt BETWEEN "${req.body.start}" AND "${req.body.end}"
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        )
        res.json({
            date: reveal
        })
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
}

exports.borrow_insert = async(req, res) => {
    try {
        Borrow.create({
            admin_approve: false,
            dire_approvev: false,
            userId: req.body.userId,
            borrow_name: req.body.name,
            accept: false
        }).then(borrow => {
            if (req.body.durable) {
                Durable.findAll({
                    where: {
                        id: {
                            [Op.or]: req.body.durable
                        }
                    }
                }).then(durable => {
                    borrow.setDurables(durable).then(() => {
                        res.send({ message: 'yes' });
                    });
                });
            } else {
                res.send({ message: 'insert borrow fail' });
            }
        });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
};

exports.borrow_detail = async(req, res) => {
    try {
        const borrow = await sequelize.query(
            `SELECT br.id,us.fullname,clas.name,db.du_name,db.du_status,db.du_serial, 
            bd.duId,db.userId FROM borrows AS br
            INNER JOIN bor_du AS bd ON br.id = bd.borrowId
            INNER JOIN durables AS db ON bd.duId = db.id
            INNER JOIN users AS us ON us.id = br.userId
            INNER JOIN clas ON us.claId = clas.id
            WHERE br.id = ${req.body.id}`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        const appove = await Borrow.findAll({
            attributes: ['admin_approve', 'dire_approvev', 'accept'],
            where: { id: req.body.id }
        });
        res.json({
            borrow: borrow,
            appove: appove
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.update_appove = async(req, res) => {
    try {
        const update = await Borrow.update({...req.body }, { where: { id: req.body.id } });
        const appove = await Borrow.findAll({
            attributes: ['admin_approve', 'dire_approvev'],
            where: { id: req.body.id }
        });
        if (appove[0].admin_approve && appove[0].dire_approvev) {
            const userId = await Borrow.findAll({
                attributes: ['userId'],
                where: { id: req.body.id }
            });
            const length = req.body.durable.length;
            const id = +userId[0].userId;
            const user = await User.findAll({
                attributes: ['claId'],
                where: { id: id }
            });
            console.log(+user[0].claId);
            for (i = 0; i < length; i++) {
                console.log(req.body.durable[i]);
                sequelize.query(
                    `UPDATE durables SET userId = ${id} , claId = ${+user[0].claId}
                    WHERE id=${req.body.durable[i]}`, {
                        nest: true,
                        type: QueryTypes.UPDATE
                    }
                );
            }
            console.log('yes');
        }
        res.json({
            update: update,
            appove: appove
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.update = async(req, res) => {
    try {
        const update = await Borrow.update({...req.body }, { where: { id: req.body.id } });
        res.json({
            update: update
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};