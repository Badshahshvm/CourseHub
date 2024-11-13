const express = require("express");
const { register, login, getProfile, logout, updateUser } = require("../controllers/user");
const checkAuth = require("../middleware/checkAuth");


const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.get("/me", checkAuth, getProfile)
router.get("/logout", logout);
router.put("/update/:userId", checkAuth, updateUser)
module.exports = router;