const jwt = require("jsonwebtoken");
require('dotenv');
const SECRET_KEY = process.env.SECRET_KEY;

const auth = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if(token) {
            token = token.split(" ")[1];
            let user = jwt.verify(token, SECRET_KEY);
            req.userId = user.id;
            req.email = user.email;
        } else {
            return res.status(401).json({ message: "Unauthorized user!" });
        }

        // moving on
        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized user!" });
    }
}

module.exports = auth;