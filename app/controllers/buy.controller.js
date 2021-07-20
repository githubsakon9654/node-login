const db = require("../models");
const Op = db.Sequelize.Op;
const Buyform = db.buyform;
const Supplie = db.supplie;
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");

exports.buyList = async(req, res) => {
    try {
        // const buy = await Buyform.findAll();
        const buy = await sequelize.query(
            `
            SELECT id,name,status,repel,accept,buyprice,DATE_FORMAT(DATE_ADD(createdAt, INTERVAL 543 YEAR), "%d %M %Y") AS Date FROM buyforms
            `, {
                nest: true,
                type: QueryTypes.SELECT
            });
        res.json({ buyform: buy });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.setAccept = async(req, res) => {
    try {
        var id = req.body.id;
        const buy = await Buyform.update({ accept: true }, {
            where: {
                id: id
            }
        });
        res.json({ buyform: buy });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.fillDate = async(req, res) => {
    try {
        // const buy = await Buyform.findAll();
        const buy = await sequelize.query(
            `
            SELECT id,name,status,repel,accept,buyprice,DATE_FORMAT(DATE_ADD(createdAt, INTERVAL 543 YEAR), "%d %M %Y") AS Date FROM buyforms
            WHERE createdAt BETWEEN "${req.body.start}" AND "${req.body.end}"
            `, {
                nest: true,
                type: QueryTypes.SELECT
            })
        res.json({ buyform: buy });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.insert_buy_sup = (req, res) => {
    Buyform.create({
        status: false,
        repel: false,
        name: req.body.name,
        buyprice: req.body.buyprice,
        userId: req.body.userId,
    }).then(buy => {
        const id = buy.id;
        if (req.body.supplie) {
            Supplie.findAll({
                where: {
                    id: {
                        [Op.or]: req.body.supplie
                    }
                }
            }).then(sup => {
                const length = req.body.supplie.length;
                console.log(id);
                buy.setSupplies(sup).then(() => {
                    for (i = 0; i < length; i++) {
                        console.log(req.body.supplie[i]);
                        console.log(req.body.units[i]);
                        sequelize.query(
                            `UPDATE supplie_buy SET unit=${req.body.units[i]}, sum=${req.body.sum[i]}
                                WHERE buyId=${id} AND supplieId=${req.body.supplie[i]}`, {
                                nest: true,
                                type: QueryTypes.UPDATE
                            }
                        );
                    }
                    res.send({ message: 'insert buyform compelete' });
                });
            });
        } else {
            res.send({ message: 'insert buyform fail' });
        }
        sequelize.query(
            `
            SELECT MAX(serial) AS max FROM buyforms WHERE serial LIKE '%${req.body.year}'
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        ).then(T => {
            console.log('T' + T[0].max);
            var tt = T[0].max;
            if (T[0].max != null) {
                console.log('T');
                res.json({ t: T });
                var num = T[0].max;
                var serialRV = Number(num.substring(2, 3));
                var SR = 'ร.' + (serialRV + 1) + '/' + req.body.year;
                console.log('d' + serialRV);
                console.log(SR);
                Buyform.update({ serial: SR }, {
                    where: {
                        id: id
                    }
                });
            } else {
                console.log('55');
                var SR2 = 'ร.' + 1 + '/' + req.body.year;
                console.log(SR2);
                Buyform.update({ serial: SR2 }, {
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

exports.get_by_id = async(req, res) => {
    try {
        const buy = await sequelize.query(
            `SELECT bf.repel,bf.accept,bf.store, bf.id,bf.status,bf.buyprice,users.fullname,sup.supplie_name,
            sup.price,sb.unit,sup.unit_name,sb.supplieId,clas.name FROM buyforms AS bf
            INNER JOIN supplie_buy AS sb ON bf.id = sb.buyId
            INNER JOIN users ON users.id = bf.userId
            INNER JOIN supplies AS sup ON sb.supplieId = sup.id
            INNER JOIN clas ON users.claId = clas.id
            WHERE bf.id = ${req.body.id}`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({ buy: buy });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.set_buy_status = async(req, res) => {
    try {
        const update = await Buyform.update({...req.body }, { where: { id: req.body.id } });
        res.json({
            update: update
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};