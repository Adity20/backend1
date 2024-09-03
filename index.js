import express, { json } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import transactionRoutes from './routes/transactionRoute.js';
import priceRoutes from './routes/priceRoute.js';
import { fetchAndStorePrice } from './controllers/priceController.js';
import { fetchTransactions } from './controllers/transactionController.js';

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
app.post('/', fetchTransactions);
  
app.use('/api', transactionRoutes);
app.use('/api', priceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  setInterval(fetchAndStorePrice, 10 * 60 * 1000);
});
