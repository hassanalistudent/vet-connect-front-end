// routes/videoRoutes.js - ✅ FIXED
import express from 'express';
import generateToken from "../utils/agoraToken.js";

const router = express.Router();

router.get('/token', async (req, res) => {
  try {
    const { channelName, uid } = req.query;
    
    if (!channelName || !uid) {
      return res.status(400).json({ error: 'channelName and uid are required' });
    }

    const token = generateToken(channelName, uid);
    res.json({ 
      token,
      uid: parseInt(uid), // ✅ Ensure uid is number
      channelName 
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Token generation failed' });
  }
});

export default router;
