const express = require('express');
const router = express.Router();
const { seedProducts, getProducts, getCategories, getProductById, getSimilarProducts } = require('../controllers/productController');

router.post('/seed', seedProducts);

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);

module.exports = router;