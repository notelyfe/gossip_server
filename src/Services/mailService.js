const nodemailer = require('nodemailer')

const senderEmail = process.env.SENDER_EMAIL
const smtpUserName = process.env.SMTP_USER_NAME
const smtpPassword = process.env.SMTP_PASSWORD
const smtpPort = process.env.SMTP_PORT
const smtpHost = process.env.SMTP_HOST

const verificationMail = async (receiver) => {

    try {

        let transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: true,

            auth: {
                user: smtpUserName,
                pass: smtpPassword
            },
        });

        let mail = await transporter.sendMail({
            from: senderEmail,
            to: receiver,
            subject: "Email Verification",
            text: "Thank You For joining with us"
        })

    } catch (error) {
        console.log("error", error)
    }
}

module.exports = {
    verificationMail
}
