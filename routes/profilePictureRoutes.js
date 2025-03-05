const express = require('express');
const multer = require('multer');
const cloudinary = require('../cloudinaryConfig');
const ProfilePicture = require('../models/profilePictureSchema');

const router = express.Router();

// Multer setup for image uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload or update profile picture (POST or PUT)
router.post('/profilePicture', upload.single('image'), async (req, res) => {
  const { userId } = req.body;
  try {
    let profileUrl = null;

    // Upload the image to Cloudinary
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'profile-pictures' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });

      profileUrl = result.secure_url;
    }

    // Check if a profile picture already exists for the user
    let profilePicture = await ProfilePicture.findOne({ userId });

    if (profilePicture) {
      // Update existing profile picture
      profilePicture.image = profileUrl;
      await profilePicture.save();
    } else {
      // Create a new profile picture entry
      profilePicture = new ProfilePicture({ userId, image: profileUrl });
      await profilePicture.save();
    }

    res.status(200).json(profilePicture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch profile picture by userId (GET)
router.get('/profilePicture/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the profile picture by userId
    const profilePicture = await ProfilePicture.findOne({ userId });

    if (!profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.status(200).json(profilePicture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete profile picture by userId (DELETE)
router.delete('/profilePicture/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the profile picture by userId and delete it
    const profilePicture = await ProfilePicture.findOneAndDelete({ userId });

    if (!profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.status(200).json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
