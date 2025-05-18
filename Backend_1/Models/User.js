import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  collegeOrCompany: {
    type: String,
    required: true,
    trim: true
  },
  interests: {
    type: [String], // an array of interests
    default: []
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'  // Reference to the Team model
    }
  ]
}, { timestamps: true });


const User = mongoose.model('User', userSchema);


export default User;