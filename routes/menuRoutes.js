const express = require('express');
const router = express.Router();
const Menu = require('../models/menuSchema');
const cloudinary = require('../cloudinaryConfig');
const multer = require('multer')
// Get all menu items

// Multer setup for in-memory storage (since we're uploading directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get('/menu', async (req, res) => {
    try {
        const menu = await Menu.find();
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  
// Get a single menu item
router.get('/menu/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const menuItem = await Menu.findById(id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
// POST: Create Menu Item with Cloudinary Image Upload
router.post('/menu', upload.single('image'), async (req, res) => {
    const { itemName, category, price, available } = req.body;
    try {
      let imageUrl = null;
  
      if (req.file) {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
          { folder: 'menu-items' }, // Optional: Specify a folder in Cloudinary
          (error, result) => {
            if (error) {
              throw new Error(error.message);
            }
            return result;
          }
        ).end(req.file.buffer); // Upload the file from the buffer
  
        imageUrl = result.secure_url; // Get the image URL from Cloudinary
      }
  
      // Create a new menu item with the image URL
      const newItem = new Menu({ itemName, category, price, available, image: imageUrl });
      await newItem.save();
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


// Update Menu Item (PUT)
router.patch('/menu/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { itemName, category, price, available } = req.body;
  
    try {
      let image = req.body.image; // Keep the existing image by default
  
      // If a new image is uploaded, upload it to Cloudinary and use the new URL
      if (req.file) {
        const result = await cloudinary.uploader.upload_stream(
          { folder: 'menu-items' },
          (error, result) => {
            if (error) {
              throw new Error(error.message);
            }
            return result;
          }
        ).end(req.file.buffer); // Upload the file from the buffer
  
        image = result.secure_url; // Get the new image URL from Cloudinary
      }
  
      // Update the menu item
      const updatedItem = await Menu.findByIdAndUpdate(
        id,
        { itemName, category, price, available, image },
        { new: true }
      );
  
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
// Delete menu item (DELETE)
router.delete('/menu/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedItem = await Menu.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
module.exports = router;