module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    if (token !== process.env.PASSCODE) {
        return res.status(401).json({
            error: true,
            errorType: 'token',
            errorMessage: 'Invalid token found in authorization header.',
        });
    }
    next();
};
