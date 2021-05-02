const pdfMake = require('../../pdfmake/pdfmake');
const vfsFonts = require('../../pdfmake/vfs_fonts');
const db = require("../models");
const { QueryTypes } = require('sequelize');
const { sequelize } = require("../models");
const Supplie = db.supplie;
const Durable = db.durable;
const User = db.user;
const Offer = db.offer;
var date = (Date()).substring(0,24);

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
  rows.push([
    {text: 'No.',style:'fillheader'},{text:  'ชื่อพัสดุ',style:'fillheader'},
    {text:  'ราคา', style:'fillheader'},{text:  'จำนวน', style:'fillheader'} , 
    {text:  'หน่วย',style:'fillheader'}
  ]);

  for(var i = 0; i< length;i++) {
    rows.push([+supplies[i].id,supplies[i].supplie_name, +supplies[i].price,+supplies[i].unit, supplies[i].unit_name]);
  }

  var documentDefinition = {
    pageSize: 'A4',
    header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
    footer: {
      columns: [
        { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
      ]
    },
    content: [
      {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
      {text: 'รายการพัสดุที่อยู่ในคลัง',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
      {
        table: {
                widths: ['auto',200, '*', '*', 100],
                body: rows
        },
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
          }
        }
      }
    ],
    styles: {
      fillheader:{
        fontSize:18,
        bold:true,
        fillColor: '#60BF6A'
      }
    },
    defaultStyle: {
      font: 'THSarabunNew',
      fontSize:14
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
  rows.push([
  {text: 'No.',style:'fillheader'},{text:  'ชื่อครุภัณฑ์',style:'fillheader'},
  {text:  'สภาพ', style:'fillheader'},{text:  'รหัสครุภัณฑ์', style:'fillheader'} , 
  {text:  'ถือครอง',style:'fillheader'}]);
  
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
    pageSize: 'A4',
    header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
    footer: {
      columns: [
        { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
      ]
    },
    content: [
      {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
      {text: 'รายการครุภัณฑ์ที่อยู่ในคลัง',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
      {
      table: {
              widths: ['auto',200, '*', '*', 100],
              body: rows
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
      }
    ],
    styles: {
      fillheader:{
        fontSize:18,
        bold:true,
        fillColor: '#60BF6A'
      }
    },
    defaultStyle: {
      font: 'THSarabunNew',
      fontSize:14
    }
  };
  const pdfDoc = await pdfMake.createPdf(documentDefinition);
  pdfDoc.getBase64((data) => {
    res.writeHead(200,
      {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename="durablelists.pdf"'
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
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อคนเสนอ',style:'fillheader'},
      {text:  'สถานะ', style:'fillheader'},{text:  'เวลาที่เสนอ', style:'fillheader'} 
    ]);
    var status = '';
    var date = '';
    var fullname;
    for(var i = 0; i< length;i++) {
      if(!list[i].offer_status){
        status = 'ยังไม่รับทราบ';
      } else{
        status = 'รับทราบแล้ว';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].id,fullname, status,date]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการแบบเสนอที่ร้องขอ',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
                  
                  widths: ['auto',200, '*', 'auto'],
                  body: rows
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        }
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
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
    rows.push([
    {text: 'No.',style:'fillheader'},{text:  'ชื่อผู้ยืมครุภัณฑ์',style:'fillheader'},
    {text:  'เจ้าหน้าที่อนุมัติ', style:'fillheader'},{text:  'ผู้อำนวยการที่อนุมัติ', style:'fillheader'} , 
    {text:  'เวลาที่ขอยืม',style:'fillheader'}
    ]);
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
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการยืมครุภัณฑ์ที่อยู่ในคลัง',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
                  
                  widths: ['auto',100, '*','*', 'auto'],
                  body: rows
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        }
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
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
  rows.push([
    {text: 'No.',style:'fillheader'},{text:  'ชื่อคนเบิกพัสดุ',style:'fillheader'},
    {text:  'ราคา', style:'fillheader'},{text: 'เจ้าหน้าที่', style:'fillheader'} , 
    {text: 'ผู้อำนวยการ',style:'fillheader'},{text: 'เวลาที่ขอเบิก',style:'fillheader'}
  ]);
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
    pageSize: 'A4',
    header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
    footer: {
      columns: [
        { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
      ]
    },
    content: [
      {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
      {text: 'รายการการเบิกพัสดุ',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
      {
        table: {
                
                widths: ['auto',150, '*', 'auto','auto', 150],
                body: rows
        },
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
          }
        }
      }
    ],
    styles: {
      fillheader:{
        fontSize:18,
        bold:true,
        fillColor: '#60BF6A'
      }
    },
    defaultStyle: {
      font: 'THSarabunNew',
      fontSize:14
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
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อคนเบิกพัสดุ',style:'fillheader'},
      {text:  'ราคา', style:'fillheader'},{text: 'เจ้าหน้าที่', style:'fillheader'} , 
      {text: 'ผู้อำนวยการ',style:'fillheader'},{text: 'เวลาที่ขอเบิก',style:'fillheader'}
    ]);
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
      pageSize: 'A4',
    header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
    footer: {
      columns: [
        { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
      ]
    },
    content: [
      {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
      {text: 'รายการการเบิกพัสดุ',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
      {
        table: {
                
                widths: ['auto',150, '*', 'auto','auto', 150],
                body: rows
        },
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
          }
        }
      }
    ],
    styles: {
      fillheader:{
        fontSize:18,
        bold:true,
        fillColor: '#60BF6A'
      }
    },
    defaultStyle: {
      font: 'THSarabunNew',
      fontSize:14
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
      `SELECT bf.id,bf.total_price,sup.supplie_name,users.fullname,users.classes,
      sup.price,sb.unit,sup.unit_name,sb.supplieId FROM reveals AS bf
      INNER JOIN reveal_sup AS sb ON bf.id = sb.revealId
      INNER JOIN supplies AS sup ON sb.supplieId = sup.id
      INNER JOIN users ON bf.userId = users.id
      WHERE bf.id = ${id}`,
      {
          nest: true,
          type: QueryTypes.SELECT
      }
  );
    console.log(req.params + 'dddd');
    var length = list.length;
    var name = list[0].fullname;
    var classes = list[0].classes;
    var total = list[0].total_price;
    var unit = 0;
    var rows = [];
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อพัสดุ',style:'fillheader'},
      {text:  'ราคา', style:'fillheader'},{text:  'จำนวน', style:'fillheader'} , 
      {text:  'หน่วย',style:'fillheader'}
    ]);
    var date = '';
    for(var i = 0; i< length;i++) {
      if(!list[i].offer_status){
        status = 'ยังไม่อนุมัติ';
      } else{
        status = 'อนุมัติ';
      }
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].supplieId,list[i].supplie_name,+list[i].price, list[i].unit,list[i].unit_name]);
      fullname = list[i].fullname;
      unit = unit +list[i].unit;
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการพัสดุที่ขอเบิกของ ' + name +' ครูประจำชั้น '+ classes,style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
            widths: ['auto',200, '*', '*', 100],
            body: rows
          },
          layout: 'lightHorizontalLines'
        },
        {text:'จำนวนทั้งหมด : ' + unit + ' ชิ้น '+ 'ราคา : ' + total + ' บาท',alignment: 'right',margin:[0,10,5,0], style: 'price'},
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        },
        price:{
          fontSize:16
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
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
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อเจ้าหน้าที่',style:'fillheader'},
      {text: 'ราคา', style:'fillheader'},{text:  'สถานะ', style:'fillheader'} , 
      {text:  'เวลาที่เสนอ',style:'fillheader'}
    ]);
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
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการการสั่งซื้อพัสดุ',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
                  widths: ['auto',150, '*','*', 150],
                  body: rows
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        }
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
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
      `SELECT bf.id,bf.buyprice,sup.supplie_name,users.fullname,users.classes,
      sup.price,sb.unit,sup.unit_name,sb.supplieId FROM buyforms AS bf
      INNER JOIN supplie_buy AS sb ON bf.id = sb.buyId
      INNER JOIN supplies AS sup ON sb.supplieId = sup.id
      INNER JOIN users ON bf.userId = users.id
      WHERE bf.id = ${id}`,
      {
          nest: true,
          type: QueryTypes.SELECT
      }
  );
    console.log(req.params + 'dddd');
    var length = list.length;
    var rows = [];
    var name = list[0].fullname;
    var classes = list[0].classes;
    var total = list[0].buyprice;
    var unit = 0;
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อพัสดุ',style:'fillheader'},
      {text:  'ราคา', style:'fillheader'},{text:  'จำนวน', style:'fillheader'} , 
      {text:  'หน่วย',style:'fillheader'}
    ]);
    var date = '';
    for(var i = 0; i< length;i++) {
      if(!list[i].offer_status){
        status = 'ยังไม่อนุมัติ';
      } else{
        status = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      fullname = list[i].fullname;
      console.log(date);
      rows.push([+list[i].supplieId,list[i].supplie_name,+list[i].price, list[i].unit,list[i].unit_name]);
      unit = unit +list[i].unit;
    }
    var documentDefinition = {
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการสั่งซื้อพัสดุของ ' + name +' ครูประจำชั้น '+ classes,style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
            widths: ['auto',200, '*', '*', 100],
            body: rows
          },
          layout: 'lightHorizontalLines'
        },
        {text:'จำนวนทั้งหมด : ' + unit + ' ชิ้น '+ 'ราคา : ' + total + ' บาท',alignment: 'right',margin:[0,10,5,0], style: 'price'},
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        },
        price:{
          fontSize:16
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
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

exports.returns = async (req, res, next) => {
  try{
    const {id} = req.params;
    const list = await sequelize.query(
      `SELECT rt.id,rt.status,rt.re_name,rt.createdAt FROM returns AS rt 
      INNER JOIN users ON rt.userId = users.id
      WHERE rt.userId = ${id}`,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อเจ้าหน้าที่',style:'fillheader'},
      {text:  'สถานะ', style:'fillheader'},{text:  'เวลาที่เสนอ', style:'fillheader'}
    ]);
    var status = '';
    var date = '';
    var fullname;
    for(var i = 0; i< length;i++) {
      if(!list[i].status){
        status = 'ยังไม่รับคืน';
      } else{
        status = 'รับคืนแล้ว';
      }
      fullname = list[i].re_name;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].id,fullname, status,date]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการการคืนครุภัณฑ์',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
                  widths: ['auto',150,'*', 150],
                  body: rows
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        }
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="returns.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e){
    console.log(e);
  }
};
exports.returnsAll = async (req, res, next) => {
  try{
    const {id} = req.params;
    const list = await sequelize.query(
      `SELECT rt.id,rt.status,rt.re_name,rt.createdAt FROM returns AS rt 
      LEFT JOIN users ON rt.userId = users.id`,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อเจ้าหน้าที่',style:'fillheader'},
      {text:  'สถานะ', style:'fillheader'},{text:  'เวลาที่เสนอ', style:'fillheader'}
    ]);
    var status = '';
    var date = '';
    var fullname;
    for(var i = 0; i< length;i++) {
      if(!list[i].status){
        status = 'ยังไม่รับคืน';
      } else{
        status = 'รับคืนแล้ว';
      }
      fullname = list[i].re_name;
      date = (Date(list[i].createdAt)).substring(0,24);
      console.log(date);
      rows.push([+list[i].id,fullname, status,date]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการการคืนครุภัณฑ์',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
                  widths: ['auto',150,'*', 150],
                  body: rows
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        }
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="returnsAll.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e){
    console.log(e);
  }
};

exports.returnDetail = async (req, res, next) => {
  try{
    
    const {id} = req.params;
    const list = await sequelize.query(
      `SELECT db.id,db.du_name,db.du_status,db.du_serial,users.fullname,users.classes
      FROM returns AS rt
      INNER JOIN re_du AS rd ON rt.id = rd.returnId
      INNER JOIN durables AS db ON rd.duId = db.id
      INNER JOIN users ON rt.userId = users.id
      WHERE rt.id = ${id}`,
      {
          nest: true,
          type: QueryTypes.SELECT
      }
  );
    console.log(req.params + 'dddd');
    var length = list.length;
    var rows = [];
    var name = list[0].fullname;
    var classes = list[0].classes;
    var unit = 0;
    rows.push([
      {text: 'No.',style:'fillheader'},{text:  'ชื่อครุภัณฑ์',style:'fillheader'},
      {text:  'สภาพ', style:'fillheader'},{text:  'รหัสครุภัณฑ์', style:'fillheader'}
    ]);
    var date = '';
    for(var i = 0; i< length;i++) {
      if(!list[i].offer_status){
        status = 'ยังไม่อนุมัติ';
      } else{
        status = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0,24);
      fullname = list[i].fullname;
      console.log(date);
      rows.push([+list[i].id,list[i].du_name,+list[i].du_status, list[i].du_serial]);
      unit = unit +list[i].unit;
    }
    var documentDefinition = {
      pageSize: 'A4',
      header: {text:'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin:[5,0,0,5],alignment: 'center'},
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right',margin:[0,0,5,0] }
        ]
      },
      content: [
        {text: 'โรงเรียนบ้านสวายจีก',style: 'header',fontSize: 20,bold:true, margin:[0,0,0,0],alignment: 'center'},
        {text: 'รายการคืนครุภัณฑ์ของ ' + name +' ครูประจำชั้น '+ classes,style: 'header',fontSize: 20,bold:true, margin:[0,0,0,10],alignment: 'center'},
        {
          table: {
            widths: ['auto',200, '*', '*'],
            body: rows
          },
          layout: 'lightHorizontalLines'
        },
      ],
      styles: {
        fillheader:{
          fontSize:18,
          bold:true,
          fillColor: '#60BF6A'
        },
        price:{
          fontSize:16
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize:14
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="returnDetail.pdf"'
        });
  
      const download =  Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e) {
    
  }
};