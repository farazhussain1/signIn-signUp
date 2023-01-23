import { Mongoose, Schema, model } from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

export const USER = model("User", UserSchema);
