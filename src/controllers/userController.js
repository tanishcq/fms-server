const { 
    userModel,
    bugModel,
    feedbackModel
} = require("../models");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const randomstring = require("randomstring");

// const sendResetPasswordMail = async (username, email, passwordResetToken) => {
//     try {
//         const { email } = req.body;
//     } catch (err) {
//         res.status(400).json({ message: `Something went wrong! ${err}` });
//     }
// }

const signup = async (req, res) => {
    let { username, email, password } = req.body;
    if (username == "" || email == "" || password == "" || !username || !email || !password) {
        res.status(400).json({
          status: "FAILED",
          message: "Empty fields are unacceptable!",
    });
    } else if (!/^[a-zA-Z ]*$/.test(username)) {
        res.json({
          status: "FAILED",
          message: "Invalid name!",
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
          status: "FAILED",
          message: "Invalid Email!",
        });
    } else if (password.length < 6) {
        res.json({
          status: "FAILED",
          message: "Password length must be greater than or equal to 6!",
        });
    } else {
        try {
            // check for existing user
            const existingUser = await userModel.findOne({ email: email})
            if(existingUser) {
                return res.status(400).json({ message: "A user with the provided email already exists!" });
            }
            // let hashedIp;

            // console.log(`Account created from : ${ip}`);

            // hash password
            // const saltRounds = 10;
            // hashedIp = await bcrypt.hash(ip, saltRounds);
            // const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // user creation
            const result = await userModel.create({
                username,
                email,
                password: hashedPassword,
                // ipAddress: hashedIp ? hashedIp : NULL
            })
    
            // generate token
            const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
    
            // send response 
            res.status(201).json({ user: result, token });
        } catch (err) {
            return res.status(500).json({ message: `Something went wrong! ${err}` });
        }
    }
};

const signin = async (req, res) => {
    const { email } = req.body;
    if(!email) 
        return res.status(400).send({message: "Email required" });
    try {
        // check for existing user
        const existingUser = await userModel.findOne({ email: email })
        if(!existingUser) {
            if (email == "" || !email) {
                res.status(400).json({
                status: "FAILED",
                message: "Empty fields are unacceptable!",
            });
            } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                res.json({
                status: "FAILED",
                message: "Invalid Email!",
                });
            } 
            else {
                let username = email.split("@")[0];
                try {
                    // user creation
                    const result = await userModel.create({
                        username,
                        email
                    })
            
                    // generate token
                    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
            
                    // send response 
                     return res.status(201).json({ user: result, token });
                } catch (err) {
                    return res.status(500).json({ message: `Something went wrong! ${err}` });
                }
            }
            // return res.status(404).json({ message: "User doesn't exist!" });
        }

        // hash and compare passwords
        // const matchPassword = await bcrypt.compare(password, existingUser.password);
        // if(!matchPassword) {
        //     return res.status(400).json({ message: "Invalid credentials!" })
        // }

        // const matchIp = await bcrypt.compare(req.ip, existingUser.ipAddress);
        // if(!matchIp) {
        //     console.log(`User: ${existingUser.username} logged in from a different IP address`);
        // }

        // generate token
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY);
        
        // send response
        res.status(200).json({ user: existingUser, token });
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong! ${err}` });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email });
        if(existingUser) {
            const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
            oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

            // const secret = SECRET_KEY + existingUser.password;
            // const payload = {
            //     email: existingUser.email,
            //     id: existingUser.id
            // }
            // const token = jwt.sign(payload, secret, { expiresIn: '15m' });
            // const link = `http://fms-backend-production-ce11.up.railway.app/forgot-password/${existingUser.id}/${token}`;
            // const link = `http://localhost:${process.env.PORT}/forgot-password/${existingUser.id}/${token}`;
            // console.log(link);

            const temperoryPassword = randomstring.generate(7);
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(temperoryPassword, saltRounds);
            const userPassword = await userModel.findByIdAndUpdate({ _id: existingUser.id }, { password: hashedPassword }, { new: true });

            const sendMail = async () => {
                try {
                    const accessToken = await oAuth2Client.getAccessToken();

                    const transport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            type: 'OAuth2',
                            user: 'tanishcqmehta.dev@gmail.com',
                            clientId: process.env.CLIENT_ID,
                            clientSecret: process.env.CLIENT_SECRET,
                            refreshToken: process.env.REFRESH_TOKEN,
                            accessToken
                        }
                    })

                    const mailOptions = {
                        from: 'FMS Development Team <tanishcqmehta.dev@gmail.com>',
                        to: existingUser.email,
                        subject: `Reset Password for FMS account : ${existingUser.email} `,
                        text: `Your new password is provided below.. Please copy it somewhere to be able to login. You can also reset your password from the app once logged in.\n New Password: ${temperoryPassword}`,
                        html: `<h3 style="color:#330080;">Your new password is provided below.. Please copy it somewhere to be able to login. You can also reset your password from the app once logged in.</h3> <h4><span>New Password: </span> <span style="color:#ff0066;">${temperoryPassword}</span></h4>`
                    }

                    const result = await transport.sendMail(mailOptions);
                    return res.status(200).json({ message: "Please check your email for new password.", result });
                } catch(err) {
                    return res.status(400).json({ message: `Something went wrong! ${err}` });
                }
            };
            sendMail();
        } else {
            res.status(200).json({ message: "User doesn't exists!" });
        }
    } catch (err) {
        res.status(400).json({ message: `Something went wrong! ${err}` });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;

        const existingUser = await userModel.findOne({ email: req.email });
        const matchPassword = await bcrypt.compare(password, existingUser.password);
        const matchNewPassword = await bcrypt.compare(newPassword, existingUser.password);
        
        if(matchNewPassword == matchPassword == 1) {
            return res.status(400).json({ message: "New password cannot be same as current password!" });
        }

        if(matchPassword) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
            const userPassword = await userModel.findByIdAndUpdate({ _id: req.userId }, { password: hashedPassword }, { new: true });
            return res.status(200).json({ message: "Password changed successfully!", password: userPassword });
        } else {
            return res.status(400).json({ message: "Current password doesn't match!" });
        }
    } catch (err) {
        res.status(400).json({ message: `Something went wrong! ${err}` });
    }
};

const resetPasswordFromLink = async (req, res, next) => {
    const { id, token } = req.params;
    const existingUser = await userModel.findById({ _id: id });
    if(!existingUser) {
        return res.status(400).json({ message: "Couldn't reset password, Not Found!" });
    }

    const secret = SECRET_KEY + existingUser.password;
    try {
        const payload = jwt.verify(token, secret); 
        res.render("reset-password", { email: existingUser.email });
    } catch (err) {
        res.status(400).json({ message: `Something went wrong! ${err}` });
    }
};

const verifyAndResetPassword = async (req, res, next) => {
    const { id, token } = req.params;
    const existingUser = await userModel.findById({ _id: id });
    if(!existingUser) {
        return res.status(400).json({ message: "Couldn't reset password, Not Found!" });
    }

    const secret = SECRET_KEY + existingUser.password;
    try {
        const payload = jwt.verify(token, secret); 
        // res.render("reset-password", { email: existingUser.email });

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const userPassword = await userModel.findByIdAndUpdate({ _id: req.userId }, { password: hashedPassword }, { new: true });
        return res.status(200).json({ message: "Password reset was successful!" , userPassword });
    } catch (err) {
        res.status(400).json({ message: `Something went wrong! ${err}` });
    }
};

const reportBugs = async (req, res) => {
    try {
        const { description } = req.body;
        const email = req.email;

        const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        const result = await bugModel.create({
            userId: req.userId,
            email,
            description
        })

        const sendMail = async () => {
            try {
                const accessToken = await oAuth2Client.getAccessToken();

                const transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: 'tanishcqmehta.dev@gmail.com',
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        refreshToken: process.env.REFRESH_TOKEN,
                        accessToken
                    }
                })

                const emailIds = ["msifmsys@gmail.com", "tanishcqmehta.dev@gmail.com"];
                
                const mailOptions = {
                    from: 'FMS Development Team <tanishcqmehta.dev@gmail.com>',
                    to: emailIds,
                    subject: `New Bug Reported`,
                    text: `Bug Information: ${req.body.description}`,
                    html: `<h3 style="color:#330080;">Bug Information:</h3><h4><span style="color:#ff0066;">${req.body.description}</span></h4>`
                }

                const result = await transport.sendMail(mailOptions);
                // send response 
                return res.status(201).json({ bug: result });
            } catch(err) {
                return res.status(400).json({ message: `Something went wrong! ${err}` });
            }
        };
        sendMail();
    } catch (err) {
        res.status(400).json({ message: `Something went wrong! ${err}` });
    }
};

const createFeedback = async (req, res) => {
    try {
        const { email, description } = req.body;

        const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        const result = await feedbackModel.create({
            email,
            description
        });

        const sendMail = async () => {
            try {
                const accessToken = await oAuth2Client.getAccessToken();

                const transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: 'tanishcqmehta.dev@gmail.com',
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        refreshToken: process.env.REFRESH_TOKEN,
                        accessToken
                    }
                })

                const emailIds = ["msifmsys@gmail.com", "tanishcqmehta.dev@gmail.com"];
                
                const mailOptions = {
                    from: 'FMS Development Team <tanishcqmehta.dev@gmail.com>',
                    to: emailIds,
                    subject: `New Feedback Recieved`,
                    text: `Feedback: ${req.body.description}`,
                    html: `<h3 style="color:#330080;">Feedback:</h3><h4><span style="color:#ff0066;">${req.body.description}</span></h4>`
                }

                const result = await transport.sendMail(mailOptions);
                // send response 
                return res.status(201).json({ bug: result });
            } catch(err) {
                return res.status(400).json({ message: `Something went wrong! ${err}` });
            }
        };
        sendMail();
        res.status(200).json({ feedback: result });

    } catch (err) {
        res.status(400).json({ message: `Something went wrong! ${err}` });
    }
};

module.exports = { 
    signin, 
    signup, 
    forgotPassword, 
    reportBugs, 
    resetPassword, 
    verifyAndResetPassword, 
    resetPasswordFromLink, 
    createFeedback 
};