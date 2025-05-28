const express = require('express');
const { Item, User } = require('../models'); // Assuming models/index.js exports Item and User
const authMiddleware = require('../middleware/authMiddleware'); // Assuming this path is correct
const router = express.Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

// GET /api/items - Retrieve all items for the logged-in user
router.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { UserId: req.user.id }, // req.user.id comes from authMiddleware
      include: [{ model: User, attributes: ['id', 'username'] }] // Optional: include user info
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
});

// POST /api/items - Create a new item associated with the logged-in user
router.post('/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    const newItem = await Item.create({
      name,
      description,
      UserId: req.user.id, // Associate with the logged-in user
    });
    res.status(201).json({ message: 'Item created successfully', item: newItem });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Error creating item', error: error.message });
  }
});

// GET /api/items/:id - Retrieve a single item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const item = await Item.findOne({
      where: { id: itemId, UserId: req.user.id }, // Ensure item belongs to the logged-in user
      include: [{ model: User, attributes: ['id', 'username'] }] // Optional
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or access denied' });
    }
    res.json(item);
  } catch (error) P
    console.error('Error fetching item by ID:', error);
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
});

// PUT /api/items/:id - Update an item by ID
router.put('/items/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    const item = await Item.findOne({
      where: { id: itemId, UserId: req.user.id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or access denied' });
    }

    // Update the item
    item.name = name || item.name; // Update name if provided, else keep old name
    item.description = description === undefined ? item.description : description; // Allow clearing description

    await item.save();
    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
});

// DELETE /api/items/:id - Delete an item by ID
router.delete('/items/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const item = await Item.findOne({
      where: { id: itemId, UserId: req.user.id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or access denied' });
    }

    await item.destroy();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
});

module.exports = router;
