import mongoose from 'mongoose';
import { Book } from '../models/index.js';
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bookPayload = body => ({ title: String(body.title || '').trim(), author: String(body.author || '').trim(), year: Number(body.year), genre: String(body.genre || 'Fiction'), tone: String(body.tone || 'coral') });
const validBook = data => data.title && data.author && Number.isInteger(data.year) && data.year > 0 && data.year < 2101;
export async function listBooks(req,res) {
 const page = Math.max(1,Math.floor(Number(req.query.page) || 1));
 const limit = Math.min(50,Math.max(1,Math.floor(Number(req.query.limit) || 5)));
 const search = escapeRegex(String(req.query.search || '').trim());
 const filter = search ? {$or:[{title:{$regex:search,$options:'i'}},{author:{$regex:search,$options:'i'}}]} : {};
 try {
  const [data,totalItems] = await Promise.all([Book.find(filter).sort({createdAt:-1,_id:-1}).skip((page-1)*limit).limit(limit),Book.countDocuments(filter)]);
  res.json({success:true,data,page,limit,totalItems,totalPages:Math.max(1,Math.ceil(totalItems/limit))});
 } catch { res.status(500).json({success:false,message:'Unable to retrieve books'}); }
}
export async function createBook(req,res) {
 const data = bookPayload(req.body || {});
 if (!validBook(data)) return res.status(400).json({success:false,message:'Title, author, and a valid publication year are required'});
 try { res.status(201).json({success:true,data:await Book.create({...data,createdBy:req.user.id})}); }
 catch { res.status(500).json({success:false,message:'Unable to create book'}); }
}
export async function updateBook(req,res) {
 const data = bookPayload(req.body || {});
 if (!validBook(data) || !mongoose.isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Valid book details and ID are required'});
 try { const book = await Book.findByIdAndUpdate(req.params.id,data,{new:true,runValidators:true});
 if (!book) return res.status(404).json({success:false,message:'Book not found'});
 res.json({success:true,data:book}); } catch { res.status(500).json({success:false,message:'Unable to update book'}); }
}
export async function deleteBook(req,res) {
 if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Invalid book ID'});
 try { const book = await Book.findByIdAndDelete(req.params.id);
 if (!book) return res.status(404).json({success:false,message:'Book not found'});
 res.json({success:true,data:book}); } catch { res.status(500).json({success:false,message:'Unable to delete book'}); }
}
