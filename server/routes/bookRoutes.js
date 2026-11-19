import { Router } from 'express';
import { listBooks, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { auth } from '../middleware/auth.js';
const router = Router();
router.get('/',listBooks);
router.post('/',auth,createBook);
router.put('/:id',auth,updateBook);
router.delete('/:id',auth,deleteBook);
export default router;
