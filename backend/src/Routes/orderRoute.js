const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

// Create order (COD)
router.post('/', orderController.createOrder);

// Admin: Get all orders
router.get('/', orderController.getAllOrders);

router.patch('/:id', orderController.updateOrderStatus);

module.exports = router;

// Admin: Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
