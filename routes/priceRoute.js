import { Router } from 'express';
import { fetchAndStorePrice } from '../controllers/priceController.js';

const router = Router();

router.get('/fetch-price', async (req, res) => {
  await fetchAndStorePrice();
  res.send('Price fetched and stored');
});

export default router;
