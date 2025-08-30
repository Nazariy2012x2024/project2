const express = require('express');
const router = express.Router();

// Mock orders storage
let orders = new Map();
let orderCounter = 1;

// Create new order
router.post('/', (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod } = req.body;
    
    const order = {
      id: orderCounter++,
      userId,
      items,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.set(order.id, order);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Get user orders
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userOrders = Array.from(orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: userOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get single order
router.get('/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(parseInt(orderId));
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Update order status
router.patch('/:orderId/status', (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = orders.get(parseInt(orderId));
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    orders.set(parseInt(orderId), order);
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

module.exports = router;
