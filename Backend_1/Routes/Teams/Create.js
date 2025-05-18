import express from 'express';
import User from '../../Models/User.js';   
import Team from '../../Models/Team.js';

const router = express.Router();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/teams/create', async (req, res) => {
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
await User.updateMany(                                                 //////////syntax to update more than one object at once
      { _id: { $in: [leader._id, ...members.map(m => m._id)] } },
      { $push: { teams: team._id } }
    );

    return res.status(201).json({ message: 'Team created successfully.', team });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
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
