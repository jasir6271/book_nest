import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { jwtSecret } from '../config.js';
const issueToken = user => jwt.sign({ id: String(user._id), username: user.username, email: user.email }, jwtSecret, { expiresIn: '1h' });
const publicUser = user => ({ id: String(user._id), username: user.username, email: user.email });
export async function register(req,res) {
 const username = String(req.body?.username || '').trim();
 const email = String(req.body?.email || '').trim().toLowerCase();
 const password = req.body?.password;
 if (!username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 4) return res.status(400).json({success:false,message:'Username, valid email, and a 4+ character password are required'});
 try {
  const user = await User.create({username,email,passwordHash:await bcrypt.hash(password,10)});
  res.status(201).json({success:true,user:publicUser(user),message:'Account created successfully! Please sign in.'});
 } catch(error) { res.status(error.code === 11000 ? 409 : 500).json({success:false,message:error.code === 11000 ? 'Email is already registered' : 'Unable to create account'}); }
}
export async function login(req,res) {
 try {
  const user = await User.findOne({email:String(req.body?.email || '').trim().toLowerCase()});
  if (!user || !await bcrypt.compare(String(req.body?.password || ''),user.passwordHash)) return res.status(401).json({success:false,message:'Email or password is incorrect'});
  res.json({success:true,token:issueToken(user),user:publicUser(user)});
 } catch { res.status(500).json({success:false,message:'Unable to sign in'}); }
}
export function me(req,res) { res.json({success:true,user:req.user}); }
