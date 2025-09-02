import mongoose, { Document } from 'mongoose';
export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    content: string;
    media?: string[];
    location?: {
        type: 'Point';
        coordinates: [number, number];
        address?: string;
        placeName?: string;
    };
    tags: string[];
    likes: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];
    shares: mongoose.Types.ObjectId[];
    isPublic: boolean;
    category: 'general' | 'academic' | 'social' | 'event' | 'question';
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Post: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, {}> & IPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Post.d.ts.map