import express from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = 'murageshismuragesh';
const router = express.Router();

router.get('/verify-token', (req, res) => {
    console.log("recived")
  const token = req.cookies.token;
    console.log(token)
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
       console.log("@@@@@")
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded)
    console.log("@@@@@")
    return res.status(200).json({ message: 'Token valid', user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
