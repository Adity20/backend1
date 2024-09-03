import express, { json } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import transactionRoutes from './routes/transactionRoute.js';
import priceRoutes from './routes/priceRoute.js';
import { fetchAndStorePrice } from './controllers/priceController.js';

config();
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(json());
app.use(express.json())
export const fetchTransactions = async (req, res) => {
    const { address } = req.body;
  
    try {
      const response = await axios.get(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`
      );
  
      const transactions = response.data.result;
      await Promise.all(transactions.map(async (tx) => {
        const transaction = new Transaction({ ...tx, address });
        await transaction.save();
      }));
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Error fetching transactions' });
    }
  };
  
  // Root route
  app.post('/', fetchTransactions);
  
app.use('/api', transactionRoutes);
app.use('/api', priceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  setInterval(fetchAndStorePrice, 10 * 60 * 1000);
});
