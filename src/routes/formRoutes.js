const express = require("express");
const { 
    saveForm, 
    deleteForm, 
    getAllForms 
} = require("../controllers");
const formRouter = express.Router();
const { auth } = require("../middlewares");

formRouter.post("/", auth, saveForm);
formRouter.get("/", auth, getAllForms);
formRouter.delete("/:id", auth, deleteForm);

module.exports = formRouter;