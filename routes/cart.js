const express = require('express');
const router = express.Router();

// In-memory cart storage (in production, use Redis or database)
let carts = new Map();

// Get cart by user ID
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const cart = carts.get(userId) || { items: [], total: 0 };
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
});

// Add item to cart
router.post('/:userId/items', (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body;
    
    if (!carts.has(userId)) {
      carts.set(userId, { items: [], total: 0 });
    }
    
    const cart = carts.get(userId);
    const existingItem = cart.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    // Calculate total (in production, fetch product prices from database)
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    carts.set(userId, cart);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
});

// Update cart item quantity
router.put('/:userId/items/:productId', (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    
    if (!carts.has(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const cart = carts.get(userId);
    const item = cart.items.find(item => item.productId === productId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.productId !== productId);
    } else {
      item.quantity = quantity;
    }
    
    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    carts.set(userId, cart);
    
    res.json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/:userId/items/:productId', (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    if (!carts.has(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const cart = carts.get(userId);
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    carts.set(userId, cart);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
});

// Clear cart
router.delete('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (carts.has(userId)) {
      carts.delete(userId);
    }
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
});

module.exports = router;
