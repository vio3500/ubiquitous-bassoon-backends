const jwt = require('jsonwebtoken');

const jwtConfig = {
    secretKey: '?',
    algorithm: 'HS256',
    expiresIn: '24h'
};

const setToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secretKey, {
        expiresIn: jwtConfig.expiresIn,
        algorithm: jwtConfig.algorithm
    });
}

const decodeJwt = (req, res, next) => {
    const [authType, token] = req.headers.authorization?.split(' ') || [];
    const payload = (authType === 'Bearer')
    ? jwt.verify(token, jwtConfig.secretKey)
        : undefined;
    if (!payload){
        return res.send('Error')
    }
    res.locals.teacherId = payload.id;
    next()
}

const tokenAuth = (req, res, next) => {
    const token = decodeJwt(req);
    if (!token) {
        res.status(401).send('Unauthorized');
    } else {
        res.locals.token = token.id;
        next();
    }
}

module.exports = {
    setToken,
    tokenAuth,
    decodeJwt
};