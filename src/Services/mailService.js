const nodemailer = require('nodemailer')

const senderEmail = process.env.SENDER_EMAIL
const smtpUserName = process.env.SMTP_USER_NAME
const smtpPassword = process.env.SMTP_PASSWORD
const smtpPort = process.env.SMTP_PORT
const smtpHost = process.env.SMTP_HOST
const serverBaseUrl = process.env.SERVER_BASE_URL
const clientBaseUrl = process.env.CLIENT_BASE_URL

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secureConnection: false,
    auth: {
        user: smtpUserName,
        pass: smtpPassword
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

const verificationMail = async (receiver, verificationToken) => {

    try {

        await transporter.sendMail({
            from: senderEmail,
            to: receiver,
            subject: "Email Verification",
            html: `<p> Thankyou for registration. Please click on the <a href="${serverBaseUrl}/api/user/verify?verificationToken=${verificationToken}">Verify Email</a> link to continue</p>
            <br />
            <h5>Important: without verification you cannot login to your account</h5>
            <br />
            <p style="color: red;">Note - This link is only valid for 24 hours </p>`
        })

    } catch (error) {
        console.log("error", error)
    }
}

const passwordResetVerification = async (receiver, verificationToken) => {

    try {

        await transporter.sendMail({
            from: senderEmail,
            to: receiver,
            subject: "Password Reset",
            html: `<p> Please click on the <a href="${clientBaseUrl}/reset-password?verificationToken=${verificationToken}">Verify Email</a> link to continue</p>
            <br />
            <p style="color: red;">Note - This link is only valid for 10 minutes </p>`
        })

    } catch (error) {
        console.log("error", error)
    }

}

module.exports = {
    verificationMail,
    passwordResetVerification
}
