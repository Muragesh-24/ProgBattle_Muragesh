import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session  from 'express-session';
import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';




import jwt from 'jsonwebtoken';

import Auth from './Routes/Auth.js';
import Verify from './Routes/Verify.js';
import User from './Models/User.js';
import VerifyToken from './Routes/VerifyToken.js'
import Create from './Routes/Teams/Create.js'
import Team from './Models/Team.js';
import Compe from './Routes/Compe.js'
import authenticate from './middleware/Auth_mid.js';
import fs from 'fs'
import { exec } from 'child_process';
dotenv.config();
const app = express();
const JWT_SECRET = 'murageshismuragesh';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'https://prog-battale-frontend.vercel.app'],
  credentials: true,
}));


app.options('*', cors({
  origin: ['http://localhost:5173', 'https://prog-battale-frontend.vercel.app'],
  credentials: true,
}));


app.use(express.json());

app.use(
  session({
    secret: process.env.ADMIN_PASSWORD_HASH,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'none',
      httpOnly: true,

      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Mongo connected'))
  .catch((err) => console.error('Mongo connection error:', err));

// ////////////////////////////////////////////////////////Routes/////////////////////////////////////////////////////////////////

//route 1//////////////////////////////////////////////////////////
app.post('/Adminlogin', async (req, res) => {
  

  const { sentence, password } = req.body;

    const isSentenceValid = await bcrypt.compare(sentence, process.env.ADMIN_SECRET_HASH);
  const isPasswordValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);


  if (
   isSentenceValid && isPasswordValid
  ) {
        req.session.authenticated = true;
    res.status(200).json({ message: 'Admin login successful', status: true });
    console.log("Received request");
  } else {
        req.session.authenticated = false;
    res.status(401).json({ message: 'Invalid admin credentials', status: false });
  }
});
////////////route2/////////////////////////////////////////////////////////////////////////

////////////route 3/////////////////////////////////////////////////////////////////////////
app.use('/api', Auth);
app.use('/api',Verify)
app.use('/api',VerifyToken );
app.use('/api',Compe );
//////i dont why team is not working in router
///////////route 4/////////////////////////////////////////////////////////////////////////

app.post('/login',async (req,res)=>{

  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

   
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1d',
    });

 
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});
/////////////////////////////////////////////////////////////////////////////

app.post('/teams/create', async (req, res) => {
    console.log("recived")
  try {
    const { name, leaderEmail, memberEmails } = req.body;
    if (!name || !leaderEmail) {
      return res.status(400).json({ message: 'Team name and leaderId are required.' });
    }
 if (memberEmails && memberEmails.length > 3) {
      return res.status(400).json({ message: 'Max 3 members allowed in addition to leader.' });
    }
    console.log("recived")
    const members = await User.find({ email: { $in: memberEmails || [] } });
    const leader = await User.findOne({ email: leaderEmail });
    const leaderInTeam = await Team.findOne({ members: leader._id });
    if (leaderInTeam) {
      return res.status(400).json({ message: `${leader.name} (Leader) is already in a team.` });
    }
    for (const member of members) {
      const memberInTeam = await Team.findOne({ members: member._id });
      if (memberInTeam) {
        return res.status(400).json({ message: `${member.name} is already in a team.` });
      }
    }

    console.log("recived")
 if(!leader){
      return res.status(404).json({ message: 'Leader is invalid' });
 }


    if ((members.length || 0) !== (memberEmails ? memberEmails.length : 0)) {
      return res.status(404).json({ message: 'One or more member emails not found.' });
    }

   const team = new Team({
      name,
      leader: leader._id,
      members: members.map(m => m._id),
      points: 0,
      submissions: []
    });

    await team.save();
await User.updateMany(                                                 
      { _id: { $in: [leader._id, ...members.map(m => m._id)] } },
      { $push: { teams: team._id } }
    );

    return res.status(201).json({ message: 'Team created successfully.', team });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/teams/my-teams', authenticate, async (req, res) => {
  try {
  const userEmail =req.email
const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
const teams = await Team.find({
  $or: [
    { members: user._id },
    { leader: user._id }
  ]
}).populate('leader', 'name email')
      .populate('members', 'name email');
console.log(teams)
    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/:teamId', authenticate ,async (req, res) => {
  try {
    const fetcher=req.email
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
  const isInTeam = team.leader.email === req.email || team.members.some(m => m.email === req.email);

if (!isInTeam) {
  return res.status(403).json({ message: 'Access denied: not a team member' });
}
    res.status(200).json({ team });
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




app.post('/save-python', async (req, res) => {
  const { code, teamid } = req.body;

  if (!code || !teamid) {
    return res.status(400).json({ message: 'Missing code or teamid' });
  }

  try {
    const team = await Team.findById(teamid);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    team.submissions = {
      code,
      score: 0,
      submittedAt: new Date(),
      checkStatus: 'pending',
    };

    await team.save();

    return res.json({ message: 'Code saved successfully. You will receive evaluation result soon.' });

  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/evaluate-all', async (req, res) => {
  try {
    const pendingTeams = await Team.find({ 'submissions.checkStatus': 'pending' });
    const allteams = await Team.find();

    for (const team of pendingTeams) {
      const code = team.submissions.code;
      const teamId = team._id.toString();
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const filePath = path.join(tempDir, `usercode_${teamId}.py`);
      const enginePath = path.join(__dirname, 'engine.py');
      const bot1Path = path.join(__dirname, 'bot1.py');

     
      fs.writeFileSync(filePath, code);

    
      const command = `python "${enginePath}" --p1 "${bot1Path}" --p2 "${filePath}"`;

     
      await new Promise((resolve) => {
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error running code for team ${teamId}:`, error.message);
           
            team.submissions.checkStatus = 'done';
            await team.save().catch(e => console.error('Error updating status:', e.message));
            return resolve();
          }

          console.log(`Output for team ${teamId}:`, stdout);

          const scoreMatch = stdout.match(/Final Score: ({.*})/);

          if (scoreMatch) {
            try {
            
              const score = eval('(' + scoreMatch[1] + ')');

           team.submissions.score = score.bot2;
              team.submissions.bot1Points = score.bot1;

              if (score.bot1 > score.bot2) {
                team.submissions.winner = 'bot1';
              } else if (score.bot1 < score.bot2) {
                team.submissions.winner = 'bot2';
              } else {
                team.submissions.winner = 'draw';
              }
            } catch (parseErr) {
              console.error(`Failed to parse and save score for team ${teamId}:`, parseErr.message);
            }
          } else {
            console.warn(`Could not find final score in output for team ${teamId}`);
          }

   
          team.submissions.checkStatus = 'done';

          try {
            await team.save();
            console.log(`Updated and saved team ${teamId}`);
          } catch (saveErr) {
            console.error(`Failed to save team ${teamId}:`, saveErr.message);
          }

         
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted temp file for team ${teamId}`);
            } else {
              console.warn(`Temp file for team ${teamId} already deleted or missing`);
            }
          } catch (deleteErr) {
            console.error(`Failed to delete temp file for team ${teamId}:`, deleteErr.message);
          }

          resolve();
        });
      });
    }

    res.json({ message: 'Evaluation complete for all pending submissions.', allteams });
  } catch (err) {
    console.error('Evaluation failed:', err.message);
    res.status(500).json({ message: 'Error during evaluation' });
  }
});

// app.get('/alllteams', async (req, res) => {
//   try {
//     console.log("rec@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
//  const teams = await Team.find({});

//     console.log(teams)
//     res.json(teams);
//   } catch (err) {
//     console.error('Error fetching teams:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });








const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
