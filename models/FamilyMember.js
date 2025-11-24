import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  relationship: {
    type: String,
    required: [true, 'Please provide a relationship'],
    trim: true,
    enum: ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'],
  },
  age: {
    type: Number,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);

export default FamilyMember;

