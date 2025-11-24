import mongoose, { Document, Schema } from 'mongoose';

export interface IFamilyMember extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other';
  age?: number;
  createdAt: Date;
}

const familyMemberSchema = new Schema<IFamilyMember>({
  userId: {
    type: Schema.Types.ObjectId,
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

const FamilyMember = mongoose.model<IFamilyMember>('FamilyMember', familyMemberSchema);

export default FamilyMember;
