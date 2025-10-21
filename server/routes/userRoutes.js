const express = require('express')
const {register,verifyOtp,resendOTP,userLogin,logoutUser,dashboard} = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/register',register);
router.post('/verifyotp',verifyOtp);
router.post('/resendotp',resendOTP);
router.post('/login',userLogin);
router.post('/logout',logoutUser);
router.get('/dashboard',authMiddleware,dashboard)

module.exports = router;