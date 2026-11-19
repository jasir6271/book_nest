import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({ username: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, passwordHash: { type: String, required: true } }, { timestamps: true });
const bookSchema = new mongoose.Schema({ title: { type: String, required: true, trim: true }, author: { type: String, required: true, trim: true }, year: { type: Number, required: true }, genre: { type: String, default: 'Fiction' }, tone: { type: String, default: 'coral' }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

