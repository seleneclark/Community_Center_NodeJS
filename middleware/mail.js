module.exports = (req, res, next) => {
    const api_key = process.env.API_KEY;
    const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        username: api_key,
        password: process.env.API_KEY
    }
    }));

    next();
};