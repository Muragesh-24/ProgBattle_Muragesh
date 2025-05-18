
import express from 'express';
const router = express.Router();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
const JWT_SECRET = 'murageshismuragesh';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'engigrow@gmail.com',
    pass: 'xnvpunbwytfebolo'
  }
});


const sendVerificationEmail = async (email, token) => {
    
console.log(token)
  const url = `http://localhost:5000/api/verify-email?token=${token}`; // Adjust this to your frontend domain
  const options = {
    from: 'engigrow@gmail.com',
    to: email,
    subject: 'Verify your email',
    html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`
  };

  await transporter.sendMail(options);
};


router.post('/pre-register', async (req, res) => {
  const { name, email, password, collegeOrCompany, interests } = req.body;

  try {
   
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = jwt.sign(
      { name, email, password: hashedPassword, collegeOrCompany, interests },
      JWT_SECRET,
      { expiresIn: '15m' } 
    );
     res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000,
    });
    await sendVerificationEmail(email, token);

    res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router; 