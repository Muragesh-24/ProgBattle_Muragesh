import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import Team from '../Models/Team.js';

const router = express.Router();

router.post('/evaluate-all', async (req, res) => {
  const { user_1_id, user_2_id } = req.body;

  try {

    const team1 = await Team.findById(user_1_id);
    const team2 = await Team.findById(user_2_id);
    if (!team1 || !team2) {
      return res.status(404).json({ message: 'One or both teams not found.' });
    }

   
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    
    const file1 = path.join(tempDir, `team_${team1._id}.py`);
    const file2 = path.join(tempDir, `team_${team2._id}.py`);
    fs.writeFileSync(file1, team1.submissions.code);
    fs.writeFileSync(file2, team2.submissions.code);

    
    const enginePath = path.join(process.cwd(), 'engine.py');
    const cmd = `python "${enginePath}" --p1 "${file1}" --p2 "${file2}"`;


    const stdout = await new Promise((resolve, reject) => {
      exec(cmd, (err, out, errOut) => {
        if (err) return reject(err);
        resolve(out);
      });
    });

 
const m = stdout.match(/Final Score:\s*(\{[^}]+\})/);

    if (!m) {
      throw new Error('Could not find a "Final Score" JSON in engine output');
    }
    
    let jsonStr = m[1].replace(/'/g, '"');
const scoreObj = JSON.parse(jsonStr);


    team1.submissions.score      = scoreObj.bot1;
    team2.submissions.score      = scoreObj.bot2;
    team1.submissions.bot1Points = scoreObj.bot1;
    team2.submissions.bot2Points = scoreObj.bot2;
    const winner =
      scoreObj.bot1 > scoreObj.bot2 ? user_1_id
      : scoreObj.bot1 < scoreObj.bot2 ? user_2_id
      : 'draw';
    team1.submissions.winner = winner;
    team2.submissions.winner = winner;
    team1.submissions.checkStatus =
    team2.submissions.checkStatus = 'done';

    await Promise.all([ team1.save(), team2.save() ]);

  
    [file1, file2].forEach(fp => {
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });

  
    return res.json({
      message: 'Evaluation complete.',
      results: {
        [user_1_id]: team1.submissions,
        [user_2_id]: team2.submissions,
        winner
      }
    });
  } catch (err) {
    console.error('Evaluation failed:', err);
    return res.status(500).json({ message: 'Error during evaluation', error: err.message });
  }
});

export default router;
