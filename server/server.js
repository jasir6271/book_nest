import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const app = express();
const port = Number(process.env.PORT || 8800);
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-me';
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({ username: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, passwordHash: { type: String, required: true } }, { timestamps: true });
const bookSchema = new mongoose.Schema({ title: { type: String, required: true, trim: true }, author: { type: String, required: true, trim: true }, year: { type: Number, required: true }, genre: { type: String, default: 'Fiction' }, tone: { type: String, default: 'coral' }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

const seed = [
  ['The Design of Everyday Things','Don Norman',2013,'Design','coral'], ['The Creative Act','Rick Rubin',2023,'Creativity','lavender'], ['A Swim in a Pond in the Rain','George Saunders',2021,'Writing','mint'], ['Braiding Sweetgrass','Robin Wall Kimmerer',2013,'Nature','sage'], ['Tomorrow, and Tomorrow, and Tomorrow','Gabrielle Zevin',2022,'Fiction','yellow'], ['How to Do Nothing','Jenny Odell',2019,'Culture','blue'], ['Sea of Tranquility','Emily St. John Mandel',2022,'Fiction','coral'], ['The Overstory','Richard Powers',2018,'Nature','sage'], ['Ways of Seeing','John Berger',1972,'Design','lavender']
].map(([title, author, year, genre, tone], i) => ({ _id: `local-${i + 1}`, title, author, year, genre, tone, createdAt: new Date(Date.now() - i * 1000) }));
const localUsers = new Map();
const localBooks = [...seed];
let databaseReady = false;

const issueToken = user => jwt.sign({ id: String(user._id), username: user.username, email: user.email }, jwtSecret, { expiresIn: '1h' });
const publicUser = user => ({ id: String(user._id), username: user.username, email: user.email });
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const auth = (req, res, next) => { const header = req.headers.authorization || ''; const token = header.startsWith('Bearer ') ? header.slice(7) : null; if (!token) return res.status(401).json({ success: false, message: 'Authentication required' }); try { req.user = jwt.verify(token, jwtSecret); next(); } catch { return res.status(401).json({ success: false, message: 'Token is invalid or expired' }); } };
const bookPayload = body => ({ title: String(body.title || '').trim(), author: String(body.author || '').trim(), year: Number(body.year), genre: String(body.genre || 'Fiction'), tone: String(body.tone || 'coral') });
const validBook = data => data.title && data.author && Number.isInteger(data.year) && data.year > 0 && data.year < 2101;

app.get('/', (_req, res) => res.json({ success: true, service: 'Meridian Books API', status: 'ok', database: databaseReady ? 'mongodb' : 'memory' }));
app.get('/api/health', (_req, res) => res.json({ success: true, database: databaseReady ? 'mongodb' : 'memory' }));

app.post('/api/auth/register', async (req, res) => { const { username, name, email, password } = req.body || {}; const displayName = String(username || name || '').trim(); const normalized = String(email || '').trim().toLowerCase(); if (!displayName || !normalized || !password || String(password).length < 4) return res.status(400).json({ success: false, message: 'Username, email, and a 4+ character password are required' }); try { if (databaseReady) { if (await User.exists({ email: normalized })) return res.status(409).json({ success: false, message: 'Email is already registered' }); const user = await User.create({ username: displayName, email: normalized, passwordHash: await bcrypt.hash(password, 10) }); return res.status(201).json({ success: true, message: 'Account created successfully! Please sign in.', user: publicUser(user) }); } if (localUsers.has(normalized)) return res.status(409).json({ success: false, message: 'Email is already registered' }); const user = { _id: `local-user-${Date.now()}`, username: displayName, email: normalized, passwordHash: await bcrypt.hash(password, 10) }; localUsers.set(normalized, user); return res.status(201).json({ success: true, message: 'Account created successfully! Please sign in.', user: publicUser(user) }); } catch (error) { return res.status(500).json({ success: false, message: error.message }); } });
app.post('/api/auth/login', async (req, res) => { const normalized = String(req.body?.email || '').trim().toLowerCase(); const password = String(req.body?.password || ''); try { const user = databaseReady ? await User.findOne({ email: normalized }) : localUsers.get(normalized); if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ success: false, message: 'Email or password is incorrect' }); return res.json({ success: true, token: issueToken(user), user: publicUser(user) }); } catch (error) { return res.status(500).json({ success: false, message: error.message }); } });
app.get('/api/auth/me', auth, async (req, res) => { const user = databaseReady ? await User.findById(req.user.id) : [...localUsers.values()].find(item => String(item._id) === req.user.id); if (!user) return res.status(404).json({ success: false, message: 'User not found' }); res.json({ success: true, user: publicUser(user) }); });

app.get('/api/books', async (req, res) => { const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5)); const search = String(req.query.search || '').trim(); const safeSearch = escapeRegex(search); const filter = safeSearch ? { $or: [{ title: { $regex: safeSearch, $options: 'i' } }, { author: { $regex: safeSearch, $options: 'i' } }] } : {}; try { let items, totalItems; if (databaseReady) { [items, totalItems] = await Promise.all([Book.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), Book.countDocuments(filter)]); } else { const q = search.toLowerCase(); const matched = localBooks.filter(book => !q || `${book.title} ${book.author}`.toLowerCase().includes(q)).sort((a,b) => b.createdAt - a.createdAt); totalItems = matched.length; items = matched.slice((page - 1) * limit, page * limit); } res.json({ success: true, data: items, page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) }); } catch (error) { res.status(500).json({ success: false, message: error.message }); } });
app.post('/api/books', auth, async (req, res) => { const data = bookPayload(req.body); if (!validBook(data)) return res.status(400).json({ success: false, message: 'Title, author, and a valid publication year are required' }); try { const book = databaseReady ? await Book.create({ ...data, createdBy: req.user.id }) : { ...data, _id: `local-book-${Date.now()}`, createdAt: new Date(), createdBy: req.user.id }; if (!databaseReady) localBooks.unshift(book); res.status(201).json({ success: true, data: book }); } catch (error) { res.status(500).json({ success: false, message: error.message }); } });
app.put('/api/books/:id', auth, async (req, res) => { const data = bookPayload(req.body); if (!validBook(data)) return res.status(400).json({ success: false, message: 'Title, author, and a valid publication year are required' }); try { let book; if (databaseReady) book = await Book.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }); else { const index = localBooks.findIndex(item => String(item._id) === req.params.id); if (index >= 0) { localBooks[index] = { ...localBooks[index], ...data }; book = localBooks[index]; } } if (!book) return res.status(404).json({ success: false, message: 'Book not found' }); res.json({ success: true, data: book }); } catch (error) { res.status(500).json({ success: false, message: error.message }); } });
app.delete('/api/books/:id', auth, async (req, res) => { try { let deleted; if (databaseReady) deleted = await Book.findByIdAndDelete(req.params.id); else { const index = localBooks.findIndex(item => String(item._id) === req.params.id); if (index >= 0) deleted = localBooks.splice(index, 1)[0]; } if (!deleted) return res.status(404).json({ success: false, message: 'Book not found' }); res.json({ success: true, data: deleted }); } catch (error) { res.status(500).json({ success: false, message: error.message }); } });

if (process.env.MONGO_URL) mongoose.connect(process.env.MONGO_URL).then(async () => { databaseReady = true; console.log('MongoDB connected'); }).catch(error => console.warn(`MongoDB unavailable, using memory fallback: ${error.message}`));
app.listen(port, () => console.log(`Meridian API listening on http://localhost:${port}`));
