"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const postSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: [2000, 'Post content cannot exceed 2000 characters']
    },
    media: [{
            type: String,
            validate: {
                validator: function (v) {
                    return /^https?:\/\/.+/.test(v);
                },
                message: 'Media must be a valid URL'
            }
        }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            validate: {
                validator: function (v) {
                    return v.length === 2 &&
                        v[0] >= -180 && v[0] <= 180 &&
                        v[1] >= -90 && v[1] <= 90;
                },
                message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
            }
        },
        address: String,
        placeName: String
    },
    tags: [{
            type: String,
            trim: true,
            maxlength: [20, 'Tag cannot exceed 20 characters']
        }],
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Comment'
        }],
    shares: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    isPublic: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['general', 'academic', 'social', 'event', 'question'],
        default: 'general'
    },
    expiresAt: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v > new Date();
            },
            message: 'Expiration date must be in the future'
        }
    }
}, {
    timestamps: true
});
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ location: '2dsphere' });
postSchema.index({ tags: 1 });
postSchema.index({ category: 1 });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});
postSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});
postSchema.virtual('shareCount').get(function () {
    return this.shares.length;
});
postSchema.set('toJSON', {
    virtuals: true
});
exports.Post = mongoose_1.default.model('Post', postSchema);
//# sourceMappingURL=Post.js.map