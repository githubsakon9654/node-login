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
exports.supplieList = async (req, res, next) => {
  var { id, id2 } = req.params;
  console.log(id)
  const supplies = await sequelize.query(
    `
    SELECT supplie_years.supplieId,supplies.supplie_name,supplie_years.id,supplie_years.year,supplie_years.unit,stores.name,supplies.unit_name,supplies.price 
            FROM supplie_years
            INNER JOIN supplies ON supplie_years.supplieId = supplies.id
            INNER JOIN year_units ON year_units.supplieYearId = supplie_years.id
            LEFT JOIN stores ON supplies.storeId = stores.id
            WHERE supplie_years.year = "${id}/${id2}"
            GROUP BY supplie_years.id
    `,
    {
      nest: true,
      type: QueryTypes.SELECT
    }
  )
  var length = supplies.length;
  var rows = [];
  rows.push([
    { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อพัสดุ', style: 'fillheader', alignment: 'center' },
    { text: 'ราคาต่อหน่วย(บาท)', style: 'fillheader' }, { text: 'คงเหลือ', style: 'fillheader', alignment: 'center' },
    { text: 'หน่วย', style: 'fillheader', alignment: 'center' }
  ]);

  for (var i = 0; i < length; i++) {
    var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(supplies[i].price)
    rows.push([{ text: i + 1, alignment: 'center' }, supplies[i].supplie_name, { text: price, alignment: 'center' }, { text: supplies[i].unit, alignment: 'center' }, { text: supplies[i].unit_name, alignment: 'center' }]);
  }

  var documentDefinition = {
    pageSize: 'A4',
    header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
    footer: {
      columns: [
        { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
      ]
    },
    content: [
      { text: 'รายการพัสดุ ' + id + '/' + id2, style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 0], alignment: 'center' },
      { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
      { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
      {
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
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
    res.writeHead(200,
      {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename="supplielist.pdf"'
      });

    const download = Buffer.from(data.toString('utf-8'), 'base64');
    res.end(download);
  });
};
// done
exports.durableList = async (req, res, next) => {

  const durables = await Durable.findAll();
  const list = await sequelize.query(
    `SELECT db.id,db.du_name,db.du_status,db.du_serial,db.get,users.fullname,db.du_price,db.date FROM durables AS db 
    LEFT JOIN users ON db.userId = users.id`,
    {
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
    { text: 'เลขเอกสาร', style: 'fillheader' }, { text: 'ถือครอง', style: 'fillheader' },
    { text: 'เลขเอกสาร', style: 'fillheader' }, { text: 'ถือครอง', style: 'fillheader' },
    { text: 'เลขเอกสาร', style: 'fillheader' }
  ]);

  var fullname = '';
  for (var i = 0; i < length; i++) {
    if (!list[i].fullname) {
      fullname = 'คลัง';
    } else {
      fullname = list[i].fullname;
    }

    var cate = list[i].du_serial.substring(4, 12)
    var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].du_price)
    var date = list[i].date.toString()
    var month = date.substring(5, 7)
    var year = +((list[i].date.toString()).substring(2, 4)) + 43
    var day = (list[i].date.toString()).substring(8, 10)
    var THmonth
    switch (+month) {
      case 1:
        THmonth = ' ม.ค. '
        break;
      case 2:
        THmonth = ' ก.พ. '
        break;
      case 3:
        THmonth = ' มี.ค. '
        break;
      case 4:
        THmonth = ' เม.ย. '
        break;
      case 5:
        THmonth = ' พ.ค. '
        break;
      case 6:
        THmonth = ' มิ.ย. '
        break;
      case 7:
        THmonth = ' ก.ค. '
        break;
      case 8:
        THmonth = ' ส.ค. '
        break;
      case 9:
        THmonth = ' ก.ย. '
        break;
      case 10:
        THmonth = ' ตุ.ค. '
        break;
      case 11:
        THmonth = ' พฤ.ย. '
        break;
      case 12:
        THmonth = ' ธ.ค. '
    }
    var THdate = day + THmonth + year
    // console.log(THdate)
    rows.push([
      THdate, cate, list[i].du_name, list[i].du_serial, price, list[i].get, '', fullname, '', '', ''
    ]);
  }
  var documentDefinition = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    // header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [0, 0, 0, 5], alignment: 'center' },
    footer: {
      columns: [
        { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
      ]
    },
    content: [
      { text: 'ทะเบียนครุภัณฑ์', style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 0], alignment: 'center' },
      {
        alignment: 'justify',
        columns: [
          { text: 'แผ่นที่', style: 'header', fontSize: 18, bold: true, margin: [0, 0, 0, 0], alignment: '' },
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
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
          body: rows
        },
        // layout: {
        //   fillColor: function (rowIndex, node, columnIndex) {
        //     return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
        //   }
        // }
      }
    ],
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
    res.writeHead(200,
      {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename="durablelists.pdf"'
      });

    const download = Buffer.from(data.toString('utf-8'), 'base64');
    res.end(download);
  });
};
// done
exports.offerList = async (req, res, next) => {
  try {
    var { id, id2 } = req.params;
    const list = await sequelize.query(
      `SELECT db.id,db.offer_name,db.offer_status,users.fullname,db.createdAt FROM offers AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE  db.offer_status = true
      `,
      {
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
    for (var i = 0; i < length; i++) {
      if (!list[i].offer_status) {
        status = 'ยังไม่รับทราบ';
      } else {
        status = 'รับทราบแล้ว';
      }
      fullname = list[i].fullname;
      date = (Date(list[i].createdAt)).substring(0, 24);
      console.log(date);


      var year = +((list[0].createdAt).toISOString()).substring(0, 4) + 543
      var month = ((list[0].createdAt).toISOString()).substring(5, 7)
      var day = ((list[0].createdAt).toISOString()).substring(8, 10)
      var THmonth
      console.log(year)
      console.log(+month)
      console.log(day)
      switch (+month) {
        case 1:
          THmonth = ' มกราคม '
          break;
        case 2:
          THmonth = ' กุมภาพันธ์ '
          break;
        case 3:
          THmonth = ' มีนาคม '
          break;
        case 4:
          THmonth = ' เมษายน '
          break;
        case 5:
          THmonth = ' พฤษภาคม '
          break;
        case 6:
          THmonth = ' มิถุนายน '
          break;
        case 7:
          THmonth = ' กรกฎาคม '
          break;
        case 8:
          THmonth = ' สิงหาคม '
          break;
        case 9:
          THmonth = ' กันยายน '
          break;
        case 10:
          THmonth = ' ตุลาคม '
          break;
        case 11:
          THmonth = ' พฤศจิกายน '
          break;
        case 12:
          THmonth = ' ธันวาคม '

      }
      var THdate = 'วันที่ ' + day + THmonth + 'พ.ศ. ' + year
      var THdate2 = day + THmonth + 'พ.ศ. ' + year
      console.log(THdate)

      rows.push([i + 1, fullname, status, THdate]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'ใบรายการแบบเสนอ ' + id + '/' + id2, style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {

            widths: ['auto', 200, '*', 'auto'],
            body: rows
          },
          // layout: {
          //   fillColor: function (rowIndex, node, columnIndex) {
          //     return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
          //   }
          // }
        }
      ],
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
      res.writeHead(200,
        {
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
exports.borrowList = async (req, res, next) => {
  try {
    const list = await sequelize.query(
      `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt FROM borrows AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.admin_approve = true AND db.dire_approvev = true
      `,
      {
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
      var dates = list[i].createdAt.toISOString()
      console.log(dates)
    var month = dates.substring(5, 7)
    var year = +((dates).substring(2, 4)) + 43
    var day = (dates).substring(8, 10)
    var THmonth
    switch (+month) {
      case 1:
        THmonth = ' ม.ค. '
        break;
      case 2:
        THmonth = ' ก.พ. '
        break;
      case 3:
        THmonth = ' มี.ค. '
        break;
      case 4:
        THmonth = ' เม.ย. '
        break;
      case 5:
        THmonth = ' พ.ค. '
        break;
      case 6:
        THmonth = ' มิ.ย. '
        break;
      case 7:
        THmonth = ' ก.ค. '
        break;
      case 8:
        THmonth = ' ส.ค. '
        break;
      case 9:
        THmonth = ' ก.ย. '
        break;
      case 10:
        THmonth = ' ตุ.ค. '
        break;
      case 11:
        THmonth = ' พฤ.ย. '
        break;
      case 12:
        THmonth = ' ธ.ค. '
    }
    var THdate = day + THmonth + year
      rows.push([{ text: i+1, alignment: 'center' }, fullname, adstatus, distatus, THdate]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'ใบรายการยืมครุภัณฑ์ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {

            widths: ['auto', 100, '*', '*', 'auto'],
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
      res.writeHead(200,
        {
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
exports.borrowListByUser = async (req, res, next) => {
  try {
    var { id3 } = req.params;
    console.log(id3);
    const list = await sequelize.query(
      `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt FROM borrows AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.userId = ${id3}`,
      {
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
      var dates = list[i].createdAt.toISOString()
      console.log(dates)
    var month = dates.substring(5, 7)
    var year = +((dates).substring(2, 4)) + 43
    var day = (dates).substring(8, 10)
    var THmonth
    switch (+month) {
      case 1:
        THmonth = ' ม.ค. '
        break;
      case 2:
        THmonth = ' ก.พ. '
        break;
      case 3:
        THmonth = ' มี.ค. '
        break;
      case 4:
        THmonth = ' เม.ย. '
        break;
      case 5:
        THmonth = ' พ.ค. '
        break;
      case 6:
        THmonth = ' มิ.ย. '
        break;
      case 7:
        THmonth = ' ก.ค. '
        break;
      case 8:
        THmonth = ' ส.ค. '
        break;
      case 9:
        THmonth = ' ก.ย. '
        break;
      case 10:
        THmonth = ' ตุ.ค. '
        break;
      case 11:
        THmonth = ' พฤ.ย. '
        break;
      case 12:
        THmonth = ' ธ.ค. '
    }
    var THdate = day + THmonth + year
      rows.push([{ text: i+1, alignment: 'center' }, fullname, adstatus, distatus, THdate]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'ใบรายการยืมครุภัณฑ์ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {

            widths: ['auto', 100, '*', '*', 'auto'],
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
      res.writeHead(200,
        {
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
exports.revealList = async (req, res, next) => {
  try {
    const list = await sequelize.query(
      `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt,db.total_price FROM reveals AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.admin_approve = true AND db.dire_approvev
      `,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push([
      { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อคนเบิกพัสดุ', style: 'fillheader' },
      { text: 'ราคา', style: 'fillheader' }, { text: 'เจ้าหน้าที่', style: 'fillheader' },
      { text: 'ผู้อำนวยการ', style: 'fillheader' }, { text: 'เวลาที่ขอเบิก', style: 'fillheader' }
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
      var dates = list[i].createdAt.toISOString()
      console.log(dates)
      var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].total_price)
    var month = dates.substring(5, 7)
    var year = +((dates).substring(2, 4)) + 43
    var day = (dates).substring(8, 10)
    var THmonth
    switch (+month) {
      case 1:
        THmonth = ' ม.ค. '
        break;
      case 2:
        THmonth = ' ก.พ. '
        break;
      case 3:
        THmonth = ' มี.ค. '
        break;
      case 4:
        THmonth = ' เม.ย. '
        break;
      case 5:
        THmonth = ' พ.ค. '
        break;
      case 6:
        THmonth = ' มิ.ย. '
        break;
      case 7:
        THmonth = ' ก.ค. '
        break;
      case 8:
        THmonth = ' ส.ค. '
        break;
      case 9:
        THmonth = ' ก.ย. '
        break;
      case 10:
        THmonth = ' ตุ.ค. '
        break;
      case 11:
        THmonth = ' พฤ.ย. '
        break;
      case 12:
        THmonth = ' ธ.ค. '
    }
    var THdate = day + THmonth + year
      rows.push([i+1, fullname, price, adstatus, distatus, THdate]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'ใบรายการเบิกพัสดุ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {

            widths: ['auto', 150, '*', 'auto', 'auto', 150],
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
      res.writeHead(200,
        {
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
exports.revealByUser = async (req, res, next) => {
  try {
    const { id3 } = req.params;
    const list = await sequelize.query(
      `SELECT db.id,db.admin_approve,db.dire_approvev,users.fullname,db.createdAt,db.total_price FROM reveals AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.userId = ${id3} AND db.admin_approve = true AND db.dire_approvev`,
      {
        nest: true,
        type: QueryTypes.SELECT
      }
    );
    var length = list.length;
    var rows = [];
    rows.push([
      { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อคนเบิกพัสดุ', style: 'fillheader' },
      { text: 'ราคา', style: 'fillheader' }, { text: 'เจ้าหน้าที่', style: 'fillheader' },
      { text: 'ผู้อำนวยการ', style: 'fillheader' }, { text: 'เวลาที่ขอเบิก', style: 'fillheader' }
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
      var dates = list[i].createdAt.toISOString()
      var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].total_price)
      console.log(dates)
    var month = dates.substring(5, 7)
    var year = +((dates).substring(2, 4)) + 43
    var day = (dates).substring(8, 10)
    var THmonth
    switch (+month) {
      case 1:
        THmonth = ' ม.ค. '
        break;
      case 2:
        THmonth = ' ก.พ. '
        break;
      case 3:
        THmonth = ' มี.ค. '
        break;
      case 4:
        THmonth = ' เม.ย. '
        break;
      case 5:
        THmonth = ' พ.ค. '
        break;
      case 6:
        THmonth = ' มิ.ย. '
        break;
      case 7:
        THmonth = ' ก.ค. '
        break;
      case 8:
        THmonth = ' ส.ค. '
        break;
      case 9:
        THmonth = ' ก.ย. '
        break;
      case 10:
        THmonth = ' ตุ.ค. '
        break;
      case 11:
        THmonth = ' พฤ.ย. '
        break;
      case 12:
        THmonth = ' ธ.ค. '
    }
    var THdate = day + THmonth + year
      rows.push([i+1, fullname, price, adstatus, distatus, THdate]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'ใบรายการเบิกพัสดุ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {

            widths: ['auto', 150, '*', 'auto', 'auto', 150],
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
      res.writeHead(200,
        {
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
exports.revealDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await sequelize.query(
      `SELECT bf.id,bf.total_price,sup.supplie_name,users.fullname,users.classes,
      sup.price,sb.unit,sup.unit_name,sb.supplieId,bf.createdAt FROM reveals AS bf
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
    rows.push(
      [
        { text: 'ลำดับที่', style: 'fillheader', rowSpan: 2, alignment: 'center' }, { text: 'รายการ', style: 'fillheader', rowSpan: 2, alignment: 'center' },
        { text: 'จำนวน', style: 'fillheader', colSpan: 2, alignment: 'center' }, {}, { text: 'หมายเหตุ', style: 'fillheader', rowSpan: 2, alignment: 'center' }

      ],
      [
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
    var year = +((list[0].createdAt).toISOString()).substring(0, 4) + 543
    var month = ((list[0].createdAt).toISOString()).substring(5, 7)
    var day = ((list[0].createdAt).toISOString()).substring(8, 10)
    var THmonth
    console.log(year)
    console.log(+month)
    console.log(day)
    switch (+month) {
      case 1:
        THmonth = ' มกราคม '
        break;
      case 2:
        THmonth = ' กุมภาพันธ์ '
        break;
      case 3:
        THmonth = ' มีนาคม '
        break;
      case 4:
        THmonth = ' เมษายน '
        break;
      case 5:
        THmonth = ' พฤษภาคม '
        break;
      case 6:
        THmonth = ' มิถุนายน '
        break;
      case 7:
        THmonth = ' กรกฎาคม '
        break;
      case 8:
        THmonth = ' สิงหาคม '
        break;
      case 9:
        THmonth = ' กันยายน '
        break;
      case 10:
        THmonth = ' ตุลาคม '
        break;
      case 11:
        THmonth = ' พฤศจิกายน '
        break;
      case 12:
        THmonth = ' ธันวาคม '
    }
    var THdate = 'วันที่ ' + day + THmonth + 'พ.ศ. ' + year
    var THdate2 = day + THmonth + 'พ.ศ. ' + year
    console.log(THdate)

    var documentDefinition = {
      pageSize: 'A4',
      header:
      {
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
      content: [
        {
          alignment: 'justify',
          columns: [
            {
              fontSize: 18, bold: true, width: 440, text: 'ใบเบิกพัสดุ\nโรงเรียนบ้านสวายจีก อำเภอเมือง จังหวัดบุรีรัมย์\nสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', margin: [90, 20, 0, 0], alignment: 'center'
            },
            {
              width: 60, text: 'เล่มที่................\nเล่มที่................', margin: [0, 20, 0, 0]
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
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="revealdetail.pdf"'
        });

      const download = Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e) {

  }
};

exports.buylist = async (req, res, next) => {
  try {
    const list = await sequelize.query(
      `SELECT db.id,db.status,db.buyprice,users.fullname,db.createdAt FROM buyforms AS db 
      LEFT JOIN users ON db.userId = users.id
      WHERE db.status = true
      `,
      {
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
    var date = '';
    var fullname;
    for (var i = 0; i < length; i++) {
      if (!list[i].status) {
        status = 'ยังไม่อนุมัติ';
      } else {
        status = 'อนุมัติ';
      }
      fullname = list[i].fullname;
      // date = (Date(list[i].createdAt)).substring(0, 24);
      console.log(date);
      var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].buyprice)
      var dates = list[i].createdAt.toISOString()
      console.log(dates)
    var month = dates.substring(5, 7)
    var year = +((dates).substring(2, 4)) + 43
    var day = (dates).substring(8, 10)
    var THmonth
    switch (+month) {
      case 1:
        THmonth = ' ม.ค. '
        break;
      case 2:
        THmonth = ' ก.พ. '
        break;
      case 3:
        THmonth = ' มี.ค. '
        break;
      case 4:
        THmonth = ' เม.ย. '
        break;
      case 5:
        THmonth = ' พ.ค. '
        break;
      case 6:
        THmonth = ' มิ.ย. '
        break;
      case 7:
        THmonth = ' ก.ค. '
        break;
      case 8:
        THmonth = ' ส.ค. '
        break;
      case 9:
        THmonth = ' ก.ย. '
        break;
      case 10:
        THmonth = ' ตุ.ค. '
        break;
      case 11:
        THmonth = ' พฤ.ย. '
        break;
      case 12:
        THmonth = ' ธ.ค. '
    }
    var THdate = day + THmonth + year
      rows.push([i+1, fullname, price, status, THdate]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'ใบรายการสั่งซื้อ ', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'ส่วนราชการ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 0], alignment: 'center' },
        { text: 'หน่วยงาน โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {
            widths: ['auto', 150, '*', '*', 150],
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
      res.writeHead(200,
        {
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
exports.buyform = async (req, res, next) => {
  try {

    const { id } = req.params;
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
    var total = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[0].buyprice)
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
      var price = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(list[i].price)
      fullname = list[i].fullname;
      console.log(date);
      rows.push([{ text: i + 1, alignment: 'center' }, list[i].supplie_name, { text: price, alignment: 'right' }, { text: list[i].unit, alignment: 'center' }, list[i].unit_name, ""]);
      unit = unit + list[i].unit;
    }
    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'ใบสั่งซื้อพัสดุ หจก.บุญเที่ยงอุปกรณ์ บุรีรัมย์', style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 0], alignment: 'center' },
        { text: 'หน่วยงานโรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        // { text: fullname, style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto', '*'],
            body: rows
          }
        },
        { text: 'จำนวนรวม ' + unit + ' ชิ้น   ' + 'ราคารวม(ที่คาดการณ์) ' + total + ' บาท', alignment: 'right', margin: [0, 10, 5, 0], style: 'price', fontSize: 16 },
        { text: 'ราคารวมสุทธิ...................................บาท', alignment: 'right', margin: [0, 10, 5, 0], style: 'price', fontSize: 16 },
        { text: 'ลงชื่อ......................................ผู้จัดทำ', alignment: 'right', margin: [0, 10, 5, 0], style: 'price', fontSize: 16 },
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
        fontSize: 16
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="buyform.pdf"'
        });

      const download = Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e) {

  }
};

exports.returns = async (req, res, next) => {
  try {
    const { id } = req.params;
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
      { text: 'No.', style: 'fillheader' }, { text: 'ชื่อเจ้าหน้าที่', style: 'fillheader' },
      { text: 'สถานะ', style: 'fillheader' }, { text: 'เวลาที่เสนอ', style: 'fillheader' }
    ]);
    var status = '';
    var date = '';
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
      rows.push([+list[i].id, fullname, status, date]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 80, 0, 0], alignment: 'center' },
        { text: 'รายการการคืนครุภัณฑ์', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {
            widths: ['auto', 150, '*', 150],
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
        fillheader: {
          fontSize: 18,
          bold: true,
          fillColor: '#60BF6A'
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 14
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
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

exports.returnsAll = async (req, res, next) => {
  try {
    const { id } = req.params;
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
      { text: 'No.', style: 'fillheader' }, { text: 'ชื่อเจ้าหน้าที่', style: 'fillheader' },
      { text: 'สถานะ', style: 'fillheader' }, { text: 'เวลาที่เสนอ', style: 'fillheader' }
    ]);
    var status = '';
    var date = '';
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
      rows.push([+list[i].id, fullname, status, date]);
    }


    var documentDefinition = {
      pageSize: 'A4',
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'โรงเรียนบ้านสวายจีก', style: 'header', fontSize: 20, bold: true, margin: [0, 80, 0, 0], alignment: 'center' },
        { text: 'รายการการคืนครุภัณฑ์', style: 'header', fontSize: 20, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
        {
          table: {
            widths: ['auto', 150, '*', 150],
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
        fillheader: {
          fontSize: 18,
          bold: true,
          fillColor: '#60BF6A'
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 14
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
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
exports.returnDetail = async (req, res, next) => {
  try {

    const { id } = req.params;
    const list = await sequelize.query(
      `SELECT db.id,db.du_name,db.du_status,db.du_serial,users.fullname,users.classes,rt.createdAt
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
    var length = list.length;
    var rows = [];
    var name = list[0].fullname;
    var classes = list[0].classes;
    var unit = 0;
    rows.push([
      { text: 'ลำดับที่', style: 'fillheader' }, { text: 'ชื่อครุภัณฑ์', style: 'fillheader' },
      { text: 'สภาพครุภัณฑ์', style: 'fillheader' }, { text: 'หมายเลขครุภัณฑ์', style: 'fillheader' }
    ]);
    console.log(list[0].createdAt)
    var time = (list[0].createdAt).toString()
    var year = +((list[0].createdAt).toISOString()).substring(0, 4) + 543
    var month = ((list[0].createdAt).toISOString()).substring(5, 7)
    var day = ((list[0].createdAt).toISOString()).substring(8, 10)
    console.log(time)
    var month = 5
    var THmonth
    switch (+month) {
      case 1:
        THmonth = ' มกราคม '
        break;
      case 2:
        THmonth = ' กุมภาพันธ์ '
        break;
      case 3:
        THmonth = ' มีนาคม '
        break;
      case 4:
        THmonth = ' เมษายน '
        break;
      case 5:
        THmonth = ' พฤษภาคม '
        break;
      case 6:
        THmonth = ' มิถุนายน '
        break;
      case 7:
        THmonth = ' กรกฎาคม '
        break;
      case 8:
        THmonth = ' สิงหาคม '
        break;
      case 9:
        THmonth = ' กันยายน '
        break;
      case 10:
        THmonth = ' ตุลาคม '
        break;
      case 11:
        THmonth = ' พฤศจิกายน '
        break;
      case 12:
        THmonth = ' ธันวาคม '

    }
    var THdate = 'วันที่ ' + day + THmonth + 'พ.ศ. ' + year
    console.log(THdate)

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
      header: { text: 'ระบบสารสนเทศเพื่อการจัดการพัสดุและดูแลครุภัณฑ์โรงเรียนบ้านสวายจีก', margin: [5, 0, 0, 5], alignment: 'center' },
      footer: {
        columns: [
          { text: 'พิมพ์วันที่ ' + date, alignment: 'right', margin: [0, 0, 5, 0] }
        ]
      },
      content: [
        { text: 'รายการคืนครุภัณฑ์\nโรงเรียนบ้านสวายจีก อำเภอเมือง จังหวัดบุรีรัมย์\nสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', style: 'header', fontSize: 20, bold: true, margin: [0, 20, 0, 10], alignment: 'center' },
        { text: 'วันที่ ' + THdate, style: 'header', fontSize: 16, bold: false, margin: [0, 0, 0, 10], alignment: 'center' },
        { text: 'ข้าพเจ้า '+ name + ' ครูประจำชั้น ' + classes + ' ได้คืนครุภัณฑ์ตามรายการต่อไปนี้', style: 'header', fontSize: 16, bold: false, margin: [0, 0, 0, 0] },
        {
          table: {
            widths: ['auto', 200, '*', '*'],
            body: rows
          },
          // layout: 'lightHorizontalLines'
        },
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
        fontSize: 14
      }
    };
    const pdfDoc = await pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data) => {
      res.writeHead(200,
        {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment;filename="returnDetail.pdf"'
        });

      const download = Buffer.from(data.toString('utf-8'), 'base64');
      res.end(download);
    });
  } catch (e) {

  }
};