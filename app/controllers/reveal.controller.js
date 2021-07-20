const db = require("../models");
const Op = db.Sequelize.Op;
const Reveal = db.reveal;
const Supplie = db.supplie;
const Sup_year = db.supplie_year;
const { QueryTypes, NUMBER } = require('sequelize');
const { sequelize, buyform } = require("../models");

exports.reveal_list_all = async(req, res) => {
    try {
        // const reveals = await Reveal.findAll();
        const reveals = await sequelize.query(
            `
            SELECT rl.id,rl.admin_approve,rl.total_price,DATE_FORMAT(DATE_ADD(rl.createdAt, INTERVAL 543 YEAR), "%d %M %Y") AS Date,
            us.fullname,rl.accept FROM reveals as rl
            LEFT JOIN users AS us ON rl.userId = us.id
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({
            reveal: reveals
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.reveal_list_user = async(req, res) => {
    try {
        // const reveal = await Reveal.findAll({
        //     where: {
        //         userId: req.body.userId
        //     }
        // });
        const reveal = await sequelize.query(
            `
            SELECT rl.id,rl.admin_approve,rl.total_price,DATE_FORMAT(DATE_ADD(rl.createdAt, INTERVAL 543 YEAR), "%d %M %Y") AS Date,us.fullname,rl.accept FROM reveals as rl
            LEFT JOIN users AS us ON rl.userId = us.id
            WHERE rl.userId = ${req.body.userId}
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({
            reveal: reveal
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.insert_reveal_sup = (req, res) => {
    Reveal.create({
        admin_approve: false,
        total_price: req.body.total_price,
        userId: req.body.userId,
        accept: false
    }).then(reveal => {
        const id = reveal.id;
        if (req.body.supplie) {
            Supplie.findAll({
                where: {
                    id: {
                        [Op.or]: req.body.supplie
                    }
                }
            }).then(sup => {
                const length = req.body.supplie.length;
                reveal.setSupplies(sup).then(() => {
                    for (i = 0; i < length; i++) {
                        console.log(req.body.supplie[i]);
                        console.log(req.body.units[i]);
                        sequelize.query(
                            `UPDATE reveal_sup SET unit=${req.body.units[i]}
                            WHERE revealId=${id} AND supplieId=${req.body.supplie[i]}`, {
                                nest: true,
                                type: QueryTypes.UPDATE
                            }
                        );
                    }
                    res.send({ message: 'insert reveal compelete' });
                });
            });
        } else {
            res.send({ message: 'insert reveal fail' });
        }
        console.log(req.body.year);
        sequelize.query(
            `
            SELECT MAX(serial) AS max FROM reveals WHERE serial LIKE '%${req.body.year}'
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        ).then(T => {
            console.log('T' + T[0]);
            console.log('T' + T[0].max);
            var tt = T[0].max;
            if (T[0].max != null) {
                console.log('T');
                res.json({ t: T });
                var num = T[0].max;
                console.log(num);
                var serialRV = Number(num.substring(2, 3));
                var SR = 'จ.' + (serialRV + 1) + '/' + req.body.year;
                console.log('d' + serialRV);
                console.log(SR);
                Reveal.update({ serial: SR }, {
                    where: {
                        id: id
                    }
                });
            } else {
                console.log('55');
                var SR2 = 'จ.' + 1 + '/' + req.body.year;
                console.log(SR2);
                Reveal.update({ serial: SR2 }, {
                    where: {
                        id: id
                    }
                });
                // SELECT rv.serial AS serial,users.fullname AS name FROM `reveals` AS rv
                // INNER JOIN reveal_sup AS rs ON rs.revealId = rv.id
                // LEFT JOIN users ON rv.userId = users.id
                // WHERE rs.supplieId = 1
                // UNION
                // SELECT bf.serial AS serial, bf.name AS name FROM buyforms AS bf
                // INNER JOIN supplie_buy AS sb ON bf.id = sb.buyId
                // WHERE sb.supplieId = 1
            }
        });
    });
};

exports.updateRemain = (req, res) => {
    try {
        const update = sequelize.query(
            `UPDATE reveal_sup SET remain=${req.body.remain}
            WHERE revealId=${req.body.id} AND supplieId=${req.body.supplieId}`, {
                nest: true,
                type: QueryTypes.UPDATE
            }
        );
        res.json({
            update: update
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.get_detail_reveal = async(req, res) => {
    const reveal = await sequelize.query(
        `SELECT reveals.id, reveals.total_price,rs.supplieId,sup.supplie_name,sup.price,rs.unit,sup.unit_name, 
        users.fullname,clas.name,rs.supplieId FROM reveals
        INNER JOIN reveal_sup AS rs ON reveals.id = rs.revealId
        INNER JOIN users ON users.id = reveals.userId
        INNER JOIN supplies AS sup ON rs.supplieId = sup.id
        INNER JOIN clas ON users.claId = clas.id
        WHERE reveals.id = ${req.body.id}`, {
            nest: true,
            type: QueryTypes.SELECT
        }
    );
    const appove = await Reveal.findAll({
        attributes: ['admin_approve', 'accept'],
        where: { id: req.body.id }
    });
    res.json({
        reveal: reveal,
        appove: appove
    });
};

exports.update_appove = async(req, res) => {
    try {
        const update = await Reveal.update({...req.body }, { where: { id: req.body.id } });
        console.log('update');
        res.json({
            update: update
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
            SELECT rl.id,rl.admin_approve,rl.total_price,DATE_FORMAT(DATE_ADD(rl.createdAt, INTERVAL 543 YEAR), "%d %M %Y") AS Date,
            us.fullname,rl.accept FROM reveals as rl
            LEFT JOIN users AS us ON rl.userId = us.id
            WHERE rl.createdAt BETWEEN "${req.body.start}" AND "${req.body.end}"
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