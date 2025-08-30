const express = require('express');
const router = express.Router();

// Sample products data
const products = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    image: '/images/headphones.jpg',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    features: ['Noise Cancellation', 'Bluetooth 5.0', '40h Battery Life']
  },
  {
    id: 2,
    name: 'Smart Fitness Watch',
    price: 199.99,
    description: 'Advanced fitness tracking with heart rate monitoring',
    category: 'Electronics',
    image: '/images/watch.jpg',
    rating: 4.6,
    reviews: 89,
    inStock: true,
    features: ['Heart Rate Monitor', 'GPS', 'Water Resistant']
  },
  {
    id: 3,
    name: 'Designer Leather Jacket',
    price: 399.99,
    description: 'Premium leather jacket with modern design',
    category: 'Fashion',
    image: '/images/jacket.jpg',
    rating: 4.9,
    reviews: 234,
    inStock: true,
    features: ['Genuine Leather', 'Multiple Colors', 'Slim Fit']
  }
];

// Get all products
router.get('/', (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    
    let filteredProducts = [...products];
    
    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Search functionality
    if (search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sorting
    if (sort === 'price-low') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filteredProducts.sort((a, b) => b.rating - a.rating);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredProducts.length / limit),
          totalProducts: filteredProducts.length,
          hasNext: endIndex < filteredProducts.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Get products by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const categoryProducts = products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
    
    res.json({
      success: true,
      data: categoryProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category products',
      error: error.message
    });
  }
});

module.exports = router;
