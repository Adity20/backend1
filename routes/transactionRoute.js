import { Router } from 'express';
import { fetchTransactions, getExpenses } from '../controllers/transactionController.js';

const router = Router();

router.post('/transactions', fetchTransactions);
router.get('/expenses/:address', getExpenses);

export default router;
