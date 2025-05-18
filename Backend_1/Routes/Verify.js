import User from '../Models/User.js'
import express from 'express';
import Team from '../Models/Team.js';
import jwt from 'jsonwebtoken'
const JWT_SECRET = 'murageshismuragesh';
const router = express.Router();
router.get('/verify-email', async (req, res) => {
  const token = req.query.token;

  if (!token) return res.status(400).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({
      name: decoded.name,
      email: decoded.email,
      password: decoded.password,
      collegeOrCompany: decoded.collegeOrCompany,
      interests: decoded.interests
    });

    await newUser.save();

    res.status(200).json({ message: 'Email verified and user registered!' });
  } catch (err) {
    console.error(err);
    console.log(err)
    console.log(token)
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

router.get('/alllteams', async (req, res) => {
  try {
    console.log("rec@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
 const teams = await Team.find({});

    console.log(teams)
    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router; 