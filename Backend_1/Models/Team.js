import mongoose from "mongoose";
// import Gamedata from "./Gamedata";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  points: { type: Number, default: 0 },
 submissions: {
  code: String,
  winner:String,
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  checkStatus: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending'
  }
}

  
});

const Team = mongoose.model('Team', teamSchema);

export default Team
