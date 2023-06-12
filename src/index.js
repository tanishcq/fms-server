const express = require("express");
const app = express();
require('dotenv');
const { forgotPassword } = require("./controllers/userController");
const port = process.env.PORT || 5000;

const { apiLimiter } = require('./middlewares');

// cors management
const cors = require("cors");
// app.options("*", cors({ 
//     origin: ["http://localhost:3000", "https://acquired-winter-369109.firebaseapp.com"], 
//     optionsSuccessStatus: 200 
// }));

// Server hardware information
const si = require('systeminformation');
si.cpu().then(data => {
    console.log("--Server Information--");
    console.log('Brand: ' + data.brand);
    console.log('Physical cores: ' + data.physicalCores);
    console.log('Speed: ' + data.speed);
}).catch(error => console.error(error));


// mongo
require('../config/db');

// routes
const {
    userRouter,
    formRouter
} = require("./routes");

app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({extended: true}));

app.use(apiLimiter);

app.use("/users", userRouter);
app.use("/forms", formRouter);

app.post("/forgot-password", forgotPassword);
// app.get("/forgot-password/:id/:token", resetPasswordFromLink);
// app.post("/forgot-password/:id/:token", verifyAndResetPassword);

app.get("/", (req, res) => {
    res.send("FMS api");
})

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})