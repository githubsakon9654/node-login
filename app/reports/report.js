const pdfMake = require('../../pdfmake/pdfmake');
const vfsFonts = require('../../pdfmake/vfs_fonts');
const db = require("../models");
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const Supplie = db.supplie;
const Durable = db.durable;
const User = db.user;
const Offer = db.offer;

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

exports.supplieList = async (req, res, next) => {

  const supplies = await Supplie.findAll();
  var length = supplies.length;
  var rows = [];
  rows.push(['No.', 'ชื่อพัสดุ', 'ราคา', 'จำนวน', 'หน่วย']);

  for(var i = 0; i< length;i++) {
    rows.push([+supplies[i].id,supplies[i].supplie_name, +supplies[i].price,+supplies[i].unit, supplies[i].unit_name]);
  }

  var documentDefinition = {
    content: {
      table: {
              widths: ['*',200, '*', '*', 100],
              body: rows
          }
    },
    defaultStyle: {
      font: 'THSarabunNew'
    }
  };
  const pdfDoc = await pdfMake.createPdf(documentDefinition);
  pdfDoc.getBase64((data) => {
    res.writeHead(200,
      {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename="supplielist.pdf"'
      });

    const download =  Buffer.from(data.toString('utf-8'), 'base64');
    res.end(download);
  });
};

exports.durableList = async (req, res, next) => {

  const durables = await Durable.findAll();
  const list = await sequelize.query(
    `SELECT db.id,db.du_name,du_status,du_serial,users.fullname FROM durables AS db 
    LEFT JOIN users ON db.userId = users.id`,
    {
      nest: true,
      type: QueryTypes.SELECT
    }
  );
  var length = list.length;
  var rows = [];
  rows.push(['No.', 'ชื่อครุภัณฑ์', 'สภาพ', 'รหัสครุภัณฑ์', 'ถือครอง']);
  
  var fullname ='';
  for(var i = 0; i< length;i++) {
    if(!list[i].fullname){
      fullname = 'คลัง';
    } else{
      fullname = list[i].fullname;
    }
    rows.push([+list[i].id,list[i].du_name, list[i].du_status,list[i].du_serial,fullname]);
  }

  var documentDefinition = {
    content: {
      table: {
              widths: ['*',200, '*', '*', 100],
              body: rows
          }
    },
    defaultStyle: {
      font: 'THSarabunNew'
    }
  };
  const pdfDoc = await pdfMake.createPdf(documentDefinition);
  pdfDoc.getBase64((data) => {
    res.writeHead(200,
      {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename="offerlists.pdf"'
      });

    const download =  Buffer.from(data.toString('utf-8'), 'base64');
    res.end(download);
  });
};

exports.offerList = async (req, res, next) => {
  try{
    const list = await sequelize.query(
      `SELECT db.id,db.offer_name,db.offer_status,users.fullname,db.createdAt FROM offers AS db 
      LEFT JOIN users ON db.userId = users.id`,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push(['No.', 'ชื่อคนเสนอ', 'สถานะ', 'เวลาที่เสนอ']);
    var status = '';
    var date = '';
    var fullname;
    for(var i = 0; i< length;i++) {
      if(!list[i].offer_status){
        status = 'ยังไม่อนุมัติ';
      } else{
        status = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].id,fullname, status,date]);
    }


    var documentDefinition = {
      content: {
        table: {
                widths: ['*',200, '*', 'auto'],
                body: rows
            }
      },
      defaultStyle: {
        font: 'THSarabunNew'
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="offerlist.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e){
    console.log(e);
  }
};

exports.borrowList = async (req, res, next) => {
  try{
    const list = await sequelize.query(
      `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt FROM borrows AS db 
      LEFT JOIN users ON db.userId = users.id`,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push(['No.', 'ชื่อคนยืมครุภัณฑ์', 'เจ้าหน้าที่', 'ผู้อำนวยการ','เวลาที่ขอยืม']);
    var date = '';
    var adstatus = '';
    var distatus = '';
    var fullname;
    for(var i = 0; i< length;i++) {
      if(!list[i].dire_approvev){
        distatus = 'ยังไม่อนุมัติ';
      } else{
        distatus = 'อนุมัติ';
      }
      if(!list[i].admin_approve){
        adstatus = 'ยังไม่อนุมัติ';
      } else{
        adstatus = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].id,fullname,adstatus, distatus,date]);
    }


    var documentDefinition = {
      content: {
        table: {
                widths: ['*',200, '*','*', 'auto'],
                body: rows
            }
      },
      defaultStyle: {
        font: 'THSarabunNew'
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="borrowlist.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e) {
    console.log(e);
  }
};

exports.revealList = async (req, res, next) => {
 try{
  const list = await sequelize.query(
    `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt,db.total_price FROM reveals AS db 
    LEFT JOIN users ON db.userId = users.id`,
    {
      nest: true,
      type: QueryTypes.SELECT
    }
  );
  var length = list.length;
  var rows = [];
  rows.push(['No.', 'ชื่อคนเบิกพัสดุ','ราคา', 'เจ้าหน้าที่', 'ผู้อำนวยการ','เวลาที่ขอเบิก']);
  var date = '';
  var adstatus = '';
  var distatus = '';
  var fullname;
  for(var i = 0; i< length;i++) {
    if(!list[i].dire_approvev){
      distatus = 'ยังไม่อนุมัติ';
    } else{
      distatus = 'อนุมัติ';
    }
    if(!list[i].admin_approve){
      adstatus = 'ยังไม่อนุมัติ';
    } else{
      adstatus = 'อนุมัติ';
    }
    fullname = list[i].fullname;
    date = (Date(list[i].createdAt)).substring(0,24);
    console.log(date);
    rows.push([+list[i].id,fullname,+list[i].total_price,adstatus, distatus,date]);
  }


  var documentDefinition = {
    content: {
      table: {
              widths: ['*',200, '*', '*','*', 'auto'],
              body: rows
          }
    },
    defaultStyle: {
      font: 'THSarabunNew'
    }
  };
  const pdfDoc = await pdfMake.createPdf(documentDefinition);
  pdfDoc.getBase64((data) => {
    res.writeHead(200,
      {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename="reveallist.pdf"'
      });

    const download =  Buffer.from(data.toString('utf-8'), 'base64');
    res.end(download);
  });
 } catch (e){
   console.log(e);
 }
};

exports.revealByUser = async (req, res, next) => {
  try{
    const {id} = req.params;
    const list = await sequelize.query(
      `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt,db.total_price FROM reveals AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.userId = ${id}`,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push(['No.', 'ชื่อคนเบิกพัสดุ','ราคา', 'เจ้าหน้าที่', 'ผู้อำนวยการ','เวลาที่ขอเบิก']);
    var date = '';
    var adstatus = '';
    var distatus = '';
    var fullname;
    for(var i = 0; i< length;i++) {
      if(!list[i].dire_approvev){
        distatus = 'ยังไม่อนุมัติ';
      } else{
        distatus = 'อนุมัติ';
      }
      if(!list[i].admin_approve){
        adstatus = 'ยังไม่อนุมัติ';
      } else{
        adstatus = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].id,fullname,+list[i].total_price,adstatus, distatus,date]);
    }
  
  
    var documentDefinition = {
      content: {
        table: {
                widths: ['*',200, '*', '*','*', 'auto'],
                body: rows
            }
      },
      defaultStyle: {
        font: 'THSarabunNew'
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="revealuser.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
   } catch (e){
     console.log(e);
   }
};

exports.revealDetail = async (req, res, next) => {
  try{
    const {id} = req.params;
    const list = await sequelize.query(
      `SELECT bf.id,bf.total_price,sup.supplie_name,
      sup.price,sb.unit,sup.unit_name,sb.supplieId FROM reveals AS bf
      INNER JOIN reveal_sup AS sb ON bf.id = sb.revealId
      INNER JOIN supplies AS sup ON sb.supplieId = sup.id
      WHERE bf.id = ${id}`,
      {
          nest: true,
          type: QueryTypes.SELECT
      }
  );
    console.log(req.params + 'dddd');
    var length = list.length;
    var rows = [];
    rows.push(['No.', 'ชื่อพัดสุ','ราคา','จำนวน', 'เวลาที่เสนอ']);
    var date = '';
    for(var i = 0; i< length;i++) {
      if(!list[i].offer_status){
        status = 'ยังไม่อนุมัติ';
      } else{
        status = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].supplieId,list[i].supplie_name,+list[i].price, list[i].unit,list[i].unit_name]);
    }


    var documentDefinition = {
      content: {
        table: {
                widths: ['*',200, '*','*', 'auto'],
                body: rows
            }
      },
      defaultStyle: {
        font: 'THSarabunNew'
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="revealdetail.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e) {
    
  }
};

exports.buylist = async (req, res, next) => {
  try{
    const list = await sequelize.query(
      `SELECT db.id,db.status,db.buyprice,users.fullname,db.createdAt FROM buyforms AS db 
      LEFT JOIN users ON db.userId = users.id`,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push(['No.', 'ชื่อเจ้าหน้าที่', 'สถานะ','ราคา', 'เวลาที่เสนอ']);
    var status = '';
    var date = '';
    var fullname;
    for(var i = 0; i< length;i++) {
      if(!list[i].status){
        status = 'ยังไม่อนุมัติ';
      } else{
        status = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].id,fullname,+list[i].buyprice, status,date]);
    }


    var documentDefinition = {
      content: {
        table: {
                widths: ['*',200, '*','*', 'auto'],
                body: rows
            }
      },
      defaultStyle: {
        font: 'THSarabunNew'
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="buylist.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e){
    console.log(e);
  }
};

exports.buyform = async (req, res, next) => {
  try{
    const {id} = req.params;
    const list = await sequelize.query(
      `SELECT bf.id,bf.buyprice,sup.supplie_name,
      sup.price,sb.unit,sup.unit_name,sb.supplieId FROM buyforms AS bf
      INNER JOIN supplie_buy AS sb ON bf.id = sb.buyId
      INNER JOIN supplies AS sup ON sb.supplieId = sup.id
      WHERE bf.id = ${id}`,
      {
          nest: true,
          type: QueryTypes.SELECT
      }
  );
    console.log(req.params + 'dddd');
    var length = list.length;
    var rows = [];
    rows.push(['No.', 'ชื่อพัดสุ','ราคา','จำนวน', 'เวลาที่เสนอ']);
    var date = '';
    for(var i = 0; i< length;i++) {
      if(!list[i].offer_status){
        status = 'ยังไม่อนุมัติ';
      } else{
        status = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].supplieId,list[i].supplie_name,+list[i].price, list[i].unit,list[i].unit_name]);
    }


    var documentDefinition = {
      content: {
        table: {
                widths: ['*',200, '*','*', 'auto'],
                body: rows
            }
      },
      defaultStyle: {
        font: 'THSarabunNew'
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="buyform.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e) {
    
  }
};