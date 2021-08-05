const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEND_GRID_KEY)

const sendPdfEmail = (buff , email) =>{
    console.log("email.js working")
sgMail.send({
    to : email,
    from: 'amankale@rapidinnovation.dev',
    subject:'Invoice',
    attachments:[{
       filename:'invoice.pdf',
        content:buff,
        type:'application/pdf',
        disposition:'attachment',
    }],
})
}

module.exports = sendPdfEmail
