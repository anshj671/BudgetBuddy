import mongoose, { Document, Model } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

interface IUserModel extends Model<IUser> {
  // Add any static methods here if needed
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a unique index on email
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model<IUser, IUserModel>('User', userSchema); 