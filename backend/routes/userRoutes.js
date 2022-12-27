const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

// router.use(verifyJWT);
router
    .route('/')
    .get(verifyJWT, userController.getAllUser)
    .post(userController.createNewUser)
    .patch(verifyJWT, userController.updateUser)
    .delete(verifyJWT, userController.deleteUser);

module.exports = router;
