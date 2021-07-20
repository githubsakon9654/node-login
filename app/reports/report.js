const pdfMake = require('../../pdfmake/pdfmake');
const vfsFonts = require('../../pdfmake/vfs_fonts');
const db = require("../models");
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const Supplie = db.supplie;
const Durable = db.durable;
const User = db.user;
const Offer = db.offer;
var date = (Date()).substring(0, 24);
pdfMake.vfs = vfsFonts.pdfMake.vfs;

pdfMake.fonts = {
    THSarabunNew: {
        normal: 'THSarabunNew.ttf',
        bold: 'THSarabunNew-Bold.ttf',
        italics: 'THSarabunNew-Italic.ttf',
        bolditalics: 'THSarabunNew-BoldItalic.ttf'
    },
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
    }
};
// done
exports.supplieList = async(req, res, next) => {
    var { id, id2, id3 } = req.params;
    console.log(id3);
    const supplies = await sequelize.query(
        `
    SELECT supplie_years.supplieId,supplies.supplie_name,supplie_years.id,supplie_years.year,supplie_years.unit,stores.name,supplies.unit_name,supplies.price 
            FROM supplie_years
            INNER JOIN supplies ON supplie_years.supplieId = supplies.id
            INNER JOIN year_units ON year_units.supplieYearId = supplie_years.id
            LEFT JOIN stores ON supplies.storeId = stores.id
            WHERE supplie_years.year = "${id}/${id2}"
            GROUP BY supplie_years.id
    `, {
            nest: true,
            type: QueryTypes.SELECT
        }
    );
    const fullname = await User.findAll({ where: { id: id3 } });
    console.log(fullname[0].fullname);
    var fname = fullname[0].fullname;
    var length = supplies.length;
    var rows = [];
    rows.push([
        { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อพัสดุ', style: 'fillheader', alignment: 'center' },
        { text: 'ราคาต่อหน่วย(บาท)', style: 'fillheader' }, { text: 'คงเหลือ', style: 'fillheader', alignment: 'center' },
        { text: 'หน่วย', style: 'fillheader', alignment: 'center' }
    ]);

    for (var i = 0; i < length; i++) {
        var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(supplies[i].price);
        rows.push([{ text: i + 1, alignment: 'center' }, supplies[i].supplie_name, { text: price, alignment: 'center' }, { text: supplies[i].unit, alignment: 'center' }, { text: supplies[i].unit_name, alignment: 'center' }]);
    }

    var documentDefinition = {

        pageSize: 'A4',

        header: function(currentPage, pageCount, pageSize) {
            // you can apply any logic and return any valid pdfmake element
            // return [
            //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
            //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

            //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
            // ];
        },
        footer: function(currentPage, pageCount) {
            return {
                columns: [
                    { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                    { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                    { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                ]
            };
        },
        content: [
            { image: 'logo', width: 70, height: 70, alignment: 'center' },
            { text: 'บัญชีรายการพัสดุ ประจำปีงบประมาณ' + id + '/' + id2, style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 0], alignment: 'center' },
            { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
            { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', 'auto'],
                    body: rows
                },
                layout: {
                    hLineWidth: function(i, node) {
                        if (i === 0) {
                            return 0;
                        }
                        return (i === node.table.body.length);
                    },
                    vLineWidth: function(i) {
                        return 0;
                    },
                    hLineColor: function(i, node) {
                        return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                    },
                    paddingLeft: function(i) {
                        return i === 0 ? 0 : 8;
                    },
                    paddingRight: function(i, node) {
                        return 0;
                    }
                }
            }
        ],
        images: {
            logo: 'data:image/;base64,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'
        },
        styles: {
            fillheader: {
                fontSize: 18,
                bold: true,
                fillColor: '#A9A9A9'
            }
        },
        defaultStyle: {
            font: 'THSarabunNew',
            fontSize: 14
        }
    };




    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment;filename="supplielist.pdf"'
        });

        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
};
// done
exports.durableList = async(req, res, next) => {
    var { id, id2, id3 } = req.params;
    const durables = await Durable.findAll();
    const fulname = await User.findAll({ where: { id: id3 } });
    console.log(fulname[0].fullname);
    var fname = fulname[0].fullname;
    const list = await sequelize.query(
        `SELECT db.id,db.du_name,db.du_status,db.du_serial,db.get,users.fullname,db.du_price,db.date FROM durables AS db 
    LEFT JOIN users ON db.userId = users.id`, {
            nest: true,
            type: QueryTypes.SELECT
        }
    );
    var length = list.length;
    var rows = [];
    rows.push([
        { text: 'วัน/เดือน/ปี', style: 'fillheader' }, { text: 'เลขที่หรือรหัส', style: 'fillheader' },
        { text: 'ชื่อครุภัณฑ์', style: 'fillheader' }, { text: 'หมายเลขและทะเบียน', style: 'fillheader' },
        { text: 'ราคาต่อหน่วย(บาท)', style: 'fillheader' }, { text: 'วิธีการได้มา', style: 'fillheader' },
        { text: 'ถือครอง', style: 'fillheader' },
    ]);

    var fullname = '';
    for (var i = 0; i < length; i++) {
        if (!list[i].fullname) {
            fullname = 'คลัง';
        } else {
            fullname = list[i].fullname;
        }
        var cate = list[i].du_serial.substring(4, 12);
        var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].du_price);
        var date = list[i].date.toString();
        var month = date.substring(5, 7);
        var year = +((list[i].date.toString()).substring(2, 4)) + 43;
        var day = (list[i].date.toString()).substring(8, 10);
        var THmonth;
        switch (+month) {
            case 1:
                THmonth = ' ม.ค. ';
                break;
            case 2:
                THmonth = ' ก.พ. ';
                break;
            case 3:
                THmonth = ' มี.ค. ';
                break;
            case 4:
                THmonth = ' เม.ย. ';
                break;
            case 5:
                THmonth = ' พ.ค. ';
                break;
            case 6:
                THmonth = ' มิ.ย. ';
                break;
            case 7:
                THmonth = ' ก.ค. ';
                break;
            case 8:
                THmonth = ' ส.ค. ';
                break;
            case 9:
                THmonth = ' ก.ย. ';
                break;
            case 10:
                THmonth = ' ตุ.ค. ';
                break;
            case 11:
                THmonth = ' พฤ.ย. ';
                break;
            case 12:
                THmonth = ' ธ.ค. ';
        }
        var THdate = day + THmonth + year;
        // console.log(THdate)
        rows.push([
            THdate, cate, list[i].du_name, list[i].du_serial, price, list[i].get, fullname
        ]);
    }
    var documentDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        // header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [0, 0, 0, 5], alignment: 'center' },
        header: function(currentPage, pageCount, pageSize) {

            // you can apply any logic and return any valid pdfmake element
            // return [
            //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
            //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

            //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
            // ];
        },
        footer: function(currentPage, pageCount) {

            return {
                columns: [
                    { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                    { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                    { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                ]
            };
        },
        content: [
            { text: 'ทะเบียนครุภัณฑ์', style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 0], alignment: 'center' },
            {
                alignment: 'justify',
                columns: [
                    { text: 'แผ่นที่ ', style: 'header', fontSize: 18, bold: true, margin: [0, 0, 0, 0], alignment: '' },
                    { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 18, bold: true, margin: [0, 0, 0, 0], alignment: '' },
                ]
            },
            {
                alignment: 'justify',
                columns: [
                    { text: 'ประเภท ', style: 'header', fontSize: 18, bold: true, margin: [0, 0, 0, 10], alignment: '' },
                    { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 18, bold: true, margin: [0, 0, 0, 10], alignment: '' },
                ]
            },
            {
                table: {
                    widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
                    body: rows
                },
                // layout: {
                //   fillColor: function (rowIndex, node, columnIndex) {
                //     return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                //   }
                // }
            }
        ],
        pageBreakBefore: function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
            //check if signature part is completely on the last page, add pagebreak if not
            if (currentNode.id === 'signature' && (currentNode.pageNumbers.length != 1 || currentNode.pageNumbers[0] != currentNode.pages)) {
                return true;
            }
            //check if last paragraph is entirely on a single page, add pagebreak if not
            else if (currentNode.id === 'closingParagraph' && currentNode.pageNumbers.length != 1) {
                return true;
            }
            return false;
        },
        styles: {
            fillheader: {
                fontSize: 18,
                bold: true,
                fillColor: '#A9A9A9'
            }
        },
        defaultStyle: {
            font: 'THSarabunNew',
            fontSize: 14
        }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment;filename="durablelists.pdf"'
        });

        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
};
// done
exports.offerList = async(req, res, next) => {
    try {
        var { id, id2, id3 } = req.params;
        const list = await sequelize.query(
            `SELECT db.id,db.offer_name,db.offer_status,users.fullname,db.createdAt FROM offers AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE  db.offer_status = true
      `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อคนเสนอ', style: 'fillheader' },
            { text: 'สถานะ', style: 'fillheader' }, { text: 'เวลาที่เสนอ', style: 'fillheader' }
        ]);
        var status = '';
        var date = '';
        var fullname;
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        for (var i = 0; i < length; i++) {
            if (!list[i].offer_status) {
                status = 'ยังไม่รับทราบ';
            } else {
                status = 'รับทราบแล้ว';
            }
            fullname = list[i].fullname;
            date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);


            var year = +((list[0].createdAt).toISOString()).substring(0, 4) + 543;
            var month = ((list[0].createdAt).toISOString()).substring(5, 7);
            var day = ((list[0].createdAt).toISOString()).substring(8, 10);
            var THmonth;
            console.log(year);
            console.log(+month);
            console.log(day);
            switch (+month) {
                case 1:
                    THmonth = ' มกราคม ';
                    break;
                case 2:
                    THmonth = ' กุมภาพันธ์ ';
                    break;
                case 3:
                    THmonth = ' มีนาคม ';
                    break;
                case 4:
                    THmonth = ' เมษายน ';
                    break;
                case 5:
                    THmonth = ' พฤษภาคม ';
                    break;
                case 6:
                    THmonth = ' มิถุนายน ';
                    break;
                case 7:
                    THmonth = ' กรกฎาคม ';
                    break;
                case 8:
                    THmonth = ' สิงหาคม ';
                    break;
                case 9:
                    THmonth = ' กันยายน ';
                    break;
                case 10:
                    THmonth = ' ตุลาคม ';
                    break;
                case 11:
                    THmonth = ' พฤศจิกายน ';
                    break;
                case 12:
                    THmonth = ' ธันวาคม ';

            }
            var THdate = 'วันที่ ' + day + THmonth + 'พ.ศ. ' + year;
            var THdate2 = day + THmonth + 'พ.ศ. ' + year;
            console.log(THdate);

            rows.push([i + 1, fullname, status, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'บัญชีรายการแบบเสนอ ' + id + '/' + id2, style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {

                        widths: ['auto', 200, '*', 'auto'],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                }
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="offerlist.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};
// done
exports.borrowList = async(req, res, next) => {
    try {
        var { id, id2, id3 } = req.params;
        const list = await sequelize.query(
            `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt FROM borrows AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.admin_approve = true AND db.dire_approvev = true
      `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อผู้ยืมครุภัณฑ์', style: 'fillheader' },
            { text: 'เจ้าหน้าที่อนุมัติ', style: 'fillheader' }, { text: 'ผู้อำนวยการที่อนุมัติ', style: 'fillheader' },
            { text: 'เวลาที่ขอยืม', style: 'fillheader' }
        ]);
        var date = '';
        var adstatus = '';
        var distatus = '';
        var fullname;
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        for (var i = 0; i < length; i++) {
            if (!list[i].dire_approvev) {
                distatus = 'ยังไม่อนุมัติ';
            } else {
                distatus = 'อนุมัติ';
            }
            if (!list[i].admin_approve) {
                adstatus = 'ยังไม่อนุมัติ';
            } else {
                adstatus = 'อนุมัติ';
            }
            fullname = list[i].fullname;
            date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);
            var dates = list[i].createdAt.toISOString();
            console.log(dates);
            var month = dates.substring(5, 7);
            var year = +((dates).substring(2, 4)) + 43;
            var day = (dates).substring(8, 10);
            var THmonth;
            switch (+month) {
                case 1:
                    THmonth = ' ม.ค. ';
                    break;
                case 2:
                    THmonth = ' ก.พ. ';
                    break;
                case 3:
                    THmonth = ' มี.ค. ';
                    break;
                case 4:
                    THmonth = ' เม.ย. ';
                    break;
                case 5:
                    THmonth = ' พ.ค. ';
                    break;
                case 6:
                    THmonth = ' มิ.ย. ';
                    break;
                case 7:
                    THmonth = ' ก.ค. ';
                    break;
                case 8:
                    THmonth = ' ส.ค. ';
                    break;
                case 9:
                    THmonth = ' ก.ย. ';
                    break;
                case 10:
                    THmonth = ' ตุ.ค. ';
                    break;
                case 11:
                    THmonth = ' พฤ.ย. ';
                    break;
                case 12:
                    THmonth = ' ธ.ค. ';
            }
            var THdate = day + THmonth + year;
            rows.push([{ text: i + 1, alignment: 'center' }, fullname, adstatus, distatus, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'บัญชีรายการยืมครุภัณฑ์ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {

                        widths: ['auto', 100, '*', '*', 'auto'],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                }
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="borrowlist.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};
// done
exports.borrowListByUser = async(req, res, next) => {
    try {
        var { id3 } = req.params;
        console.log(id3);
        const list = await sequelize.query(
            `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt FROM borrows AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.userId = ${id3}`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อผู้ยืมครุภัณฑ์', style: 'fillheader' },
            { text: 'เจ้าหน้าที่อนุมัติ', style: 'fillheader' }, { text: 'ผู้อำนวยการที่อนุมัติ', style: 'fillheader' },
            { text: 'เวลาที่ขอยืม', style: 'fillheader' }
        ]);
        var date = '';
        var adstatus = '';
        var distatus = '';
        var fullname;

        for (var i = 0; i < length; i++) {
            if (!list[i].dire_approvev) {
                distatus = 'ยังไม่อนุมัติ';
            } else {
                distatus = 'อนุมัติ';
            }
            if (!list[i].admin_approve) {
                adstatus = 'ยังไม่อนุมัติ';
            } else {
                adstatus = 'อนุมัติ';
            }
            fullname = list[i].fullname;
            date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);
            var dates = list[i].createdAt.toISOString();
            console.log(dates);
            var month = dates.substring(5, 7);
            var year = +((dates).substring(2, 4)) + 43;
            var day = (dates).substring(8, 10);
            var THmonth;
            switch (+month) {
                case 1:
                    THmonth = ' ม.ค. ';
                    break;
                case 2:
                    THmonth = ' ก.พ. ';
                    break;
                case 3:
                    THmonth = ' มี.ค. ';
                    break;
                case 4:
                    THmonth = ' เม.ย. ';
                    break;
                case 5:
                    THmonth = ' พ.ค. ';
                    break;
                case 6:
                    THmonth = ' มิ.ย. ';
                    break;
                case 7:
                    THmonth = ' ก.ค. ';
                    break;
                case 8:
                    THmonth = ' ส.ค. ';
                    break;
                case 9:
                    THmonth = ' ก.ย. ';
                    break;
                case 10:
                    THmonth = ' ตุ.ค. ';
                    break;
                case 11:
                    THmonth = ' พฤ.ย. ';
                    break;
                case 12:
                    THmonth = ' ธ.ค. ';
            }
            var THdate = day + THmonth + year;
            rows.push([{ text: i + 1, alignment: 'center' }, fullname, adstatus, distatus, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'ใบรายการยืมครุภัณฑ์ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {

                        widths: ['auto', 100, '*', '*', 'auto'],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                }
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="borrowlist.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};
//done
exports.revealList = async(req, res, next) => {
    try {
        var { id3 } = req.params;
        const list = await sequelize.query(
            `SELECT db.id,db.admin_approve,users.fullname,db.createdAt,db.total_price FROM reveals AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.admin_approve = true 
      `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อคนเบิกพัสดุ', style: 'fillheader' },
            { text: 'ราคา', style: 'fillheader' }, { text: 'เจ้าหน้าที่', style: 'fillheader' },
            { text: 'เวลาที่ขอเบิก', style: 'fillheader' }
        ]);
        var datet = '';
        var adstatus = '';
        var distatus = '';
        var fullname;
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        for (var i = 0; i < length; i++) {
            if (!list[i].admin_approve) {
                adstatus = 'ยังไม่อนุมัติ';
            } else {
                adstatus = 'อนุมัติ';
            }
            fullname = list[i].fullname;
            datet = (Date(list[i].createdAt)).substring(0, 24);
            console.log(datet);
            var dates = list[i].createdAt.toISOString();
            console.log(dates);
            var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].total_price);
            var month = dates.substring(5, 7);
            var year = +((dates).substring(2, 4)) + 43;
            var day = (dates).substring(8, 10);
            var THmonth;
            switch (+month) {
                case 1:
                    THmonth = ' ม.ค. ';
                    break;
                case 2:
                    THmonth = ' ก.พ. ';
                    break;
                case 3:
                    THmonth = ' มี.ค. ';
                    break;
                case 4:
                    THmonth = ' เม.ย. ';
                    break;
                case 5:
                    THmonth = ' พ.ค. ';
                    break;
                case 6:
                    THmonth = ' มิ.ย. ';
                    break;
                case 7:
                    THmonth = ' ก.ค. ';
                    break;
                case 8:
                    THmonth = ' ส.ค. ';
                    break;
                case 9:
                    THmonth = ' ก.ย. ';
                    break;
                case 10:
                    THmonth = ' ตุ.ค. ';
                    break;
                case 11:
                    THmonth = ' พฤ.ย. ';
                    break;
                case 12:
                    THmonth = ' ธ.ค. ';
            }
            var THdate = day + THmonth + year;
            rows.push([i + 1, fullname, price, adstatus, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'บัญชีรายการเบิกพัสดุ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {

                        widths: ['auto', 150, '*', 'auto', '*'],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                }
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="reveallist.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};
//done
exports.revealByUser = async(req, res, next) => {
    try {
        const { id3 } = req.params;
        const list = await sequelize.query(
            `SELECT db.id,db.admin_approve,users.fullname,db.createdAt,db.total_price FROM reveals AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.userId = ${id3} AND db.admin_approve = true`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อคนเบิกพัสดุ', style: 'fillheader' },
            { text: 'ราคา', style: 'fillheader' }, { text: 'เจ้าหน้าที่', style: 'fillheader' },
            { text: 'เวลาที่ขอเบิก', style: 'fillheader' }
        ]);
        var date = '';
        var adstatus = '';
        var distatus = '';
        var fullname;
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        for (var i = 0; i < length; i++) {

            if (!list[i].admin_approve) {
                adstatus = 'ยังไม่อนุมัติ';
            } else {
                adstatus = 'อนุมัติ';
            }
            fullname = list[i].fullname;
            date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);
            var dates = list[i].createdAt.toISOString();
            var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].total_price);
            console.log(dates);
            var month = dates.substring(5, 7);
            var year = +((dates).substring(2, 4)) + 43;
            var day = (dates).substring(8, 10);
            var THmonth;
            switch (+month) {
                case 1:
                    THmonth = ' ม.ค. ';
                    break;
                case 2:
                    THmonth = ' ก.พ. ';
                    break;
                case 3:
                    THmonth = ' มี.ค. ';
                    break;
                case 4:
                    THmonth = ' เม.ย. ';
                    break;
                case 5:
                    THmonth = ' พ.ค. ';
                    break;
                case 6:
                    THmonth = ' มิ.ย. ';
                    break;
                case 7:
                    THmonth = ' ก.ค. ';
                    break;
                case 8:
                    THmonth = ' ส.ค. ';
                    break;
                case 9:
                    THmonth = ' ก.ย. ';
                    break;
                case 10:
                    THmonth = ' ตุ.ค. ';
                    break;
                case 11:
                    THmonth = ' พฤ.ย. ';
                    break;
                case 12:
                    THmonth = ' ธ.ค. ';
            }
            var THdate = day + THmonth + year;
            rows.push([i + 1, fullname, price, adstatus, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'ใบรายการเบิกพัสดุ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {

                        widths: ['auto', 150, '*', 'auto', 'auto', 150],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                }
            ],
            images: {
                logo: 'data:image/;base64,/9j/4AAQSkZJRgABAQEAeAB4AAD/4QFKRXhpZgAASUkqAAgAAAAJAA8BAgAGAAAAegAAABABAgANAAAAgAAAABoBBQABAAAAjQAAABsBBQABAAAAlQAAACgBAwABAAAAAgAAADEBAgALAAAAnQAAADIBAgAUAAAAqAAAABMCAwABAAAAAQAAAGmHBAABAAAAvAAAAAAAAABDYW5vbgBNUDI4MCBzZXJpZXMALAEAAAEAAAAsAQAAAQAAAFBob3RvU2NhcGUAMjAxMTowMToxNCAxMzo1NDozNQAJAACQBwAEAAAAMDIyMQSQAgAUAAAALgEAAAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAAAQAAAAKgAwABAAAAQAMAAAOgAwABAAAAlAMAAACjBwABAAAAAgAAAAOkAwABAAAAAAAAAAAAAAAyMDExOjAxOjE0IDEzOjU0OjM1AP/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIAMgAtgMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1SpOtFFABSUtJQAUUUUAFFFFABRSZqpJqCtIYrcfaJhwQp+Vf95u306+1AFqSQRLub6ADqT6VzniDxNaaFJAtwS11KwP7vkxL/AHvoPTvzVHxN40g0FXjSRL7VCMKi/ci+v+HU+1fMXij9o7w3pfxSsvCd/eC51S8ci5vPNHk2sh+5E5/vHpjtxnGa3jDqzCdR/DDVn2Ta3S3MYIILYBO05BB6EexqevL/AAT4tSGNLC7lEGwkW1y33Vz/AAN/s+leiQagskghlHk3HaNjw3up/iH6+tZyjys0hNTV0XKKbS5qCxaKTNHOenFAC0UlLQAUUUUAFFFFAC0lFFABRRSGgCG4vEtiAyTOT/zyiZ/5CoDqy8bbW7b/ALYEfzrL8dTPD4Yv3RmVgq/MhwR8w718tfEH9pvwp8L/ABA2ieINV1OHUPJW48u3gklUq2cfMDjseK0ULq9zKU2pcqVz62bVZNuVsLgf9dWRB+rVn3niZbZf31zp9mM4O+cyt/3yoH86+G9U/bm+H8EZa3TXdTfghfswjB/F3rjNU/byS4kMPhzwbLPKx+X7ZdZb2GyNSevvVcsO4/3r2ifeupePtNXKmW71Q/3FAghP17n8c15/8RPjpY+EtKafW9Ys/DWmqpCwqwV39lA+Zj7KK+RbDW/2nPjUoXw94bvNBsJeFuIbQWKAH/ptOdxGO612/gn/AIJw6jqV1/bnxa8bZ3HfNbWExkkb2e5l6f8AAR+NNuMFd6eouSUvjl9xwPjj9qDxL8VtWXwl8JdH1B7i7Pl/bkizdyA8EovSJf8AbY5/3a6vTf8AgnOx+H8kWveK47T4n6gTcWNoJN9quAS0UjYyxYnmQdCOAec/SXh+fwF8EdHk0f4b6Ba2zsNst7tJLn1eRvmkP1OK5G+1W81TUGvrq6llvGbd52cMCOmPTHtXwObcYYTBSVPDfvZX17JdbPv+X4Ee0jT0po+bvh7+0N4k+CviBvAXxW0y8tmsSIlupkLXEKdFLY4ljx0dc8etfZ3gn4n22raLDc6fe2viHQpQDHtcOq/7rDlT7Hp7VzviTT/A/wAdtBh0D4l6XHPNCMWmtRfu7iE+okHKn16qe4r538U/sU/Fb4M6hLrnwk8RP4j0xvnEFvKkN0V9HiY+VN9QQf8AZr6vLs1wuaUfaYeV+66r1X9eQ+WM3zQdmfdel+MLS6VVtdTFo/T7NqalwD6LICD+ZNdLBd3jKCYracf3rec4/Vf61+aGn/ti+LPAd9/ZXxG8FzRXkR2u6xtZT5H/AEzkG0/gQK9M8Oftn/D2+UM2q6locjclbi1cKP8AgUe4V6doehX72O8b+h90fbpR9+zlH+6yN/WmtqiKCXgulA/6Ylv5Zr5T0/8Aax8HvGoh+JFicdRNcEf+hLXX+Hfjcvi9Zm0HxVbawISBKbKRJNmegbA4pezT2ZLq2V3Fn0NBOtxEsiBgrdnUqfyIyKkBrI8K3U954d0+a5kMs8kQZ3OMk1rVk9HY2Turi06m0tIYtFFFABRRRQAUhpaa1AHOePiR4V1DH91f/QhX5xfFbw7p3jL9trwZomsWq3+l37WEFzbOzBZYzvypwc447Gv0c8fnHhXUPon/AKEK/PHxlub9vz4fAn/lvp/4cOa3XwGcf4vyPqHVPhH8DPhzq/2EfDDS5rmNVfe1qsw56cyMa29P+JfhrwyoXw94K0/TNowpghihAH/AF/rWd8YufHNz6eTEP/Ha4jbj6V+HZxxVmmHxtbDUqnLGMmlounrcwlKV2jvdU+NXiG+VhB9nsF6fu03sPxb/AArjdS1q+1iYy397PeN/01kJA+g6CqQT1oKDnI4r4jFZpjcbpiK0pLs3p92xk3KW4rMFX0OaaWC8EdOxpVtXumSFF3ySMEUepJwK7L4seG18P67aPGo2XFohbj+NQFY/jgGlRwM62Eq4uO0HFP8A7ev/AMD7yddzjRJ+X51taD4w1bwzJ/xLr144zyYW+aM/8BNY0Fq91KkUULTSucLHGuWb6AV2mlfB3xDqUYaSCLT0I/5eX+b/AL5GT+dbZdhcxr1PaZfGXMusdLfPT8xxvfQ0rj4sad4ksfsXivwxY61akYKyxJIhz1+SQEfka4LW/gf+zl4uLPdeCjo0zHJbTvNtv0ifb+ldN4w+Gdz4N02C7nv4bgyy+V5cUZHYnOT9P1rn9F0d9WulX7tunMjY/QV9ViOJ87yNuljmrpX95J7/AOE6qXtqk1TitWctqf7CPwU1jw/q2o6HeeIopbW0muEX7blcopI+/HkjOB17V5N+wT+80TxZISRuurfr/wBc25r7PsY1g8N+JlQBETR7kADoP3Zr4u/YHXb4f8V8fL9ptuh7+U3Wv0vhLOa2fZdHG14qLbkrLbR263O/H0fq8ZQvfY/RzwooXw1pmOnkL/Ktesvwyu3w7pg/6d0/kK1K+pluzljsgpaSlFSULRS0UAFFFFABTTTqbQBzfxA/5FW/z6J/6EK/PPxUob/goF4AH3ts9gPXoj1+hfxA/wCRVvu33P8A0IV+e3iJ8/8ABQXwKMYTz7HgHv5clbr4DOP8X5H1L8Yv+R6uuf8AllFx/wABrihkH3rtfjCf+K6u/wDrlF3/ANmuKyw//XX8w55/yNMT/jl+Zyy+JibaNvy8ce9AZsnA9q6LwH4X/wCEw8QxWcm6O2RfNnZeuwY4HuTgV5uEwtTGV4Yekryk7Iz9Dpfg74LbVNSXWrpP9CtT+43D/WSev0X+da/xisZ9e8SeH9Js133ciOcf3QSOT7DBP4V6bI1l4d0dn2pa2FnETtUYCKo7Vw/w3u28Xa5rXiaeMqSy2lsjf8s4wMkfXpn6mv3B5ThsLhKWSRd3Ud5Pq1HVv8FFf8BnRyKK5OrOj8IeCdO8H2YW3jV7phiW6YfO59vQe1ct8aPjRYfCnSAkYW98QXSn7JYZ/DzHx0UH8SeB3pPjV8atP+FOkFF2Xmv3CZtbLPAH/PSTHRR+ZIwO5HgPwP8AAeq/FbxtJ468VSSTaTazfaJLq44FzMv3UX/YUgZxxwBX65lOUYfDYX63iEoYeC0W3NbovLu/+Cz4rOs8qQxEcmyn3sRPd7qmusn5pa2+b6J+vePDqlx4d8IaRfym51iWH7TeSMAPnKjcSB0AJYfhUWn6fFptqkEQ4HJbuT6mtLV7z+1NautQcHdJhIweqxjoP5k/WqpPfkV/DPGOdrO82rVqP8O+nZ20v6dj9oynL/qdJOesrJa72/ze7L8J2+GfFR7/ANj3RGP+ubV8X/sE7X8K+Kv+vu3z74iJr7NDbfCPi8g4I0W7Of8Atm1fGn7BbhvCHigHr9sg/wDRNfv/AIb/APIhpf4p/mzyM4+OfyP0e8P8aFp2On2eP/0EVoVQ0H/kCaf/ANe8f/oIq/X6K9zzFsFLSUtIYtFFFAC0UUUAJSU6mmgDmfiEceFb7JwMx/8AoQr899cUt/wUE8ELnaBPY89f+WTmv0H+IX/Iq3vOOY//AEIV+fGpfP8A8FDvBa4yRNadv+ndzW6+Azj/ABfkfUnxf/5Hq9Hfy4v/AEEVxpzwD0rsPi9z48v+n3I//QBXG8YxnvX8w55/yM8T/jl+ZySfvMOfWux+Fvii28MeJC96wjtbqLyXlJ4jOQQT7cY/GuSt7WS+uY7eCNpZ5GCIi/eJJ4Fe8eCfhfY+HYI7i+jS+1PGSzDckR9FHf6mvV4Yy3G4rGxxOGtFU3rJ7elut1/w6CCcpaGh8Tg9x4B1QwHI8tXJXkFNwJ/Suc+Fc08fw9u/7PltI78zyiJrxiIw2AAWxyQPb0rG+Ln7R3hrwJJdaJFat4g1TaY57WJwkMWRgq788+yg49q8M+HnxY8M3GtGPxfY3NrZO/7qWykLRxj/AKaD7xHTkflX73W4ZzqeNp5vg6CnFQ5bSfL1vdKzb+SPmcZxRlGHxawk6659na9k/OVrJ/l1sejt8HfCFjrdzr3jvxXL4v1aZ/Ne2txtjZuykKSdo6AZUAcV2sniJ9ZsYIbezTSdGhAFrYxqF+UdCwHA9lHH1rqLH4deDtY0+3u7GzhmtZlEkVxbzsVdTyCDnmszxF4XfRcTREy2pONxHKex/wAa/LvETGcV4rAv2kl7BaSUL6LzVlp3svXQ+x4cynLsDVcqMEnLW+rcnvdyd2+61MEk/Smk05s8/lTdu2v5aP0wtSHb4N8ZHoRol3z/ANsmr40/YKUt4Q8UMDgfbIR/5Br7KuW2+B/GzA426FeHrj/lk9fHn7B6bfBXic8H/T4uF6f6kV/XXhurZBR9Z/8ApTPiM4+OfyP0a0L/AJAun46fZ4//AEEVfrP0Ft2iaccY/wBHj/8AQRWhX6I9zzVsFKKSlpDFoo+tFAC0UUUAJSUpptAHMfET/kVb3kj5o+n+8K/Pq+bd/wAFDvBx3fMZbT/0mev0F+Iv/Iq3n+9H/wChCvz4di3/AAUQ8Jq3BE9rz/26vW6+Azj/ABfkfUfxeOfHl9zjCR/+gCuNVe2TXYfFw/8AFeahxztj/wDQBXIKelfzFnT/AOFLEv8Avy/NnHL4mehfBHR0vfE1zeyDcLOHKA9nY4z+QP516f8AEfXZvC/gHxBq1tgXFnYyyxn0YKcH8DXAfAi4VdS1aDPzPFG4/AkH+Yr0/wAV6BH4o8NarpExxHfWsluT6blIB/PFfuHBaowy2hNrRybl/wCBf5IVSFSWFqRou02nb1tofmlJI80jSyO0krkszsclieST75pnPJq3qmm3Gi6jdWF3H5d1aytDKh7MpwR+lVOOuMCv64TTV1sfxY04yaluj6D/AGTfifc6L4nHhC8maTTNR3Naqx/1M4BOB6BgOnqB719dX1ql9ZzQuMrIpFfm14N1CTSfGGh3sR2vBfQuD9HFfpcfvH61+ScXYGkq6k1pUTTXfo/vTP6N8Ocxq4jAVMNN39k1byT2Xyaf5HjEsZVmU9VODTeat6svl6ndqOglYD8zVM5r/NXEUvYV50v5W192h/TkHzRTJ77H/Cv/AByTyP7BvM/9+Xr4+/YMZl8DeJgSAft8Z5POPJWvr7Uj/wAW78e5HH9gXnT/AK4vXyF+wepHgfxKwB51BAP+/K1/WXhz/wAiCj6z/wDSmfF5x8c/l+h+jHh//kA6djp9mj/9BFaFZ/h//kA6dzn/AEePn/gIrQr9Ce55q2ClFJS0hi0UUUALRRRQAhptOptAHL/Eb/kV7rnGXj/9Cr8/VBb/AIKKeFwQDia3PTPH2R6+/wD4lSeX4XuB/ekjH/j2f6V+f2lN9s/4KKaAWXcIZ4g20dNtmxz+tbr4DKP8V+h9P/FrK+PNSOf4Y8f98CuQ3ev6V1nxVbd471PPONi9P9gVyWMH1r+YM6a/tPEf45fmzll8TOk8A+IR4b8VWd27YgdvJm/3G4yfocH8K+kuq5Bz718ktg8H5a+lfh9qbav4O0u4kO6QReWxPcqduf0r9F4GxzkquCk9veX5P9DWjLVxPkD9qrw0PD/xYu7pE2Q6pBHdg443/df9Vz+NeObs/Svpz9tezC3nhO8xgmO4iLfQow/ma+ZeT/FgV/ZWSVnWy6jOW9rfc7fofyfxXho4XO8TTjtzX/8AAkpfqdJ8MdJOvfEPw3YhSfO1CEfgHBP6A1+jzMME5wOtfF/7I3g99c+I0msumbXR4GfdjgyyAqg/Lefwr688S6gNN0e4fOHceWn1Nfm/HGZUsLKVSo/dpQcn+f5WP2Tw1wM45fOs1rVnZekdPzv9x5lfSCa8uJD/AByM35mq/FPYjkUziv8ANqpUdWcqkt27n9ORVkkO1psfDP4gkc48P3n/AKJevkf9hNQ3gDxGy8Z1Jef+2KV9dapG03w78exR48x9AvFUt0yYXr5G/YLVv+Fe+InA+Qamikk/9MENf1t4dP8A4QKPrP8A9KZ8VnHxz+X6H6JeHWJ0HTiev2eP/wBBFaVZPhVt/hvSz/07p/Ktav0F7nmx2QUtJSikMWiiigBaKQ1WvLoW8bHesQVdzyP91F9TQBZOfwpteaXXxS8OSagbeDGoXSn/AFwuVWUe6jOR+Qrb0Xx5b30ixF2dj/BKAso/9lf8MH2NXyO1yPaRbsmHxQP/ABTZGcbpoxn86+DPAS/aP+CjlplMKsrj8rA193/EK4iv/DbNBIG8uVC3YryRgg8g89DXwX4JuP7N/wCCjFm8oAE07Kg6A77EgHPpWi+BCj/FfofSXxOYt461fJ/5aqP/AB1a5jbiuu+Klq1v461InpJskGfQqP8ACuZsbKbULpIIsFm7kcAdzX8t5z+6x+I59LTl+bOfllOfLFXbLmh6O2rXW1gwgTmR/wCg96+g/AsXk+HYUChUDMFA6AZrzTTdNS0hitbdRjOOnLE969i0uxGnadBbj/lmoBPv3r2vDtVcdmtbGLSnCHKvWTT/ACi/TQ+grYWODw8YP45O7+X/AA58v/tqairap4VsAfmjhnuG9RuZVH/oJr5ts7C51O8t7O0ge5uriQRxQxjLOxOAAPrX07+0B8EfGnxA+Jy3+k2kV1pkttFFHPJOqLBtzuDAnPUk8A9a9H+C/wCz7pnwvjGoXbpqfiJ1w11t/dwA9ViB6e7Hk+1f2xhc3wmV5XSipKU7bLu3fXta5/M2YcN5jxBxDiJum6dLmtzNaWSS93+a6V1bTu0bXwU+GifC/wAD22mvtfUpj9ovZF5BlIHyg+ij5R9Ce9M8bar9uvhbRnMVvwT2Ld/yrp/FGvJo9qY4zm7kGEH90f3jXmsjszEnn1Pev498TuKHWvllOV5zfNUt0W6j+vkku5/TWQZXTwVGEKUbQgrR/wA/63Yxhx7Uz+dK2W7frSZOelfzgfZl1bdrrwr4vgVtrSaLdICegJjYV8d/sFgt4B8TruxHHqcRCEYyTAMnP/AR+dfYN1drpngHxxqMoxHbaJdOTnHSJz1/CvkL9g2No/h34klddyyaogBB6bYFyP8Ax79K/rvw6i45BRv1c/8A0pnxOb255/L9D9C/CXHhnTB/0wX+Va9ZfhuPyvD+nL6QJ/LNSzassakxRmZRwZGYRxD/AIEev4Zr9De55cdkX6WsGHXjNcFTqGlqB1jWQs303Ej+Va9tdLcKeNki/eQ9R7+496VmUWKKQGikA122KWPavkb9uj4hX0Nr4S+H2la0NGPiXVobPUruGQLKkLEAjrkLyM/TFfV+p3iWNrNPJ/q4EMrZ9ugr4a+D/gW1/au+OvxC8Z69HJc+FLC2k0GwcEjdI33pYz2ZT8wPYsvpW1OPVkt6nh/xMP7P/wAPPG+qeDv+EP8AGkl3o1ybO58RWWtLHO8qcOyxOCpG7OM4zXUaL8QtZ+FnhvTPFvhzxl/wsv4aXOoR6ZNaaqhg1fT53BZYmUk5OASCrFTjtnNbP7TH7L+p+K9fiuxJHafEN0W3cXJEFn4oCDalxbyn5I7oqFDwOQSRkZ6nz23n0Dwn/wAKq+HmsyP4dm0q6m8R+J/7Yia223x4igIYDdtVAARkEPwa0V7lSUZR11P0D0DUb3xV4c1CyniMrx26zJIx/eLgghCR1718QftSWepfC/4xeD/ilpURkjilhEvYefCSQjH/AG48j/gJr3LwV+2Z8PbXUDpmmeKLWKeeQKZL21kSNyOAA7AAde+OtdX408NaT8StB1DTNVs47rStQX5o4ug5yGjbnBB5B7VdlK6RwxlKk4yludjqk2mfHLwNo/jrwjKt+k0AzGpG7b1aMjtIjZBH1rO0LSV0qA7x/pEn32I6f7NfFNjdfFL9iXxNeX3h+abWfBtxKDMssRa1mXt5q9YZAON68H1PSvqb4b/tifCf4zRwRahqB8D+IpMK0GqkLFI3+zMPkYf720+1fjnGXB9fNk8RgGlU+1F6KVtrPo/XR91197L6lClV9rJX7Pt8j0zTrkWd9BORuEbhiPoa9bs7yG+hWWCRZI2HBU15rP4TvVhW5tDHqNpINyTWrhgw9Rjr+FZokudPbb+9t37jlDX5pkOb5lwPKpQx2Ek4TaeulmtLqVmn/Wvf3cRRpY+0qc9UewswjUljgDua53XPGVvYq0dqVuJ+mQflX6nvXAyX08y4lmkkHozE1XZh0r1M18TcTiKTpZfS9k39pvmfyVkl6u5lRyqMXepK5YuryW7maaVzJIx5Y1XZjgg0zzB68VNb2lxeNi3hkmP+wua/GuWvi6r5U5zk/Ntv82e77tNdkQ5NLHGZGVFUszcBRyTV/UtLt/DWnvqPiTVrDw5pyDc9xqFwkYA/EgZrwH4m/t7fD/4d28lr8PoX8aa9/q1vZomSyVunDHDP9EGD/er9ByXgDNcympYmPsafeXxfKO9/WyPOrZhSpq0Peflt952n7X3j60+Dv7OmtabLcrH4h8URnT7W3Vvn2NgTP/urHnJ9WA7159+yf4Rl8N/BjRVnQxXWpyyaiy4IwkhAjBH+4iH/AIFXk3gv4W+NP2ivHC+PfivcTPZfK0OnzoYzKgOVjWP/AJZQg9urc+pNfYGg3lppN9byyW32mKE/LDGQoyOn4Cv6sy3L6WWYWnhaCtGCsv8Ag+b3fmfD4zEe1k03q3qeoeKPFNn4L8Km/wBWkjtLS2gz5cjhVwq8tIf7oAyQP1r428QftDfEL4yLfal4Ni0vwz4LspDFL4v8VyiC0B9Ikbgn0ADN9Ole+/ELxloXxAt20O5W082WN4JbWS6R3eN1wy7Ov6V8B+KrX+0P2dbvwxe36prHw+8UyRJYSSfPNbXR27lX+IrIoxjJAY13pWVyYuNSVj0nRdU8VeLr6607wz+0VpniHxRHBLc2+jw6TNHDeNGjO0ccskQQnCnAxg/rX1H+yr8WZviP4L0a/u28i6vIijDtHcISrLj+62CcfTvXx5+zT8C/FGh+JbLW5Lf7J4qvraSPQtJmX99CsqGN9QuU/wCWUMaMxUNgyNgAdTXrvw98Nz/s5fH/AFr4aJeTXGi3VpFrOhyTsWYcfvF9vmDZ9due9UldWfUdRKOsOh95QyGSMFl2t0K5zg0VV0u+XULO3ul+5cRrIPYkciiuRqzNTyf9pT4oWfgfwQ2lpb3epeIPEDfYNL0ywUNPcTODtUDt0yT2AJrz/wD4J332nSfs/jTrcLFqmn6ncxalDn51mLkgsPdcfl7V5v8Atzapqeg/ELT9VtHmgn/sfVLCxuIyd0NxJAhUp6OYxKFPqa8zn1zTfgL4h0rxn8IvGGh2k95YwfbfCl9eL5WoRbAQw54c+hIO4kg8kV0W0sRdaM/SXWtE07xHps2narY22p6fMMS2t3Essb/VWBFfLP7V37N2j3vw6jj0fVtRt7mW9trDS9FvpxeWhnmkVFSNpleWBcbmPlOAAp4rp/hJ+3H4B+IEsek+IZX8A+KVAWXTdbPlRFv+mcxAUj0DbT9a7nxHJb+PvjF4U0uGRbnT/Dlu/iC5aMhkM8gaG1Gf90zv/wB8mlHexptqfLXxYsdVhms7Ow8BaT4j8K2ljFb+Ivh5JpMEOsaayDa91aSRqJJEb7yzRs4zwRg8ePeIvhnpXhjSY/EGgN4y8f8AgVziG90DW/IutLJ/5d7y18l2hkXpnhWx26V9n+OfG0Pjr4zN8NvEnwwuL6O3Vbmw1yx1FPttvGxIW7QptaBdykf6wPxnawqt4y/Zh1uSaS603VLDxgCCFTxJ5llqqLjhU1Wz2yt/22R/c1d77gtND5W8O6xrvw50Dw540sNa8Rar4F1jU10S/wBB8Ywhbu2kcfLJEx+WWMjPzKB0wV5r0n4gfsk+AfHXmXMFm3h3UJBzPpOEjY+rRH5T+GK4/wAffsq30GrQ6zdah4t8LahZOssX/CXQHxFpaMDkBby33sq5x/rYh05rodJ8e/GXQ7XzrjwjovxI0mL5X1HwVqEc7qo7tEhLKf8AeRfSqTVrM5qkJX5qb1OBtf2dvjL8Hpmn+HPjqaS2XBFtbXj2jN9YmJjP51tWn7Z3x6+Fe2D4g+EbfxDYJgNNqGnmBiPaeH93+JU11dn+194MtpPI8Q2GueFbzOPJ1SwbAPcblyf0rudL+Nvw/wDEUKLZ+L9InEv/ACyluRGT9VfFZypU5rlktw9vWh8SuJ8NP20fhR8VJIbHUjP8P9amIVF1Bw9nI54wJl4HP94LXrviGTTvBmmXGq+JtXsdD0S3AZ9Tu5QsTgjIEfPzkjoFya+afid+zv8ADz4nWc1zps2n6FrbjMd9pssflux5HmRqdrA9yMN714b4F/Z/8ZfEbW/7C8a67d2vhnwvK1pCsl0ZV5O4rahjtCsCDv6YIAGeB8DmPAuTZjXhWdLls9eX3VJdml+as/M9ahms4Qa5vv1+4938bf8ABQnwb4fuTY+AvCN34svM7Uv9XYwRM2cApCAXYH32muKn+OH7UvxeUjR7ZvCWmSn5Psdmliqr6CSXMmPpXs/gz4f+BfhhZquj2Gm6eVGDdzSI0z+7SMcn860NS+LvgnR1Y3/i3RYMfezeox+mFJNfYYPK8Fl1P2eGpxgvJJf8OebUxtWs9Ff11PnOz/Y78V+OL8aj8Q/HE17OxyyxzSXcwPUjzJDgfgK9l8L/AAN+H3wh0641e20ZZJLOB55NQvSZ5gqKWJXPAPB+6BWPrH7XHw402RobHUbzXrhjjytNs3bJ+rbRVZviZ8U/iNps8XhT4O30WlXMbRvqXih/s1t5bAhixbYuMH+8a9Ncq+FHNL21R+9t9xw+vfFDx94g8F2vxA1DxnYfC/wJqN29rpSQWT319clchsqqnpgkklR6Cs/w+niXx9oOoatp/wAZPE6+FrNCdY8QatpQ0+wtou6xv5rNLM3AWNBkkjJFdf8AB/4S+OvB+jv4fk+Kok0hiXfwr4R0weISjHnG6RGgjPqS2K+gNN+BeueJlsUvdFjt7S0Obe+8cXK6pcRejQ6dBttIm9CxYjPSlp1OpRitEfHuifD3wdrnw78R6/D4F1nToFjMHhbVptRnbWda1HqCsQ/d+WoyzlVIUcbs819Ifs0/sqC38J6J4nF/o9hPqNsl0NUsbRr3U2DqDlbi5ykJ/wByLI7Nnmvpbwf8LdI8J3n9pyvca7rzReS+r6oyvP5feONQAkMf+xGqj61z/wAA9Pfwjout+B5WZ28NanLb2u7q1nKfOtj/AN8Pt+qEdqnm7D33Ou8GfD3Q/AdvcJpNs4ubt/NvL+6lae7u5P78szks5+pwOwFfMv7cN1p/hP4l/BXxVc3Edk0Wo3Nlczu+0fZmVM7j/dBY/nXuXxm/aG8FfAvSXuPEWpq2pMubbRbMiS9uW7BY8/KD/ebA96+HviDP4y+IWuad8X/HtjBb2X9pWumad4OvIt8S2E7mKRW3dJCHLbuDkZ4wAIjdu/YbtFWl1P0E+G97HqXhG1CzLI0RYEq2cAnK/gQaK+ef2RfEF/p/w309Y5nuI4vtVpAzncXt4rl44WJ7/Io59KKpxbd0Yxmo+6+h6V+1B8K7Dx94C1Ga48yOe1i86OW3OJY5Y8tFIh7MG49wSK/K/wAydxZeTptyA9gl/dW1siGCYSL88rgAsIwSNwAYKAcba/a3XtKXWNJurQnAmjK5POD2OPrX5veOvhu/wb8US2mtW81p4djuXm0rXoRN/wAS5mdn8meSEGWDazOY50V12sVdGX7qj7yNYyUJep3dn4B8G/ED4P6bBdHTvGjabpIjTUrch55Gji7SKd68jofxFeif8E59Ps7X9n9tUNxvu7zUJ/tTSSbmhWP5EQ8/KAoyAfWvnafwv4a8SMmo2Z0vVrhuTqOjzRRzvzn55NPuotx6nLWwY8kgVj+EJ/GvwG8SS6v8Pdb0rTtPnT/TdC1e5u2t7thkFmM8Ea5PQEPkeuKqUm0EKbhfU+nvh3488T6xofxC+I/gTQLfxf4m17XxD/Z9zc+Q1jpkKBLZijFTIWjHmqgK587INdz8Lf2nbPxJpEz+MLa18NX8D3sZETysJvsaB7pvKZA8PlggMr87uBu4J8M8C/tUfC3UPBereDPEWgXXwau9aBE99pKeZZPIQP3iTR5wMKBgjG3jOK9L8O/CiDRfD/gDVvhTeaJ8QLfw8dTe5Se/SL7eb1BufzEV1XDclGAyMDPFZ6Gj8z3Hwn8UvDPjLRrHVNL1VBBfTSWtvHdA280kyZ3xCN8MXG05UDtXh+v/ABN8NeKPGVhpPiT4H6/a6lqN+lrZajcaYqSctgyyTJgxqF+bh24HrWN4Z+GPin4Z+LvghpUvhltUstIsL0X99pinybW/u3/eyqwUqojUHG7bkP8ALkjFc5aeB9F+HP7SiaJoeu6/dfZ7e+1PXNQ1mb54MW6zI5lRke4Tc6krKpTK4VsqwFJai0PovVPgba3tu0MHibXEgx8tpqUsWq2y8Y4jvI5SB9GFeba7+xpomqeY0+heBNYd+S0+gS6dIfffazhQfogrhPhB8QPi43g/wBa3mrzS6l4x1iWaz1HVGjukmsls3lBUBmeNWkVGZTtKhiq4Fdh4P/aF8Vp8OtKXVLzSNQ8aX3jH/hHEgdkDNAtwY5ZQibd2NjgMFA+6SKWqCx5t4q/Y18D6PqNvYX2k+G9J1O8RpoLW38X3dq0iJlnZRNA+AAD1PQH0NV4v2ENL1TTbe507w/c39pOivFNB43UwyIRkMrfYuQc8Gur8Xa4vj3wD488YfErwlY33iX4dXbWNvp8N1LDZy71iLLII5G8xR5pHJ+YdVUsRXqfib4ifEb4far4ZiuNE8Jz6LrepHSNP0+yuJ0uIz5EkkLNIw8sA+UAQF+UNwTinfyDXueI6f+wFYRSDzvA9hcrnP/Ew8aXLg+xEVmv867TQ/wBinTtPkWSLwh8OtLI5Bmtb/VmH/f2eNSf+A10Ok/tIeIv+FZjWtb0fT9N12DxfB4XvLUllRN06RyMF3t86h+gZh39q8u+K37S/jTSfFWrxJ4qh0nTtJ1tbRLW00oLDfeVcRrLai4aQyrII33ksiBwrbMgZppy6BZvdn0B4f+Acmhx7U8S/2fH3tvDmjWWlR/TcsTyD/vvNdMvwl8H6ehvdS0xdSMKFnuteupL0IoGSczswUDn0rxj4v6h4j+F+reEL+5+KOt6hqeu61HaT6VbxQwWq2Ep8t5IohGxTymlhxIzn5iOpOKi8d/A7SfDHjzw7oNk2vXeieM9K1PRdZkm1O5uHmuFjSaCeRnZgr5RxuwBzjHai8n1FZI7f45fEhtB8CWdv4G8VaDok9whuvtCRG7JsVYIxtYYUcSOZHiQccbj9R5F8M/jNrfw98E/EO6dNX8U+Lms28TwR655Nvay2qYhkkiMUr8R+WS0fDE9gTmqHwX+HfiW+b4a2t/oPiOafTxqVv4hbWtOWwtIbO7jInhSThpmaULJkZzuY5HAr1Gz/AGTfCHw78fW/jCy1640fw7Bp13Z3+malciS3l89Ajv5sh+QFV+ZehKqeDnK0S1HpsaXw7+JHjGx+I2g+H/GWpafqth4q0M6vpF5aWAtPLnQqZrY4kcPhHR1OckZ9K88/bgvfEfh3XvAM3hjxDP4ak8TXR0DULizA850DB4mB6jbvk5BB+YCoda/aa+DPwx0jwt4c8NJe/FXX/DEXkaQNOjM7xNs8sk3GAoyvB2hunSvnz4geNviR8bvHWm+JfGO7wRBosu/RNMtxZslsxxl3+03EZLnC5Zh2GAOlJavTYeq1ZH8avgXZfDbwLaa9Zi81nUzfL/a+t387vMsZUhSWHKKX25I+bHevOvh7p+q+PLjR9DtNWO+6vzbxQ/apZbS1m8lpBcANnLiNZNqgld2G46V61deGb7xhH5+oajqPi6eHLLNqlwt9bWvbettbBbVSOfnuLjYuOQau/s9+A4r/AMdf2xp/+laDpbzst+HMi3+oSKI2Mb4HmrGm4eYAFLyMFG0CtbczMlJ04Pmd2fZ/wJ+Htl4U8L2cNvbiPTrW2Wys4WOfkXqxPqSPzyaK9C8M6XJpWgWVq6/vI4xvGejHkj9aKxlLUUIpRVzbrH8QeFNN8SwlL2AF9pXzU4bB7e49jWxSGsU2tUW0mrM8C8Vfsf8AgDXZWmvNA0a5QgljNp0YOcddy4596+DGsfAem/tFal4R1DwzZ6PoKznTobrT7mW0eCQkGOQurDklthycfdPY1+tsg3LyMjuK/Mj9qD4QSeB/itrurSC2s9M1Sf7TBqWoWjXFjHKUCSW12FVisUqhHWTHysD06jojKUkZqEYuy0ueSfFLwPp/gfxZqmjw6vNeeGoNYsYLj5wzmOZGkIZsY86MKw3AZIYZr067/ZK+KHwxv93hXw9r1xeq2bHxR4R1lIkuoico00DkMjYIzg44rxfxNDc+J9Pt7K1t9HW3gnWC0sfCCu9lBczOiefPOxbe7cKoLsen3QMH9ltJ08Wuj2FvcIryw28cbFhnkKAevvR8jd3ikrnx94Buv2yPC2jx3GoaXofieFOP7P1q5gW9ZR/txMoz/vMTVnWv287r4daoukfFT4Raj4a1SaHnybmKdZockZXeBuTO4cMR1r7FlkS3heWR1iiQbmkchVUdySeAK8R8SeGfB3jr4+eFb66sdF8U2N74dvoomeKK7iVobiJtwPIz+9YZ9sVGgX6tHlHw+/aj/ZitfEEWt6bpVl4S1obgtxNpbxmLd97aY1ZVz3xjNbek2v7K2qX1nqGk+JfD2n30N696bmPUjBPPI8iysJGk+YrvVTjjGMDAJB9M+Jngj4X/AA18G3/iS9+GWhX9jZFGultdItt0cRYB5TlfuqCSe9eY61b/ALP2vfDObx43ws0+400amukxR/YEtJZJyQvIBGwAkjnnI6VXmmw0fQ6TVvAvwo8Vy+IFi+LCw6H4jvf7S1bRbXXrI213KShJJZTIgPlpkKw4GO9ekeLm8CeNG8OSah4o00DRNSi1S0MWqQrumRHRQx3crhzkDrxXk3gL9k34FfFXwPo3iWL4crpMepRGUW4vrgOnzEYYh+eRXmumfCr9lfUNUm0y/wDCuo6RdwSSpPJNc3htoQhlKl5g20bkhZh+XUGj0f4AemeIPgP8Bta1zVta1PxVZf2pqWpzam903iCAGNpB+8jjUkqiHrkDeDghgQKn8Rad+zbb6h4h1HW/Efhm+l1wpJeQ3WspKhdXEgdFViVYsAxI9x0JFeZaZ8Iv2X5tQkEfgLXJ7FXS2+1Sx37lrlwzLAsKkuW8tGkPHAxnBNbWl+F/2ao7oC3+Fiy6SXmQ6p9guJwnlxQyOXjyZEAEpzuAx5b09V/wwtGdR44/a3/Z6ml06TVb2y8SXGkv5tj9lsGuWgYAcxsVAHQd8cD0qiv7e1p4reSH4e/C7xj41lGVWWO3WGHd7sN+Pxr0Wz/ZJ+CGp2tvc2/w80G4trhFlilSNyrqwyrD5uQQc1L+y34V0nwr4H1238P262miP4l1Q2VvE7FUiS4aIKMk9PL71OnUeltEfN3xU/aK/aet4kx8O5vAumTLk3tjpj6pNEp7lssFb22ivn74geCfH3xM8Oav4r1/VfF+p6Po1m95e6v4qt3tLYyZCxwW0DHlmYgZAAHp6/rmVyMZYf7rEH9K8D/bps5Lr9l3xcimUxxvaSSlcuRGLmPcTk8gDmjTsCbbR8MfDL4Q3njCx1bU9U1WDwlo2iRxm7+z2qMAxgWYhY2OwBY3XLtuZmY810P7P/huz+KcutSWHijxdpCaXMAsttdRQbkdn8rhI+DsQk88FsCuF0eTU9d8OT2cGg6lqkcsKW82raXrS22j38cQCxSX6MvyMihQ3zoSFwwr3v8AY08CzWGn67d2p8+11i5t7e0ugpUXYiVg9wgPSNpHfb0yqA1rHWxjVTSk7+h6pZ/sZWmuSRP4hutc8TRq29Y/EeuS3EP18oNtP5V794H+FemeE47ZgkTNbKEgjhjCQwgdNi+3rXZQW/lxorEOVAAx04qesZVHshKmt27+oD0HAopKKxNR9JiiigBO9Y/iHwpp3iSLbeW/m/Ls3LwwB7e49jRRVRbi7oTSkrM8o+K37N+i+MPAN7oFlFLbxzMsgFvsjeN1IZJI8AAMrAEevSvMrfwt+0jb28elwfE6I2sQ8tbqbw3G97tHA3OflJx/F60UV0xfN8Wpg06btB2PBPin8Ode8RfFiDwT8SfjZqemaaNLfU7jUPEUgS0eTftEMUCsseQPmPJrtfgT4x+Fv7P15dxeB4vGXxg1tlaM32l6X5NlbRswaRYdxVFDMFJxnOBzxRRRFJz5djdyapcz1PV9W/a6g17TLnTtU+B/jy9sbhNk1tNZQuki56MN/NYsf7RXhFdS+3H4CeOorsXH2veunJjz9/mebtEu3fv+bdjOaKK29ik9GzjWIb3S/H/M0vD/AO1j4Y8KmY6b8H/iHpwm2h0j0wMnyk4wplIHLHoBnPOa5OH4t/B+31aXU5Pgt8QBcyyNJKs2mzSxMzBwd0RnKEYlk4xgbzjGaKKXslfdlKs3pZEWl/F74K6Hxb/Cv4k26m/j1LbJp91IBcxghJhmc/MASvuODmif4wfAm8tIrV/hp8Q7dEu57wSRaVdRyGSbibLrLuKsOCucYGAAKKKHT03ZftXfY9GtP25Ph1pdlBbW/hvxvbW1vGscUa+G5QEVRgAc9ABivAvFHw80T9oDxqmsfCn43QeH5xPNdweGdeknsJ9OnmcyzGAAhiGckkbTjJGSAACisKkeTzOinJtM6D4M/Ef9om60CaSz8XaD4qn0/ULnS59P121MjPJC+0mO5hwXU8EE11Hj7Uvjh8a/DVz4K8TaD4b8I+H78pHqd5p801zc3EIYMY4kYYTdgcnkdqKK0UI9jkqVpxm0jto/2O/B3iq4j1jVPCmkRXzbT++gKl9uNrOikKeg6jPrXuPgv4e2XhKNHULLOi7EZUCLGuMbVXsKKKynN7GsacVZnV0UUVzmwoooooA//9k='
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="revealuser.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};
// done
exports.revealDetail = async(req, res, next) => {
    try {
        const { id } = req.params;
        const list = await sequelize.query(
            `SELECT bf.id,bf.total_price,sup.supplie_name,users.fullname,clas.name,
      sup.price,sb.unit,sup.unit_name,sb.supplieId,bf.createdAt FROM reveals AS bf
      INNER JOIN reveal_sup AS sb ON bf.id = sb.revealId
      INNER JOIN supplies AS sup ON sb.supplieId = sup.id
      INNER JOIN users ON bf.userId = users.id
      INNER JOIN clas ON users.claId = clas.id
      WHERE bf.id = ${id}`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        console.log(req.params + 'dddd');
        var length = list.length;
        var name = list[0].fullname;
        var classes = list[0].name;
        var total = list[0].total_price;
        var unit = 0;
        var rows = [];
        rows.push(
            [
                { text: 'ลำดับที่', style: 'fillheader', rowSpan: 2, alignment: 'center' }, { text: 'รายการ', style: 'fillheader', rowSpan: 2, alignment: 'center' },
                { text: 'จำนวน', style: 'fillheader', colSpan: 2, alignment: 'center' }, {}, { text: 'หมายเหตุ', style: 'fillheader', rowSpan: 2, alignment: 'center' }

            ], [
                {}, {},
                { text: 'ขอเบิก', style: 'fillheader', alignment: 'center' }, { text: 'เบิกได้', style: 'fillheader', alignment: 'center' }, {}

            ]
        );
        var date = '';
        for (var i = 0; i < length; i++) {
            if (!list[i].offer_status) {
                status = 'ยังไม่อนุมัติ';
            } else {
                status = 'อนุมัติ';
            }
            date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);
            rows.push([i + 1, list[i].supplie_name, { text: list[i].unit, alignment: 'center' }, { text: list[i].unit, alignment: 'center' }, '']);
            fullname = list[i].fullname;
            unit = unit + list[i].unit;
        }
        var year = +((list[0].createdAt).toISOString()).substring(0, 4) + 543;
        var month = ((list[0].createdAt).toISOString()).substring(5, 7);
        var day = ((list[0].createdAt).toISOString()).substring(8, 10);
        var THmonth;
        console.log(year);
        console.log(+month);
        console.log(day);
        switch (+month) {
            case 1:
                THmonth = ' มกราคม ';
                break;
            case 2:
                THmonth = ' กุมภาพันธ์ ';
                break;
            case 3:
                THmonth = ' มีนาคม ';
                break;
            case 4:
                THmonth = ' เมษายน ';
                break;
            case 5:
                THmonth = ' พฤษภาคม ';
                break;
            case 6:
                THmonth = ' มิถุนายน ';
                break;
            case 7:
                THmonth = ' กรกฎาคม ';
                break;
            case 8:
                THmonth = ' สิงหาคม ';
                break;
            case 9:
                THmonth = ' กันยายน ';
                break;
            case 10:
                THmonth = ' ตุลาคม ';
                break;
            case 11:
                THmonth = ' พฤศจิกายน ';
                break;
            case 12:
                THmonth = ' ธันวาคม ';
        }
        var THdate = 'วันที่ ' + day + THmonth + 'พ.ศ. ' + year;
        var THdate2 = day + THmonth + 'พ.ศ. ' + year;
        console.log(THdate);

        var documentDefinition = {
            pageSize: 'A4',
            header: {
                // alignment: 'justify',
                // columns: [
                //   { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก',  fontSize: 20, bold: true, margin: [0, 20, 0, 5], alignment: 'center' }
                // ]
            },
            footer: {
                // columns: [
                //   { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
                // ]
            },
            content: [{
                    alignment: 'justify',
                    columns: [{
                            fontSize: 18,
                            bold: true,
                            width: 440,
                            text: 'ใบเบิกพัสดุ\nโรงเรียนบ้านสวายจีก อำเภอเมือง จังหวัดบุรีรัมย์\nสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน',
                            margin: [90, 20, 0, 0],
                            alignment: 'center'
                        },
                        {
                            width: 60,
                            text: 'เล่มที่..............\nเล่มที่..............',
                            margin: [0, 20, 0, 0]
                        }
                    ]
                },
                { text: 'ฝ่าย/งาน.......................................................................', fontSize: 16, bold: false, margin: [0, 0, 0, 5], alignment: 'right' },
                { text: THdate, fontSize: 16, bold: false, margin: [0, 0, 0, 5], alignment: 'center' },
                { text: 'ข้าพเจ้าขอเบิกพัสดุตามรายการต่อไปนี้ ใช้ เป็นวัสดุเพื่อการศึกษาระดับชั้น' + classes, fontSize: 16, bold: false, margin: [0, 0, 0, 5], alignment: 'left' },
                {
                    table: {
                        widths: ['auto', 200, '*', '*', 100],
                        headerRows: 2,
                        body: rows
                    }
                },
                { text: '..............................................................ผู้เบิก', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 340, y: 640 } },
                { text: '(' + fullname + ')', margin: [0, 10, 0, 5], fontSize: 16, alignment: 'center', absolutePosition: { x: 340, y: 660 } },
                { text: 'ตำแหน่ง  ครู', margin: [0, 10, 0, 5], fontSize: 16, alignment: 'center', absolutePosition: { x: 340, y: 680 } },
                { text: 'ได้มอบให้..............................................................', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 340, y: 700 } },
                { text: 'เป็นผู้รับแทน.........................................................', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 340, y: 720 } },
                { text: 'ลงชื่อ............................................................ผู้มอบ', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 340, y: 740 } },
                { text: 'ลงชื่อ........................................................ผู้รับมอบ', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 340, y: 760 } },
                { text: 'อนุญาตให้เบิกได้', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 40, y: 640 } },
                { text: '..................................................................ผู้สั่งจ่าย', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 40, y: 660 } },
                { text: 'ได้ตรวจหักจำนวนแล้ว', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 40, y: 680 } },
                { text: '.................................................................เจ้าหน้าที่พัสดุ', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 40, y: 700 } },
                { text: 'ได้รับของถูกต้องแล้ว', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 40, y: 720 } },
                { text: '.................................................................ผู้รับของ', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 40, y: 740 } },
                { text: '(' + fullname + ')', margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 100, y: 760 } },
                { text: THdate2, margin: [0, 10, 0, 5], fontSize: 16, absolutePosition: { x: 90, y: 780 } },
            ],
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                },
                price: {
                    fontSize: 16
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 16,
                columnGap: 20
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="revealdetail.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {

    }
};
//done
exports.buylist = async(req, res, next) => {
    try {
        const { id3 } = req.params;
        const list = await sequelize.query(
            `SELECT db.id,db.status,db.buyprice,users.fullname,db.createdAt FROM buyforms AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.status = true
      `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อเจ้าหน้าที่', style: 'fillheader' },
            { text: 'ราคา', style: 'fillheader' }, { text: 'สถานะ', style: 'fillheader' },
            { text: 'เวลาที่สั่งซื้อ', style: 'fillheader' }
        ]);
        var status = '';
        // var date = '';
        var fullname;
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        for (var i = 0; i < length; i++) {
            if (!list[i].status) {
                status = 'ยังไม่อนุมัติ';
            } else {
                status = 'อนุมัติ';
            }
            fullname = list[i].fullname;
            // date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);
            var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].buyprice);
            var dates = list[i].createdAt.toISOString();
            console.log(dates);
            var month = dates.substring(5, 7);
            var year = +((dates).substring(2, 4)) + 43;
            var day = (dates).substring(8, 10);
            var THmonth;

            switch (+month) {
                case 1:
                    THmonth = ' ม.ค. ';
                    break;
                case 2:
                    THmonth = ' ก.พ. ';
                    break;
                case 3:
                    THmonth = ' มี.ค. ';
                    break;
                case 4:
                    THmonth = ' เม.ย. ';
                    break;
                case 5:
                    THmonth = ' พ.ค. ';
                    break;
                case 6:
                    THmonth = ' มิ.ย. ';
                    break;
                case 7:
                    THmonth = ' ก.ค. ';
                    break;
                case 8:
                    THmonth = ' ส.ค. ';
                    break;
                case 9:
                    THmonth = ' ก.ย. ';
                    break;
                case 10:
                    THmonth = ' ตุ.ค. ';
                    break;
                case 11:
                    THmonth = ' พฤ.ย. ';
                    break;
                case 12:
                    THmonth = ' ธ.ค. ';
            }
            var THdate = day + THmonth + year;
            rows.push([i + 1, fullname, price, status, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'ใบรายการสั่งซื้อ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {
                        widths: ['auto', 150, '*', '*', 150],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                }
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="buylist.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};
// done
exports.buyform = async(req, res, next) => {
    try {

        const { id } = req.params;
        const list = await sequelize.query(
            `SELECT bf.id,bf.buyprice,sup.supplie_name,users.fullname,clas.name,
      sup.price,sb.unit,sup.unit_name,sb.supplieId FROM buyforms AS bf
      INNER JOIN supplie_buy AS sb ON bf.id = sb.buyId
      INNER JOIN supplies AS sup ON sb.supplieId = sup.id
      INNER JOIN users ON bf.userId = users.id
      INNER JOIN clas ON users.id = clas.id
      WHERE bf.id = ${id}`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        console.log(req.params + 'dddd');
        var length = list.length;
        var rows = [];
        const fulname = await User.findAll({ where: { id: id } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        var name = list[0].fullname;
        var classes = list[0].name;
        var total = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[0].buyprice);
        var unit = 0;
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อพัสดุ', style: 'fillheader' },
            { text: 'ราคาต่อหน่วย(บาท)', style: 'fillheader' }, { text: 'จำนวน', style: 'fillheader' },
            { text: 'หน่วย', style: 'fillheader' }, { text: 'หมายเหตุ', style: 'fillheader', alignment: 'center' }
        ]);
        var date = '';
        for (var i = 0; i < length; i++) {
            if (!list[i].offer_status) {
                status = 'ยังไม่อนุมัติ';
            } else {
                status = 'อนุมัติ';
            }
            fullname = list[i].fullname;
            date = (Date(list[i].createdAt)).substring(0, 24);
            var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].price);
            fullname = list[i].fullname;
            console.log(date);
            rows.push([{ text: i + 1, alignment: 'center' }, list[i].supplie_name, { text: price, alignment: 'right' }, { text: list[i].unit, alignment: 'center' }, list[i].unit_name, ""]);
            unit = unit + list[i].unit;
        }
        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'ใบสั่งซื้อพัสดุ หจก.บุญเที่ยงอุปกรณ์ บุรีรัมย์', style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 0], alignment: 'center' },
                { text: 'หน่วยงานโรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                // { text: fullname, style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {
                        widths: ['auto', '*', 'auto', 'auto', 'auto', '*'],
                        body: rows
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: 'จำนวนรวม ' + unit + ' ชิ้น   ' + 'ราคารวม(ที่คาดการณ์) ' + total + ' บาท', alignment: 'right', margin: [0, 10, 5, 0], style: 'price', fontSize: 16 },
                { text: 'ราคารวมสุทธิ...................................บาท', alignment: 'right', margin: [0, 10, 5, 0], style: 'price', fontSize: 16 },
                { text: 'ลงชื่อ......................................ผู้จัดทำ', alignment: 'right', margin: [0, 10, 5, 0], style: 'price', fontSize: 16 },
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                },
                price: {
                    fontSize: 16
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 16
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="buyform.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {

    }
};

exports.returns = async(req, res, next) => {
    try {
        const { id3 } = req.params;
        const list = await sequelize.query(
            `SELECT rt.id,rt.status,rt.re_name,rt.createdAt FROM returns AS rt 
      INNER JOIN users ON rt.userId = users.id
      WHERE rt.userId = ${id3} AND rt.status = true`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อเจ้าหน้าที่', style: 'fillheader' },
            { text: 'สถานะ', style: 'fillheader' }, { text: 'เวลาที่เสนอ', style: 'fillheader' }
        ]);
        var status = '';
        var date = '';
        var fullname;
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        for (var i = 0; i < length; i++) {
            if (!list[i].status) {
                status = 'ยังไม่รับคืน';
            } else {
                status = 'รับคืนแล้ว';
            }
            fullname = list[i].re_name;
            date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);

            var dates = list[i].createdAt.toISOString();
            console.log(dates);
            var month = dates.substring(5, 7);
            var year = +((dates).substring(2, 4)) + 43;
            var day = (dates).substring(8, 10);
            var THmonth;
            switch (+month) {
                case 1:
                    THmonth = ' ม.ค. ';
                    break;
                case 2:
                    THmonth = ' ก.พ. ';
                    break;
                case 3:
                    THmonth = ' มี.ค. ';
                    break;
                case 4:
                    THmonth = ' เม.ย. ';
                    break;
                case 5:
                    THmonth = ' พ.ค. ';
                    break;
                case 6:
                    THmonth = ' มิ.ย. ';
                    break;
                case 7:
                    THmonth = ' ก.ค. ';
                    break;
                case 8:
                    THmonth = ' ส.ค. ';
                    break;
                case 9:
                    THmonth = ' ก.ย. ';
                    break;
                case 10:
                    THmonth = ' ตุ.ค. ';
                    break;
                case 11:
                    THmonth = ' พฤ.ย. ';
                    break;
                case 12:
                    THmonth = ' ธ.ค. ';
            }
            var THdate = day + THmonth + year;
            rows.push([i + 1, fullname, status, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'ใบรายการคืนครุภัณฑ์ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {
                        widths: ['auto', 150, '*', 150],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                    // layout: {
                    //   fillColor: function (rowIndex, node, columnIndex) {
                    //     return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                    //   }
                    // }
                }
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="returns.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};

exports.returnsAll = async(req, res, next) => {
    try {
        const { id, id3 } = req.params;
        const list = await sequelize.query(
            `SELECT rt.id,rt.status,rt.re_name,rt.createdAt FROM returns AS rt 
      LEFT JOIN users ON rt.userId = users.id
      WHERE rt.status = true
      `, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อเจ้าหน้าที่', style: 'fillheader' },
            { text: 'สถานะ', style: 'fillheader' }, { text: 'เวลาที่เสนอ', style: 'fillheader' }
        ]);
        var status = '';
        var date = '';
        const fulname = await User.findAll({ where: { id: id3 } });
        console.log(fulname[0].fullname);
        var fname = fulname[0].fullname;
        var fullname;
        for (var i = 0; i < length; i++) {
            if (!list[i].status) {
                status = 'ยังไม่รับคืน';
            } else {
                status = 'รับคืนแล้ว';
            }
            fullname = list[i].re_name;
            date = (Date(list[i].createdAt)).substring(0, 24);
            console.log(date);
            var dates = list[i].createdAt.toISOString();
            console.log(dates);
            var month = dates.substring(5, 7);
            var year = +((dates).substring(2, 4)) + 43;
            var day = (dates).substring(8, 10);
            var THmonth;
            switch (+month) {
                case 1:
                    THmonth = ' ม.ค. ';
                    break;
                case 2:
                    THmonth = ' ก.พ. ';
                    break;
                case 3:
                    THmonth = ' มี.ค. ';
                    break;
                case 4:
                    THmonth = ' เม.ย. ';
                    break;
                case 5:
                    THmonth = ' พ.ค. ';
                    break;
                case 6:
                    THmonth = ' มิ.ย. ';
                    break;
                case 7:
                    THmonth = ' ก.ค. ';
                    break;
                case 8:
                    THmonth = ' ส.ค. ';
                    break;
                case 9:
                    THmonth = ' ก.ย. ';
                    break;
                case 10:
                    THmonth = ' ตุ.ค. ';
                    break;
                case 11:
                    THmonth = ' พฤ.ย. ';
                    break;
                case 12:
                    THmonth = ' ธ.ค. ';
            }
            var THdate = day + THmonth + year;
            rows.push([+list[i].id, fullname, status, THdate]);
        }


        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + fname, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage + '/' + pageCount, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'ใบรายการคืนครุภัณฑ์ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
                { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
                {
                    table: {
                        widths: ['auto', 150, '*', 150],
                        body: rows
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return (i === node.table.body.length);
                        },
                        vLineWidth: function(i) {
                            return 0;
                        },
                        hLineColor: function(i, node) {
                            return i === 1 ? 'black' : '#aaa' && (i === node.table.body.length) ? 'black' : '#aaa';
                        },
                        paddingLeft: function(i) {
                            return i === 0 ? 0 : 8;
                        },
                        paddingRight: function(i, node) {
                            return 0;
                        }
                    }
                    // layout: {
                    //   fillColor: function (rowIndex, node, columnIndex) {
                    //     return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                    //   }
                    // }
                }
            ],
            images: {
                logo: 'data:image/;base64,/9j/4AAQSkZJRgABAQEAeAB4AAD/4QFKRXhpZgAASUkqAAgAAAAJAA8BAgAGAAAAegAAABABAgANAAAAgAAAABoBBQABAAAAjQAAABsBBQABAAAAlQAAACgBAwABAAAAAgAAADEBAgALAAAAnQAAADIBAgAUAAAAqAAAABMCAwABAAAAAQAAAGmHBAABAAAAvAAAAAAAAABDYW5vbgBNUDI4MCBzZXJpZXMALAEAAAEAAAAsAQAAAQAAAFBob3RvU2NhcGUAMjAxMTowMToxNCAxMzo1NDozNQAJAACQBwAEAAAAMDIyMQSQAgAUAAAALgEAAAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAAAQAAAAKgAwABAAAAQAMAAAOgAwABAAAAlAMAAACjBwABAAAAAgAAAAOkAwABAAAAAAAAAAAAAAAyMDExOjAxOjE0IDEzOjU0OjM1AP/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIAMgAtgMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP1SpOtFFABSUtJQAUUUUAFFFFABRSZqpJqCtIYrcfaJhwQp+Vf95u306+1AFqSQRLub6ADqT6VzniDxNaaFJAtwS11KwP7vkxL/AHvoPTvzVHxN40g0FXjSRL7VCMKi/ci+v+HU+1fMXij9o7w3pfxSsvCd/eC51S8ci5vPNHk2sh+5E5/vHpjtxnGa3jDqzCdR/DDVn2Ta3S3MYIILYBO05BB6EexqevL/AAT4tSGNLC7lEGwkW1y33Vz/AAN/s+leiQagskghlHk3HaNjw3up/iH6+tZyjys0hNTV0XKKbS5qCxaKTNHOenFAC0UlLQAUUUUAFFFFAC0lFFABRRSGgCG4vEtiAyTOT/zyiZ/5CoDqy8bbW7b/ALYEfzrL8dTPD4Yv3RmVgq/MhwR8w718tfEH9pvwp8L/ABA2ieINV1OHUPJW48u3gklUq2cfMDjseK0ULq9zKU2pcqVz62bVZNuVsLgf9dWRB+rVn3niZbZf31zp9mM4O+cyt/3yoH86+G9U/bm+H8EZa3TXdTfghfswjB/F3rjNU/byS4kMPhzwbLPKx+X7ZdZb2GyNSevvVcsO4/3r2ifeupePtNXKmW71Q/3FAghP17n8c15/8RPjpY+EtKafW9Ys/DWmqpCwqwV39lA+Zj7KK+RbDW/2nPjUoXw94bvNBsJeFuIbQWKAH/ptOdxGO612/gn/AIJw6jqV1/bnxa8bZ3HfNbWExkkb2e5l6f8AAR+NNuMFd6eouSUvjl9xwPjj9qDxL8VtWXwl8JdH1B7i7Pl/bkizdyA8EovSJf8AbY5/3a6vTf8AgnOx+H8kWveK47T4n6gTcWNoJN9quAS0UjYyxYnmQdCOAec/SXh+fwF8EdHk0f4b6Ba2zsNst7tJLn1eRvmkP1OK5G+1W81TUGvrq6llvGbd52cMCOmPTHtXwObcYYTBSVPDfvZX17JdbPv+X4Ee0jT0po+bvh7+0N4k+CviBvAXxW0y8tmsSIlupkLXEKdFLY4ljx0dc8etfZ3gn4n22raLDc6fe2viHQpQDHtcOq/7rDlT7Hp7VzviTT/A/wAdtBh0D4l6XHPNCMWmtRfu7iE+okHKn16qe4r538U/sU/Fb4M6hLrnwk8RP4j0xvnEFvKkN0V9HiY+VN9QQf8AZr6vLs1wuaUfaYeV+66r1X9eQ+WM3zQdmfdel+MLS6VVtdTFo/T7NqalwD6LICD+ZNdLBd3jKCYracf3rec4/Vf61+aGn/ti+LPAd9/ZXxG8FzRXkR2u6xtZT5H/AEzkG0/gQK9M8Oftn/D2+UM2q6locjclbi1cKP8AgUe4V6doehX72O8b+h90fbpR9+zlH+6yN/WmtqiKCXgulA/6Ylv5Zr5T0/8Aax8HvGoh+JFicdRNcEf+hLXX+Hfjcvi9Zm0HxVbawISBKbKRJNmegbA4pezT2ZLq2V3Fn0NBOtxEsiBgrdnUqfyIyKkBrI8K3U954d0+a5kMs8kQZ3OMk1rVk9HY2Turi06m0tIYtFFFABRRRQAUhpaa1AHOePiR4V1DH91f/QhX5xfFbw7p3jL9trwZomsWq3+l37WEFzbOzBZYzvypwc447Gv0c8fnHhXUPon/AKEK/PHxlub9vz4fAn/lvp/4cOa3XwGcf4vyPqHVPhH8DPhzq/2EfDDS5rmNVfe1qsw56cyMa29P+JfhrwyoXw94K0/TNowpghihAH/AF/rWd8YufHNz6eTEP/Ha4jbj6V+HZxxVmmHxtbDUqnLGMmlounrcwlKV2jvdU+NXiG+VhB9nsF6fu03sPxb/AArjdS1q+1iYy397PeN/01kJA+g6CqQT1oKDnI4r4jFZpjcbpiK0pLs3p92xk3KW4rMFX0OaaWC8EdOxpVtXumSFF3ySMEUepJwK7L4seG18P67aPGo2XFohbj+NQFY/jgGlRwM62Eq4uO0HFP8A7ev/AMD7yddzjRJ+X51taD4w1bwzJ/xLr144zyYW+aM/8BNY0Fq91KkUULTSucLHGuWb6AV2mlfB3xDqUYaSCLT0I/5eX+b/AL5GT+dbZdhcxr1PaZfGXMusdLfPT8xxvfQ0rj4sad4ksfsXivwxY61akYKyxJIhz1+SQEfka4LW/gf+zl4uLPdeCjo0zHJbTvNtv0ifb+ldN4w+Gdz4N02C7nv4bgyy+V5cUZHYnOT9P1rn9F0d9WulX7tunMjY/QV9ViOJ87yNuljmrpX95J7/AOE6qXtqk1TitWctqf7CPwU1jw/q2o6HeeIopbW0muEX7blcopI+/HkjOB17V5N+wT+80TxZISRuurfr/wBc25r7PsY1g8N+JlQBETR7kADoP3Zr4u/YHXb4f8V8fL9ptuh7+U3Wv0vhLOa2fZdHG14qLbkrLbR263O/H0fq8ZQvfY/RzwooXw1pmOnkL/Ktesvwyu3w7pg/6d0/kK1K+pluzljsgpaSlFSULRS0UAFFFFABTTTqbQBzfxA/5FW/z6J/6EK/PPxUob/goF4AH3ts9gPXoj1+hfxA/wCRVvu33P8A0IV+e3iJ8/8ABQXwKMYTz7HgHv5clbr4DOP8X5H1L8Yv+R6uuf8AllFx/wABrihkH3rtfjCf+K6u/wDrlF3/ANmuKyw//XX8w55/yNMT/jl+Zyy+JibaNvy8ce9AZsnA9q6LwH4X/wCEw8QxWcm6O2RfNnZeuwY4HuTgV5uEwtTGV4Yekryk7Iz9Dpfg74LbVNSXWrpP9CtT+43D/WSev0X+da/xisZ9e8SeH9Js133ciOcf3QSOT7DBP4V6bI1l4d0dn2pa2FnETtUYCKo7Vw/w3u28Xa5rXiaeMqSy2lsjf8s4wMkfXpn6mv3B5ThsLhKWSRd3Ud5Pq1HVv8FFf8BnRyKK5OrOj8IeCdO8H2YW3jV7phiW6YfO59vQe1ct8aPjRYfCnSAkYW98QXSn7JYZ/DzHx0UH8SeB3pPjV8atP+FOkFF2Xmv3CZtbLPAH/PSTHRR+ZIwO5HgPwP8AAeq/FbxtJ468VSSTaTazfaJLq44FzMv3UX/YUgZxxwBX65lOUYfDYX63iEoYeC0W3NbovLu/+Cz4rOs8qQxEcmyn3sRPd7qmusn5pa2+b6J+vePDqlx4d8IaRfym51iWH7TeSMAPnKjcSB0AJYfhUWn6fFptqkEQ4HJbuT6mtLV7z+1NautQcHdJhIweqxjoP5k/WqpPfkV/DPGOdrO82rVqP8O+nZ20v6dj9oynL/qdJOesrJa72/ze7L8J2+GfFR7/ANj3RGP+ubV8X/sE7X8K+Kv+vu3z74iJr7NDbfCPi8g4I0W7Of8Atm1fGn7BbhvCHigHr9sg/wDRNfv/AIb/APIhpf4p/mzyM4+OfyP0e8P8aFp2On2eP/0EVoVQ0H/kCaf/ANe8f/oIq/X6K9zzFsFLSUtIYtFFFAC0UUUAJSU6mmgDmfiEceFb7JwMx/8AoQr899cUt/wUE8ELnaBPY89f+WTmv0H+IX/Iq3vOOY//AEIV+fGpfP8A8FDvBa4yRNadv+ndzW6+Azj/ABfkfUnxf/5Hq9Hfy4v/AEEVxpzwD0rsPi9z48v+n3I//QBXG8YxnvX8w55/yM8T/jl+ZySfvMOfWux+Fvii28MeJC96wjtbqLyXlJ4jOQQT7cY/GuSt7WS+uY7eCNpZ5GCIi/eJJ4Fe8eCfhfY+HYI7i+jS+1PGSzDckR9FHf6mvV4Yy3G4rGxxOGtFU3rJ7elut1/w6CCcpaGh8Tg9x4B1QwHI8tXJXkFNwJ/Suc+Fc08fw9u/7PltI78zyiJrxiIw2AAWxyQPb0rG+Ln7R3hrwJJdaJFat4g1TaY57WJwkMWRgq788+yg49q8M+HnxY8M3GtGPxfY3NrZO/7qWykLRxj/AKaD7xHTkflX73W4ZzqeNp5vg6CnFQ5bSfL1vdKzb+SPmcZxRlGHxawk6659na9k/OVrJ/l1sejt8HfCFjrdzr3jvxXL4v1aZ/Ne2txtjZuykKSdo6AZUAcV2sniJ9ZsYIbezTSdGhAFrYxqF+UdCwHA9lHH1rqLH4deDtY0+3u7GzhmtZlEkVxbzsVdTyCDnmszxF4XfRcTREy2pONxHKex/wAa/LvETGcV4rAv2kl7BaSUL6LzVlp3svXQ+x4cynLsDVcqMEnLW+rcnvdyd2+61MEk/Smk05s8/lTdu2v5aP0wtSHb4N8ZHoRol3z/ANsmr40/YKUt4Q8UMDgfbIR/5Br7KuW2+B/GzA426FeHrj/lk9fHn7B6bfBXic8H/T4uF6f6kV/XXhurZBR9Z/8ApTPiM4+OfyP0a0L/AJAun46fZ4//AEEVfrP0Ft2iaccY/wBHj/8AQRWhX6I9zzVsFKKSlpDFoo+tFAC0UUUAJSUpptAHMfET/kVb3kj5o+n+8K/Pq+bd/wAFDvBx3fMZbT/0mev0F+Iv/Iq3n+9H/wChCvz4di3/AAUQ8Jq3BE9rz/26vW6+Azj/ABfkfUfxeOfHl9zjCR/+gCuNVe2TXYfFw/8AFeahxztj/wDQBXIKelfzFnT/AOFLEv8Avy/NnHL4mehfBHR0vfE1zeyDcLOHKA9nY4z+QP516f8AEfXZvC/gHxBq1tgXFnYyyxn0YKcH8DXAfAi4VdS1aDPzPFG4/AkH+Yr0/wAV6BH4o8NarpExxHfWsluT6blIB/PFfuHBaowy2hNrRybl/wCBf5IVSFSWFqRou02nb1tofmlJI80jSyO0krkszsclieST75pnPJq3qmm3Gi6jdWF3H5d1aytDKh7MpwR+lVOOuMCv64TTV1sfxY04yaluj6D/AGTfifc6L4nHhC8maTTNR3Naqx/1M4BOB6BgOnqB719dX1ql9ZzQuMrIpFfm14N1CTSfGGh3sR2vBfQuD9HFfpcfvH61+ScXYGkq6k1pUTTXfo/vTP6N8Ocxq4jAVMNN39k1byT2Xyaf5HjEsZVmU9VODTeat6svl6ndqOglYD8zVM5r/NXEUvYV50v5W192h/TkHzRTJ77H/Cv/AByTyP7BvM/9+Xr4+/YMZl8DeJgSAft8Z5POPJWvr7Uj/wAW78e5HH9gXnT/AK4vXyF+wepHgfxKwB51BAP+/K1/WXhz/wAiCj6z/wDSmfF5x8c/l+h+jHh//kA6djp9mj/9BFaFZ/h//kA6dzn/AEePn/gIrQr9Ce55q2ClFJS0hi0UUUALRRRQAhptOptAHL/Eb/kV7rnGXj/9Cr8/VBb/AIKKeFwQDia3PTPH2R6+/wD4lSeX4XuB/ekjH/j2f6V+f2lN9s/4KKaAWXcIZ4g20dNtmxz+tbr4DKP8V+h9P/FrK+PNSOf4Y8f98CuQ3ev6V1nxVbd471PPONi9P9gVyWMH1r+YM6a/tPEf45fmzll8TOk8A+IR4b8VWd27YgdvJm/3G4yfocH8K+kuq5Bz718ktg8H5a+lfh9qbav4O0u4kO6QReWxPcqduf0r9F4GxzkquCk9veX5P9DWjLVxPkD9qrw0PD/xYu7pE2Q6pBHdg443/df9Vz+NeObs/Svpz9tezC3nhO8xgmO4iLfQow/ma+ZeT/FgV/ZWSVnWy6jOW9rfc7fofyfxXho4XO8TTjtzX/8AAkpfqdJ8MdJOvfEPw3YhSfO1CEfgHBP6A1+jzMME5wOtfF/7I3g99c+I0msumbXR4GfdjgyyAqg/Lefwr688S6gNN0e4fOHceWn1Nfm/HGZUsLKVSo/dpQcn+f5WP2Tw1wM45fOs1rVnZekdPzv9x5lfSCa8uJD/AByM35mq/FPYjkUziv8ANqpUdWcqkt27n9ORVkkO1psfDP4gkc48P3n/AKJevkf9hNQ3gDxGy8Z1Jef+2KV9dapG03w78exR48x9AvFUt0yYXr5G/YLVv+Fe+InA+Qamikk/9MENf1t4dP8A4QKPrP8A9KZ8VnHxz+X6H6JeHWJ0HTiev2eP/wBBFaVZPhVt/hvSz/07p/Ktav0F7nmx2QUtJSikMWiiigBaKQ1WvLoW8bHesQVdzyP91F9TQBZOfwpteaXXxS8OSagbeDGoXSn/AFwuVWUe6jOR+Qrb0Xx5b30ixF2dj/BKAso/9lf8MH2NXyO1yPaRbsmHxQP/ABTZGcbpoxn86+DPAS/aP+CjlplMKsrj8rA193/EK4iv/DbNBIG8uVC3YryRgg8g89DXwX4JuP7N/wCCjFm8oAE07Kg6A77EgHPpWi+BCj/FfofSXxOYt461fJ/5aqP/AB1a5jbiuu+Klq1v461InpJskGfQqP8ACuZsbKbULpIIsFm7kcAdzX8t5z+6x+I59LTl+bOfllOfLFXbLmh6O2rXW1gwgTmR/wCg96+g/AsXk+HYUChUDMFA6AZrzTTdNS0hitbdRjOOnLE969i0uxGnadBbj/lmoBPv3r2vDtVcdmtbGLSnCHKvWTT/ACi/TQ+grYWODw8YP45O7+X/AA58v/tqairap4VsAfmjhnuG9RuZVH/oJr5ts7C51O8t7O0ge5uriQRxQxjLOxOAAPrX07+0B8EfGnxA+Jy3+k2kV1pkttFFHPJOqLBtzuDAnPUk8A9a9H+C/wCz7pnwvjGoXbpqfiJ1w11t/dwA9ViB6e7Hk+1f2xhc3wmV5XSipKU7bLu3fXta5/M2YcN5jxBxDiJum6dLmtzNaWSS93+a6V1bTu0bXwU+GifC/wAD22mvtfUpj9ovZF5BlIHyg+ij5R9Ce9M8bar9uvhbRnMVvwT2Ld/yrp/FGvJo9qY4zm7kGEH90f3jXmsjszEnn1Pev498TuKHWvllOV5zfNUt0W6j+vkku5/TWQZXTwVGEKUbQgrR/wA/63Yxhx7Uz+dK2W7frSZOelfzgfZl1bdrrwr4vgVtrSaLdICegJjYV8d/sFgt4B8TruxHHqcRCEYyTAMnP/AR+dfYN1drpngHxxqMoxHbaJdOTnHSJz1/CvkL9g2No/h34klddyyaogBB6bYFyP8Ax79K/rvw6i45BRv1c/8A0pnxOb255/L9D9C/CXHhnTB/0wX+Va9ZfhuPyvD+nL6QJ/LNSzassakxRmZRwZGYRxD/AIEev4Zr9De55cdkX6WsGHXjNcFTqGlqB1jWQs303Ej+Va9tdLcKeNki/eQ9R7+496VmUWKKQGikA122KWPavkb9uj4hX0Nr4S+H2la0NGPiXVobPUruGQLKkLEAjrkLyM/TFfV+p3iWNrNPJ/q4EMrZ9ugr4a+D/gW1/au+OvxC8Z69HJc+FLC2k0GwcEjdI33pYz2ZT8wPYsvpW1OPVkt6nh/xMP7P/wAPPG+qeDv+EP8AGkl3o1ybO58RWWtLHO8qcOyxOCpG7OM4zXUaL8QtZ+FnhvTPFvhzxl/wsv4aXOoR6ZNaaqhg1fT53BZYmUk5OASCrFTjtnNbP7TH7L+p+K9fiuxJHafEN0W3cXJEFn4oCDalxbyn5I7oqFDwOQSRkZ6nz23n0Dwn/wAKq+HmsyP4dm0q6m8R+J/7Yia223x4igIYDdtVAARkEPwa0V7lSUZR11P0D0DUb3xV4c1CyniMrx26zJIx/eLgghCR1718QftSWepfC/4xeD/ilpURkjilhEvYefCSQjH/AG48j/gJr3LwV+2Z8PbXUDpmmeKLWKeeQKZL21kSNyOAA7AAde+OtdX408NaT8StB1DTNVs47rStQX5o4ug5yGjbnBB5B7VdlK6RwxlKk4yludjqk2mfHLwNo/jrwjKt+k0AzGpG7b1aMjtIjZBH1rO0LSV0qA7x/pEn32I6f7NfFNjdfFL9iXxNeX3h+abWfBtxKDMssRa1mXt5q9YZAON68H1PSvqb4b/tifCf4zRwRahqB8D+IpMK0GqkLFI3+zMPkYf720+1fjnGXB9fNk8RgGlU+1F6KVtrPo/XR91197L6lClV9rJX7Pt8j0zTrkWd9BORuEbhiPoa9bs7yG+hWWCRZI2HBU15rP4TvVhW5tDHqNpINyTWrhgw9Rjr+FZokudPbb+9t37jlDX5pkOb5lwPKpQx2Ek4TaeulmtLqVmn/Wvf3cRRpY+0qc9UewswjUljgDua53XPGVvYq0dqVuJ+mQflX6nvXAyX08y4lmkkHozE1XZh0r1M18TcTiKTpZfS9k39pvmfyVkl6u5lRyqMXepK5YuryW7maaVzJIx5Y1XZjgg0zzB68VNb2lxeNi3hkmP+wua/GuWvi6r5U5zk/Ntv82e77tNdkQ5NLHGZGVFUszcBRyTV/UtLt/DWnvqPiTVrDw5pyDc9xqFwkYA/EgZrwH4m/t7fD/4d28lr8PoX8aa9/q1vZomSyVunDHDP9EGD/er9ByXgDNcympYmPsafeXxfKO9/WyPOrZhSpq0Peflt952n7X3j60+Dv7OmtabLcrH4h8URnT7W3Vvn2NgTP/urHnJ9WA7159+yf4Rl8N/BjRVnQxXWpyyaiy4IwkhAjBH+4iH/AIFXk3gv4W+NP2ivHC+PfivcTPZfK0OnzoYzKgOVjWP/AJZQg9urc+pNfYGg3lppN9byyW32mKE/LDGQoyOn4Cv6sy3L6WWYWnhaCtGCsv8Ag+b3fmfD4zEe1k03q3qeoeKPFNn4L8Km/wBWkjtLS2gz5cjhVwq8tIf7oAyQP1r428QftDfEL4yLfal4Ni0vwz4LspDFL4v8VyiC0B9Ikbgn0ADN9Ole+/ELxloXxAt20O5W082WN4JbWS6R3eN1wy7Ov6V8B+KrX+0P2dbvwxe36prHw+8UyRJYSSfPNbXR27lX+IrIoxjJAY13pWVyYuNSVj0nRdU8VeLr6607wz+0VpniHxRHBLc2+jw6TNHDeNGjO0ccskQQnCnAxg/rX1H+yr8WZviP4L0a/u28i6vIijDtHcISrLj+62CcfTvXx5+zT8C/FGh+JbLW5Lf7J4qvraSPQtJmX99CsqGN9QuU/wCWUMaMxUNgyNgAdTXrvw98Nz/s5fH/AFr4aJeTXGi3VpFrOhyTsWYcfvF9vmDZ9due9UldWfUdRKOsOh95QyGSMFl2t0K5zg0VV0u+XULO3ul+5cRrIPYkciiuRqzNTyf9pT4oWfgfwQ2lpb3epeIPEDfYNL0ywUNPcTODtUDt0yT2AJrz/wD4J332nSfs/jTrcLFqmn6ncxalDn51mLkgsPdcfl7V5v8Atzapqeg/ELT9VtHmgn/sfVLCxuIyd0NxJAhUp6OYxKFPqa8zn1zTfgL4h0rxn8IvGGh2k95YwfbfCl9eL5WoRbAQw54c+hIO4kg8kV0W0sRdaM/SXWtE07xHps2narY22p6fMMS2t3Essb/VWBFfLP7V37N2j3vw6jj0fVtRt7mW9trDS9FvpxeWhnmkVFSNpleWBcbmPlOAAp4rp/hJ+3H4B+IEsek+IZX8A+KVAWXTdbPlRFv+mcxAUj0DbT9a7nxHJb+PvjF4U0uGRbnT/Dlu/iC5aMhkM8gaG1Gf90zv/wB8mlHexptqfLXxYsdVhms7Ow8BaT4j8K2ljFb+Ivh5JpMEOsaayDa91aSRqJJEb7yzRs4zwRg8ePeIvhnpXhjSY/EGgN4y8f8AgVziG90DW/IutLJ/5d7y18l2hkXpnhWx26V9n+OfG0Pjr4zN8NvEnwwuL6O3Vbmw1yx1FPttvGxIW7QptaBdykf6wPxnawqt4y/Zh1uSaS603VLDxgCCFTxJ5llqqLjhU1Wz2yt/22R/c1d77gtND5W8O6xrvw50Dw540sNa8Rar4F1jU10S/wBB8Ywhbu2kcfLJEx+WWMjPzKB0wV5r0n4gfsk+AfHXmXMFm3h3UJBzPpOEjY+rRH5T+GK4/wAffsq30GrQ6zdah4t8LahZOssX/CXQHxFpaMDkBby33sq5x/rYh05rodJ8e/GXQ7XzrjwjovxI0mL5X1HwVqEc7qo7tEhLKf8AeRfSqTVrM5qkJX5qb1OBtf2dvjL8Hpmn+HPjqaS2XBFtbXj2jN9YmJjP51tWn7Z3x6+Fe2D4g+EbfxDYJgNNqGnmBiPaeH93+JU11dn+194MtpPI8Q2GueFbzOPJ1SwbAPcblyf0rudL+Nvw/wDEUKLZ+L9InEv/ACyluRGT9VfFZypU5rlktw9vWh8SuJ8NP20fhR8VJIbHUjP8P9amIVF1Bw9nI54wJl4HP94LXrviGTTvBmmXGq+JtXsdD0S3AZ9Tu5QsTgjIEfPzkjoFya+afid+zv8ADz4nWc1zps2n6FrbjMd9pssflux5HmRqdrA9yMN714b4F/Z/8ZfEbW/7C8a67d2vhnwvK1pCsl0ZV5O4rahjtCsCDv6YIAGeB8DmPAuTZjXhWdLls9eX3VJdml+as/M9ahms4Qa5vv1+4938bf8ABQnwb4fuTY+AvCN34svM7Uv9XYwRM2cApCAXYH32muKn+OH7UvxeUjR7ZvCWmSn5Psdmliqr6CSXMmPpXs/gz4f+BfhhZquj2Gm6eVGDdzSI0z+7SMcn860NS+LvgnR1Y3/i3RYMfezeox+mFJNfYYPK8Fl1P2eGpxgvJJf8OebUxtWs9Ff11PnOz/Y78V+OL8aj8Q/HE17OxyyxzSXcwPUjzJDgfgK9l8L/AAN+H3wh0641e20ZZJLOB55NQvSZ5gqKWJXPAPB+6BWPrH7XHw402RobHUbzXrhjjytNs3bJ+rbRVZviZ8U/iNps8XhT4O30WlXMbRvqXih/s1t5bAhixbYuMH+8a9Ncq+FHNL21R+9t9xw+vfFDx94g8F2vxA1DxnYfC/wJqN29rpSQWT319clchsqqnpgkklR6Cs/w+niXx9oOoatp/wAZPE6+FrNCdY8QatpQ0+wtou6xv5rNLM3AWNBkkjJFdf8AB/4S+OvB+jv4fk+Kok0hiXfwr4R0weISjHnG6RGgjPqS2K+gNN+BeueJlsUvdFjt7S0Obe+8cXK6pcRejQ6dBttIm9CxYjPSlp1OpRitEfHuifD3wdrnw78R6/D4F1nToFjMHhbVptRnbWda1HqCsQ/d+WoyzlVIUcbs819Ifs0/sqC38J6J4nF/o9hPqNsl0NUsbRr3U2DqDlbi5ykJ/wByLI7Nnmvpbwf8LdI8J3n9pyvca7rzReS+r6oyvP5feONQAkMf+xGqj61z/wAA9Pfwjout+B5WZ28NanLb2u7q1nKfOtj/AN8Pt+qEdqnm7D33Ou8GfD3Q/AdvcJpNs4ubt/NvL+6lae7u5P78szks5+pwOwFfMv7cN1p/hP4l/BXxVc3Edk0Wo3Nlczu+0fZmVM7j/dBY/nXuXxm/aG8FfAvSXuPEWpq2pMubbRbMiS9uW7BY8/KD/ebA96+HviDP4y+IWuad8X/HtjBb2X9pWumad4OvIt8S2E7mKRW3dJCHLbuDkZ4wAIjdu/YbtFWl1P0E+G97HqXhG1CzLI0RYEq2cAnK/gQaK+ef2RfEF/p/w309Y5nuI4vtVpAzncXt4rl44WJ7/Io59KKpxbd0Yxmo+6+h6V+1B8K7Dx94C1Ga48yOe1i86OW3OJY5Y8tFIh7MG49wSK/K/wAydxZeTptyA9gl/dW1siGCYSL88rgAsIwSNwAYKAcba/a3XtKXWNJurQnAmjK5POD2OPrX5veOvhu/wb8US2mtW81p4djuXm0rXoRN/wAS5mdn8meSEGWDazOY50V12sVdGX7qj7yNYyUJep3dn4B8G/ED4P6bBdHTvGjabpIjTUrch55Gji7SKd68jofxFeif8E59Ps7X9n9tUNxvu7zUJ/tTSSbmhWP5EQ8/KAoyAfWvnafwv4a8SMmo2Z0vVrhuTqOjzRRzvzn55NPuotx6nLWwY8kgVj+EJ/GvwG8SS6v8Pdb0rTtPnT/TdC1e5u2t7thkFmM8Ea5PQEPkeuKqUm0EKbhfU+nvh3488T6xofxC+I/gTQLfxf4m17XxD/Z9zc+Q1jpkKBLZijFTIWjHmqgK587INdz8Lf2nbPxJpEz+MLa18NX8D3sZETysJvsaB7pvKZA8PlggMr87uBu4J8M8C/tUfC3UPBereDPEWgXXwau9aBE99pKeZZPIQP3iTR5wMKBgjG3jOK9L8O/CiDRfD/gDVvhTeaJ8QLfw8dTe5Se/SL7eb1BufzEV1XDclGAyMDPFZ6Gj8z3Hwn8UvDPjLRrHVNL1VBBfTSWtvHdA280kyZ3xCN8MXG05UDtXh+v/ABN8NeKPGVhpPiT4H6/a6lqN+lrZajcaYqSctgyyTJgxqF+bh24HrWN4Z+GPin4Z+LvghpUvhltUstIsL0X99pinybW/u3/eyqwUqojUHG7bkP8ALkjFc5aeB9F+HP7SiaJoeu6/dfZ7e+1PXNQ1mb54MW6zI5lRke4Tc6krKpTK4VsqwFJai0PovVPgba3tu0MHibXEgx8tpqUsWq2y8Y4jvI5SB9GFeba7+xpomqeY0+heBNYd+S0+gS6dIfffazhQfogrhPhB8QPi43g/wBa3mrzS6l4x1iWaz1HVGjukmsls3lBUBmeNWkVGZTtKhiq4Fdh4P/aF8Vp8OtKXVLzSNQ8aX3jH/hHEgdkDNAtwY5ZQibd2NjgMFA+6SKWqCx5t4q/Y18D6PqNvYX2k+G9J1O8RpoLW38X3dq0iJlnZRNA+AAD1PQH0NV4v2ENL1TTbe507w/c39pOivFNB43UwyIRkMrfYuQc8Gur8Xa4vj3wD488YfErwlY33iX4dXbWNvp8N1LDZy71iLLII5G8xR5pHJ+YdVUsRXqfib4ifEb4far4ZiuNE8Jz6LrepHSNP0+yuJ0uIz5EkkLNIw8sA+UAQF+UNwTinfyDXueI6f+wFYRSDzvA9hcrnP/Ew8aXLg+xEVmv867TQ/wBinTtPkWSLwh8OtLI5Bmtb/VmH/f2eNSf+A10Ok/tIeIv+FZjWtb0fT9N12DxfB4XvLUllRN06RyMF3t86h+gZh39q8u+K37S/jTSfFWrxJ4qh0nTtJ1tbRLW00oLDfeVcRrLai4aQyrII33ksiBwrbMgZppy6BZvdn0B4f+Acmhx7U8S/2fH3tvDmjWWlR/TcsTyD/vvNdMvwl8H6ehvdS0xdSMKFnuteupL0IoGSczswUDn0rxj4v6h4j+F+reEL+5+KOt6hqeu61HaT6VbxQwWq2Ep8t5IohGxTymlhxIzn5iOpOKi8d/A7SfDHjzw7oNk2vXeieM9K1PRdZkm1O5uHmuFjSaCeRnZgr5RxuwBzjHai8n1FZI7f45fEhtB8CWdv4G8VaDok9whuvtCRG7JsVYIxtYYUcSOZHiQccbj9R5F8M/jNrfw98E/EO6dNX8U+Lms28TwR655Nvay2qYhkkiMUr8R+WS0fDE9gTmqHwX+HfiW+b4a2t/oPiOafTxqVv4hbWtOWwtIbO7jInhSThpmaULJkZzuY5HAr1Gz/AGTfCHw78fW/jCy1640fw7Bp13Z3+malciS3l89Ajv5sh+QFV+ZehKqeDnK0S1HpsaXw7+JHjGx+I2g+H/GWpafqth4q0M6vpF5aWAtPLnQqZrY4kcPhHR1OckZ9K88/bgvfEfh3XvAM3hjxDP4ak8TXR0DULizA850DB4mB6jbvk5BB+YCoda/aa+DPwx0jwt4c8NJe/FXX/DEXkaQNOjM7xNs8sk3GAoyvB2hunSvnz4geNviR8bvHWm+JfGO7wRBosu/RNMtxZslsxxl3+03EZLnC5Zh2GAOlJavTYeq1ZH8avgXZfDbwLaa9Zi81nUzfL/a+t387vMsZUhSWHKKX25I+bHevOvh7p+q+PLjR9DtNWO+6vzbxQ/apZbS1m8lpBcANnLiNZNqgld2G46V61deGb7xhH5+oajqPi6eHLLNqlwt9bWvbettbBbVSOfnuLjYuOQau/s9+A4r/AMdf2xp/+laDpbzst+HMi3+oSKI2Mb4HmrGm4eYAFLyMFG0CtbczMlJ04Pmd2fZ/wJ+Htl4U8L2cNvbiPTrW2Wys4WOfkXqxPqSPzyaK9C8M6XJpWgWVq6/vI4xvGejHkj9aKxlLUUIpRVzbrH8QeFNN8SwlL2AF9pXzU4bB7e49jWxSGsU2tUW0mrM8C8Vfsf8AgDXZWmvNA0a5QgljNp0YOcddy4596+DGsfAem/tFal4R1DwzZ6PoKznTobrT7mW0eCQkGOQurDklthycfdPY1+tsg3LyMjuK/Mj9qD4QSeB/itrurSC2s9M1Sf7TBqWoWjXFjHKUCSW12FVisUqhHWTHysD06jojKUkZqEYuy0ueSfFLwPp/gfxZqmjw6vNeeGoNYsYLj5wzmOZGkIZsY86MKw3AZIYZr067/ZK+KHwxv93hXw9r1xeq2bHxR4R1lIkuoico00DkMjYIzg44rxfxNDc+J9Pt7K1t9HW3gnWC0sfCCu9lBczOiefPOxbe7cKoLsen3QMH9ltJ08Wuj2FvcIryw28cbFhnkKAevvR8jd3ikrnx94Buv2yPC2jx3GoaXofieFOP7P1q5gW9ZR/txMoz/vMTVnWv287r4daoukfFT4Raj4a1SaHnybmKdZockZXeBuTO4cMR1r7FlkS3heWR1iiQbmkchVUdySeAK8R8SeGfB3jr4+eFb66sdF8U2N74dvoomeKK7iVobiJtwPIz+9YZ9sVGgX6tHlHw+/aj/ZitfEEWt6bpVl4S1obgtxNpbxmLd97aY1ZVz3xjNbek2v7K2qX1nqGk+JfD2n30N696bmPUjBPPI8iysJGk+YrvVTjjGMDAJB9M+Jngj4X/AA18G3/iS9+GWhX9jZFGultdItt0cRYB5TlfuqCSe9eY61b/ALP2vfDObx43ws0+400amukxR/YEtJZJyQvIBGwAkjnnI6VXmmw0fQ6TVvAvwo8Vy+IFi+LCw6H4jvf7S1bRbXXrI213KShJJZTIgPlpkKw4GO9ekeLm8CeNG8OSah4o00DRNSi1S0MWqQrumRHRQx3crhzkDrxXk3gL9k34FfFXwPo3iWL4crpMepRGUW4vrgOnzEYYh+eRXmumfCr9lfUNUm0y/wDCuo6RdwSSpPJNc3htoQhlKl5g20bkhZh+XUGj0f4AemeIPgP8Bta1zVta1PxVZf2pqWpzam903iCAGNpB+8jjUkqiHrkDeDghgQKn8Rad+zbb6h4h1HW/Efhm+l1wpJeQ3WspKhdXEgdFViVYsAxI9x0JFeZaZ8Iv2X5tQkEfgLXJ7FXS2+1Sx37lrlwzLAsKkuW8tGkPHAxnBNbWl+F/2ao7oC3+Fiy6SXmQ6p9guJwnlxQyOXjyZEAEpzuAx5b09V/wwtGdR44/a3/Z6ml06TVb2y8SXGkv5tj9lsGuWgYAcxsVAHQd8cD0qiv7e1p4reSH4e/C7xj41lGVWWO3WGHd7sN+Pxr0Wz/ZJ+CGp2tvc2/w80G4trhFlilSNyrqwyrD5uQQc1L+y34V0nwr4H1238P262miP4l1Q2VvE7FUiS4aIKMk9PL71OnUeltEfN3xU/aK/aet4kx8O5vAumTLk3tjpj6pNEp7lssFb22ivn74geCfH3xM8Oav4r1/VfF+p6Po1m95e6v4qt3tLYyZCxwW0DHlmYgZAAHp6/rmVyMZYf7rEH9K8D/bps5Lr9l3xcimUxxvaSSlcuRGLmPcTk8gDmjTsCbbR8MfDL4Q3njCx1bU9U1WDwlo2iRxm7+z2qMAxgWYhY2OwBY3XLtuZmY810P7P/huz+KcutSWHijxdpCaXMAsttdRQbkdn8rhI+DsQk88FsCuF0eTU9d8OT2cGg6lqkcsKW82raXrS22j38cQCxSX6MvyMihQ3zoSFwwr3v8AY08CzWGn67d2p8+11i5t7e0ugpUXYiVg9wgPSNpHfb0yqA1rHWxjVTSk7+h6pZ/sZWmuSRP4hutc8TRq29Y/EeuS3EP18oNtP5V794H+FemeE47ZgkTNbKEgjhjCQwgdNi+3rXZQW/lxorEOVAAx04qesZVHshKmt27+oD0HAopKKxNR9JiiigBO9Y/iHwpp3iSLbeW/m/Ls3LwwB7e49jRRVRbi7oTSkrM8o+K37N+i+MPAN7oFlFLbxzMsgFvsjeN1IZJI8AAMrAEevSvMrfwt+0jb28elwfE6I2sQ8tbqbw3G97tHA3OflJx/F60UV0xfN8Wpg06btB2PBPin8Ode8RfFiDwT8SfjZqemaaNLfU7jUPEUgS0eTftEMUCsseQPmPJrtfgT4x+Fv7P15dxeB4vGXxg1tlaM32l6X5NlbRswaRYdxVFDMFJxnOBzxRRRFJz5djdyapcz1PV9W/a6g17TLnTtU+B/jy9sbhNk1tNZQuki56MN/NYsf7RXhFdS+3H4CeOorsXH2veunJjz9/mebtEu3fv+bdjOaKK29ik9GzjWIb3S/H/M0vD/AO1j4Y8KmY6b8H/iHpwm2h0j0wMnyk4wplIHLHoBnPOa5OH4t/B+31aXU5Pgt8QBcyyNJKs2mzSxMzBwd0RnKEYlk4xgbzjGaKKXslfdlKs3pZEWl/F74K6Hxb/Cv4k26m/j1LbJp91IBcxghJhmc/MASvuODmif4wfAm8tIrV/hp8Q7dEu57wSRaVdRyGSbibLrLuKsOCucYGAAKKKHT03ZftXfY9GtP25Ph1pdlBbW/hvxvbW1vGscUa+G5QEVRgAc9ABivAvFHw80T9oDxqmsfCn43QeH5xPNdweGdeknsJ9OnmcyzGAAhiGckkbTjJGSAACisKkeTzOinJtM6D4M/Ef9om60CaSz8XaD4qn0/ULnS59P121MjPJC+0mO5hwXU8EE11Hj7Uvjh8a/DVz4K8TaD4b8I+H78pHqd5p801zc3EIYMY4kYYTdgcnkdqKK0UI9jkqVpxm0jto/2O/B3iq4j1jVPCmkRXzbT++gKl9uNrOikKeg6jPrXuPgv4e2XhKNHULLOi7EZUCLGuMbVXsKKKynN7GsacVZnV0UUVzmwoooooA//9k='
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="returnsAll.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {
        console.log(e);
    }
};
// done
exports.returnDetail = async(req, res, next) => {
    try {

        const { id } = req.params;
        const list = await sequelize.query(
            `SELECT db.id,db.du_name,db.du_status,db.du_serial,users.fullname,clas.name,rt.createdAt
      FROM returns AS rt
      INNER JOIN re_du AS rd ON rt.id = rd.returnId
      INNER JOIN durables AS db ON rd.duId = db.id
      INNER JOIN users ON rt.userId = users.id
      INNER JOIN clas ON users.claId = clas.id
      WHERE rt.id = ${id}`, {
                nest: true,
                type: QueryTypes.SELECT
            }
        );
        var length = list.length;
        var rows = [];
        // const fulname = await User.findAll({ where: { id: id3 } });
        // console.log(fulname[0].fullname);
        // var fname = fulname[0].fullname;
        var name = list[0].fullname;
        var classes = list[0].name;
        var unit = 0;
        console.log(classes);
        rows.push([
            { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อครุภัณฑ์', style: 'fillheader' },
            { text: 'สภาพครุภัณฑ์', style: 'fillheader' }, { text: 'หมายเลขครุภัณฑ์', style: 'fillheader' }
        ]);
        console.log(list[0].createdAt);
        var time = (list[0].createdAt).toString();
        var year = +((list[0].createdAt).toISOString()).substring(0, 4) + 543;
        var month = ((list[0].createdAt).toISOString()).substring(5, 7);
        var day = ((list[0].createdAt).toISOString()).substring(8, 10);
        console.log(time);
        // var month = 5;
        var THmonth;
        switch (+month) {
            case 1:
                THmonth = ' มกราคม ';
                break;
            case 2:
                THmonth = ' กุมภาพันธ์ ';
                break;
            case 3:
                THmonth = ' มีนาคม ';
                break;
            case 4:
                THmonth = ' เมษายน ';
                break;
            case 5:
                THmonth = ' พฤษภาคม ';
                break;
            case 6:
                THmonth = ' มิถุนายน ';
                break;
            case 7:
                THmonth = ' กรกฎาคม ';
                break;
            case 8:
                THmonth = ' สิงหาคม ';
                break;
            case 9:
                THmonth = ' กันยายน ';
                break;
            case 10:
                THmonth = ' ตุลาคม ';
                break;
            case 11:
                THmonth = ' พฤศจิกายน ';
                break;
            case 12:
                THmonth = ' ธันวาคม ';

        }
        var THdate = 'วันที่ ' + day + THmonth + 'พ.ศ. ' + year;
        console.log(THdate);

        for (var i = 0; i < length; i++) {
            if (!list[i].offer_status) {
                status = 'ยังไม่อนุมัติ';
            } else {
                status = 'อนุมัติ';
            }



            rows.push([{ text: i + 1, alignment: 'center' }, list[i].du_name, list[i].du_status, list[i].du_serial]);
            unit = unit + list[i].unit;
        }
        var documentDefinition = {
            pageSize: 'A4',
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                // return [
                //     { text: 'simple text', alignment: (currentPage % 2) ? 'left' : 'right' },
                //     { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', alignment: 'center' },

                //     { canvas: [{ type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 }] }
                // ];
            },
            footer: function(currentPage, pageCount) {
                return {
                    columns: [
                        { text: 'ออกรายงานโดย ' + name, alignment: 'right' },
                        { text: 'แผ่นที่ ' + currentPage, alignment: 'center' },
                        { text: 'พิมพ์วันที่ ' + date, alignment: 'left' },
                    ]
                };
            },
            content: [
                { image: 'logo', width: 70, height: 70, alignment: 'center' },
                { text: 'รายการคืนครุภัณฑ์\nโรงเรียนบ้านสวายจีก อำเภอเมือง จังหวัดบุรีรัมย์\nสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 10], alignment: 'center' },
                { text: 'วันที่ ' + THdate, style: 'header', fontSize: 16, bold: false, margin: [0, 0, 0, 10], alignment: 'center' },
                { text: 'ข้าพเจ้า ' + name + ' ครูประจำชั้น ' + classes + ' ได้คืนครุภัณฑ์ตามรายการต่อไปนี้', style: 'header', fontSize: 16, bold: false, margin: [0, 0, 0, 0] },
                {
                    table: {
                        widths: ['auto', 200, '*', '*'],
                        body: rows
                    },
                    layout: 'lightHorizontalLines'
                },
            ],
            images: {
                logo: 'data:image/;base64,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'
            },
            styles: {
                fillheader: {
                    fontSize: 18,
                    bold: true,
                    fillColor: '#A9A9A9'
                },
                price: {
                    fontSize: 16
                }
            },
            defaultStyle: {
                font: 'THSarabunNew',
                fontSize: 14
            }
        };
        const pdfDoc = await pdfMake.createPdf(documentDefinition);
        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="returnDetail.pdf"'
            });

            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });
    } catch (e) {

    }
};