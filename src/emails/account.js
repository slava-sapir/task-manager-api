const sgMail = require('@sendgrid/mail')

//const sendgridAPIKey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
    to: email,
    from: 'slavas21@gmail.com',
    subject: 'Thank you for joining us!',
    text: `Welcome to the app ${name}. Let me know how you get along with the app.`

 }) 
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
    to: email,
    from: 'slavas21@gmail.com',
    subject: 'Confirmation of account cancelation!',
    text: `Sorry about your cancelation, ${name}. Let me know what can be done to catch your aboard!.`

 }) 
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}