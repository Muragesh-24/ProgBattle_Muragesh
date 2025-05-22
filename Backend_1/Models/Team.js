import mongoose from "mongoose";
// import Gamedata from "./Gamedata";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  game_log: {
    type: [
      {
        step: Number,
        ball_x: Number,
        ball_y: Number,
        paddle1_x: Number,
        paddle2_x: Number,
        bot1_action: String,
        bot2_action: String,
        score_bot1: Number,
        score_bot2: Number
      }
    ],
    default: () => ["waiting"] 
  },
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
