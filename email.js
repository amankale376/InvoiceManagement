require('dotenv').config({path:"./config/.env"})
const pdf = require('html-pdf')
const options = {format:'A4'}
var fs = require('fs')
const sgMail = require('@sendgrid/mail')
const flags = require('./config/flag_responses')
sgMail.setApiKey(process.env.SEND_GRID_KEY)



const pdfGenerate = (res, invoice) =>{
    res.render('invoice',{data:invoice}, function (err , html){
        pdf.create(html, options).toFile('./pdf/'+invoice.invoiceId+'.pdf', function(err , result){
            if(err){
                return console.log(err)
            }
            else
            {
                var datafile = fs.readFileSync('./pdf/'+invoice.invoiceId+'.pdf')
              
            }
        })
    })
}

const sendMailPdf = (res, invoice) =>{

    pdfGenerate(res , invoice)

    pathToAttachment = './pdf/'+invoice.invoiceId+'.pdf'
    attachment = fs.readFileSync(pathToAttachment).toString("base64")

    const msg = {
        to: invoice.email,
        from: process.env.SUPER_ADMIN_EMAIL,
        subject: 'Invoice',
        text: 'Your invoice is as follows',
        attachments: [
          {
            content: attachment,
            filename: "invoice.pdf",
            type: "application/pdf",
            disposition: "attachment"
          }
        ]
      }

      sgMail.send(msg)
      .then(()=>{
          res.send({message:'The email has sent succesfully.'})
    }).catch(err => {
       flags(err, undefined , req , res)
      })

}

module.exports = { pdfGenerate , sendMailPdf }