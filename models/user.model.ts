import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    methods: {
      // Method to compare password
      async matchPassword(enteredPassword: string) {
        return await bcrypt.compare(enteredPassword, this.password);
      },
    },
  },
);

// Hash user password before saving
userSchema.pre('save', async function (next: mongoose.SaveOptions) {
  if (!this.isModified('password')) {
    return next;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model('User', userSchema);
