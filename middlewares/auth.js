const bcrypt = require('bcryptjs');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    const hash = process.env.PASSCODE;
    const isAuth = bcrypt.compareSync(token, hash);
    if (!isAuth) {
        return res.status(401).json({
            error: true,
            errorType: 'token',
            errorMessage: 'Invalid token found in authorization header.',
        });
    }
    next();
};
