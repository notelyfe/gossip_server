const nodemailer = require('nodemailer')

const main = async () => {

    try {

        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,

            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        let info = await transporter.sendMail({
            from: 'admin@notelyfe.tech',
            to: 'notelyfe@gmail.com',
            subject: 'Hello',
            text: 'Hello from gossip server',
            html: "<b>Hello World</b>"
        });

        console.log("Message send: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.log("error", error)
    }
}

module.exports = { main }