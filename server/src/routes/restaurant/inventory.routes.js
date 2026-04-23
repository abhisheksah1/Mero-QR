// src/routes/restaurant/inventory.routes.js
const router = require('express').Router()
const Inventory = require('../../models/Inventory.model')
const verifyToken = require('../../middleware/verifyToken')
const requireRole = require('../../middleware/requireRole')
const requireKYC = require('../../middleware/requireKYC')
const requireActivePackage = require('../../middleware/requireActivePackage')
const { success, error } = require('../../utils/apiResponse')

router.use(verifyToken, requireRole('restaurant'), requireKYC, requireActivePackage)

// Get all inventory
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find({ restaurant: req.user.restaurantId })
    return success(res, items)
  } catch (err) { return error(res, err.message, 500) }
})

// Add item
router.post('/', async (req, res) => {
  try {
    const item = await Inventory.create({ ...req.body, restaurant: req.user.restaurantId })
    return success(res, item, 'Inventory item added', 201)
  } catch (err) { return error(res, err.message, 500) }
})

// Update quantity
router.patch('/:id', async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.user.restaurantId },
      req.body, { new: true }
    )
    if (!item) return error(res, 'Not found', 404)
    return success(res, item)
  } catch (err) { return error(res, err.message, 500) }
})

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    await Inventory.findOneAndDelete({ _id: req.params.id, restaurant: req.user.restaurantId })
    return success(res, null, 'Deleted')
  } catch (err) { return error(res, err.message, 500) }
})

module.exports = router
