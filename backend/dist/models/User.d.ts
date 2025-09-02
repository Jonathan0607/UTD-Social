import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    bio?: string;
    major?: string;
    graduationYear?: number;
    interests: string[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    role: 'user' | 'admin';
    isVerified: boolean;
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    fullName: string;
    followerCount: number;
    followingCount: number;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map