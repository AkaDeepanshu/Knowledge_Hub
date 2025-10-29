const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser } = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All user routes require authentication and admin role
router.get('/', authenticate, isAdmin, getAllUsers);
router.get('/:id', authenticate, isAdmin, getUserById);
router.delete('/:id', authenticate, isAdmin, deleteUser);

module.exports = router;
