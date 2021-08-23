const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const db = require("../models");
const Supplie = db.supplie;
const SupYear = db.supplie_year;
const Store = db.store;
const YearUnit = db.year_unit;
const Supcate = db.supcate;
const Op = db.Sequelize.Op;

exports.listAll_supplie = async(req, res) => {
    try {
        const supplies = await sequelize.query(
            `
            SELECT supplies.id,supplies.supplie_name,supplie_years.id,supplie_years.year,SUM(unit) AS unit,stores.name,supplies.unit_name,supplies.price 
            FROM supplie_years
            INNER JOIN supplies ON supplie_years.supplieId = supplies.id
            INNER JOIN year_units ON year_units.supplieYearId = supplie_years.id
            LEFT JOIN stores ON supplies.storeId = stores.id
            GROUP BY supplie_years.id
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({
            sup: supplies
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.getSupplie = async(req, res) => {
    try {
        const supplie = await sequelize.query(
            `
            SELECT * FROM supplies AS sup
            INNER JOIN supplie_years AS sy ON sup.id = sy.supplieId
            WHERE sup.id = ${req.body.id} AND sy.year = "${req.body.year}"
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({
            supplie: supplie
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.getSupplieRemain = async(req, res) => {
    try {
        const supplie = await sequelize.query(
            `
            SELECT SUM(unit) as units FROM supplie_years 
            WHERE supplie_years.supplieId = ${req.body.id} AND supplie_years.year = "${req.body.year}"
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({
            supplie: supplie
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.getHistory = async(req, res) => {
    try {
        const supplie = await sequelize.query(
            `
            SELECT bf.serial AS serial, s.price AS price, bf.name AS name,sb.unit AS units,sb.sum,'-' AS unit, '-' AS prices,sb.remain AS remain,s.unit_name, (sb.remain*s.price) AS sums FROM buyforms AS bf
            INNER JOIN supplie_buy AS sb ON bf.id = sb.buyId
            INNER JOIN supplies AS s ON sb.supplieId = s.id
            INNER JOIN supplie_years AS sy ON s.id = sy.supplieId
            WHERE sb.supplieId = ${req.body.id} AND bf.serial LIKE '%64'
            UNION
SELECT rv.serial AS serial,'-' AS price,users.fullname AS name,'-' AS units,'-' AS sum,rs.unit,(rs.unit*s.price) AS prices,rs.remain AS remain,s.unit_name,(rs.remain*s.price) AS sums FROM reveals AS rv
             INNER JOIN reveal_sup AS rs ON rs.revealId = rv.id
             INNER JOIN supplies AS s ON rs.supplieId = s.id
             INNER JOIN supplie_years AS sy ON s.id = sy.supplieId
            LEFT JOIN users ON rv.userId = users.id
            WHERE rs.supplieId =  ${req.body.id} AND rv.serial LIKE '%64'
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        res.json({
            supplie: supplie
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.createSupplie = async(req, res) => {
    try {
        const supplie = await Supplie.create({...req.body }).then(sup => {
            SupYear.create({
                year: req.body.year,
                supplieId: sup.id
            }).then(unit => {
                console.log(unit.id);
                YearUnit.create({
                    unit: 0,
                    supplieYearId: unit.id
                });
                res.send({ message: 'complete' });
            });
        });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};

exports.insertStore = async(req, res) => {
    try {
        const store = await Store.create({...req.body });
        console.log('store');
        res.json({
            message: 'insertStoreCompelete'
        });
    } catch (e) {
        res.status(403).json({ message: e.errors });
    }
};

exports.updateSupplie = async(req, res) => {
    const id = req.body.id;
    console.log(req.body.id);
    console.log(req.body.price);
    console.log(req.body.unit_name);
    console.log(req.body.supplie_name);
    try {
        const supplie = await Supplie.update({...req.body }, { where: { id: id } });
        console.log('1');
        res.json({
            message: `This Column Updated is ${supplie[0] ? true : false}`
        });
    } catch (e) {
        res.status(403).json({ message: e.errors[0].message });
    }
};

exports.deleteSuppie = async(req, res) => {
    try {
        const supplie = await Supplie.update({ unit: 0 }, {
            where: {
                id: req.body.id
            }
        });
        res.json({
            message: `supplile of deleted is ${supplie ? true : false}`
        });
    } catch (e) {
        res.status(403).json({
            message: e.message

        });
    }
};

exports.filter = async(req, res) => {
    const filter = req.body.filter;
    console.log(filter);
    try {
        const supplie = await Supplie.findAll({
            where: {
                supplie_name: {
                    [Op.substring]: `${filter}`
                }
            }
        });
        const supplies = await sequelize.query(
            `
            SELECT supplie_years.supplieId,supplies.supplie_name,supplie_years.id,supplie_years.year,supplie_years.unit,stores.name,supplies.unit_name,supplies.price 
            FROM supplie_years
            INNER JOIN supplies ON supplie_years.supplieId = supplies.id
            INNER JOIN year_units ON year_units.supplieYearId = supplie_years.id
            LEFT JOIN stores ON supplies.storeId = stores.id
            WHERE supplies.supplie_name LIKE "%${filter}%" AND supplie_years.year = "${req.body.year}" AND supplie_years.unit != 0
            GROUP BY supplie_years.id
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        console.log(supplies);
        res.json({
            sup: supplies
        });
        if (supplie === null) {
            res.json({
                message: 'This Supplie Not Found!'
            });
            return;
        }
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.filterOffer = async(req, res) => {
    const filter = req.body.filter;
    console.log(filter);
    try {
        const supplie = await Supplie.findAll({
            where: {
                supplie_name: {
                    [Op.substring]: `${filter}`
                }
            }
        });
        const supplies = await sequelize.query(
            `
            SELECT supplie_years.supplieId,supplies.supplie_name,supplie_years.id,supplie_years.year,supplie_years.unit,stores.name,supplies.unit_name,supplies.price 
            FROM supplie_years
            INNER JOIN supplies ON supplie_years.supplieId = supplies.id
            INNER JOIN year_units ON year_units.supplieYearId = supplie_years.id
            LEFT JOIN stores ON supplies.storeId = stores.id
            WHERE supplies.supplie_name LIKE "%${filter}%" AND supplie_years.year = "${req.body.year}"
            GROUP BY supplie_years.id
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        console.log(supplies);
        res.json({
            sup: supplies
        });
        if (supplie === null) {
            res.json({
                message: 'This Supplie Not Found!'
            });
            return;
        }
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.insertUnit = async(req, res) => {
    try {
        const supY = await SupYear.findAll({
            where: {
                [Op.and]: [{ year: req.body.year }, { supplieId: req.body.supplieId }]
            }
        }).then(unit => {
            console.log(unit[0].id);
            var sum = (unit[0].unit + req.body.unit);
            console.log(req.body.unit);
            SupYear.update({
                unit: sum
            }, {
                where: {
                    [Op.and]: [{ year: req.body.year }, { supplieId: req.body.supplieId }]
                }
            });
            const u = YearUnit.create({
                unit: req.body.unit,
                supplieYearId: unit[0].id
            });
            res.json({
                unit: unit
            });
            // var len = unit.length
            // if(len == 0){
            //     SupYear.create({
            //         unit: req.body.unit,
            //         supplieId: req.body.supplieId,
            //         year:req.body.year
            //     })
            // } else{
            //     var newUnit = unit[0].unit + req.body.unit
            //     SupYear.update({unit: newUnit},
            //         {where: { id: unit[0].id}}
            //     )
            //     console.log(unit[0].id)
            //     res.json({
            //         sup:unit
            //     })
            // }
        });

    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.updateUnit = async(req, res) => {
    try {
        const supY = await SupYear.findAll({
            where: {
                [Op.and]: [{ year: req.body.year }, { supplieId: req.body.supplieId }]
            }
        }).then(unit => {
            console.log(unit[0].id);
            var sum = (unit[0].unit + req.body.unit);
            console.log(req.body.unit);
            SupYear.update({
                unit: req.body.unit
            }, {
                where: {
                    [Op.and]: [{ year: req.body.year }, { supplieId: req.body.supplieId }]
                }
            });
            // const u = YearUnit.create({
            //     unit: req.body.unit,
            //     supplieYearId: unit[0].id
            // });
            res.json({
                unit: unit
            });
            // var len = unit.length
            // if(len == 0){
            //     SupYear.create({
            //         unit: req.body.unit,
            //         supplieId: req.body.supplieId,
            //         year:req.body.year
            //     })
            // } else{
            //     var newUnit = unit[0].unit + req.body.unit
            //     SupYear.update({unit: newUnit},
            //         {where: { id: unit[0].id}}
            //     )
            //     console.log(unit[0].id)
            //     res.json({
            //         sup:unit
            //     })
            // }
        });

    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.getNew = async(req, res) => {
    try {
        const supplies = await sequelize.query(
            `
            SELECT supplie_years.supplieId,supplies.supplie_name,supplie_years.id,supplie_years.year,supplie_years.unit,stores.name,supplies.unit_name,supplies.price 
            FROM supplie_years
            INNER JOIN supplies ON supplie_years.supplieId = supplies.id
            INNER JOIN year_units ON year_units.supplieYearId = supplie_years.id
            LEFT JOIN stores ON supplies.storeId = stores.id
            WHERE supplie_years.year = "${req.body.year}"
            GROUP BY supplie_years.id
            `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        console.log(supplies);
        res.json({
            sup: supplies
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.deleteunit = async(req, res) => {
    try {
        await sequelize.query(
            `
            UPDATE supplie_years
            SET unit = 0
            WHERE supplie_years.supplieId = ${req.body.supplieId} AND supplie_years.year ='${req.body.year}'
            `
        );
        res.send({ message: "set 0" });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.store = async(req, res) => {
    try {
        const store = await Store.findAll();
        res.json({
            store: store
        });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.supcateInsert = async(req, res) => {
    try {
        const supcate = await Supcate.create({...req.body });
        res.json({ supcate: supcate });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};

exports.supcatefind = async(req, res) => {
    try {
        const supcate = await Supcate.findAll();
        res.json({ supcate: supcate });
    } catch (e) {
        res.status(403).json({
            message: e
        });
    }
};