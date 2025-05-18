const mongoose = require('mongoose');

const GameDataSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  ball_x: { type: Number, required: true },
  ball_y: { type: Number, required: true },
  paddle1_x: { type: Number, required: true },
  paddle2_x: { type: Number, required: true },
  bot1_action: { type: String, enum: ['left', 'right', 'stay'], required: true },
  bot2_action: { type: String, enum: ['left', 'right', 'stay'], required: true },
  score_bot1: { type: Number, required: true },
  score_bot2: { type: Number, required: true }
});

Gamedata = mongoose.model('GameData', GameDataSchema);

export default Gamedata
