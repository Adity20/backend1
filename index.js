const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sharmaatul9164:adityasharma@cluster0.z1xzg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1); // Exit process with failure if MongoDB connection fails
  });

// Define schemas and models
const transactionSchema = new mongoose.Schema({
  blockNumber: String,
  timeStamp: String,
  hash: String,
  from: String,
  to: String,
  value: String,
  gas: String,
  gasPrice: String,
  isError: String,
  txreceipt_status: String,
  input: String,
  contractAddress: String,
  cumulativeGasUsed: String,
  gasUsed: String,
  confirmations: String,
  address: String,
});

const ethPriceSchema = new mongoose.Schema({
  price: Number,
  timestamp: { type: Date, default: Date.now }
});
const corsOptions = {
  origin: 'https://a71688.netlify.app', 
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
const Transaction = mongoose.model('Transaction', transactionSchema);
const EthPrice = mongoose.model('EthPrice', ethPriceSchema);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/api/transactions', async (req, res) => {
  const { address } = req.body;
  const apiKey = 'UVWAWSVFKUXIWT8PA8M611583IEAH9NNSD';

  try {
    // Fetch transactions from Etherscan
    const response = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`);
    const transactions = response.data.result;

    // Log the transactions to verify data
    console.log('Fetched transactions:', transactions);

    // Save transactions to database
    for (const tx of transactions) {
      const newTransaction = new Transaction({ ...tx, address });
      await newTransaction.save();
    }

    res.status(200).json({ message: 'Transactions fetched and saved successfully', transactions });
  } catch (error) {
    console.error('Error in /api/transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

cron.schedule('*/10 * * * *', async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
    const ethPrice = response.data.ethereum.inr;

    // Log the Ethereum price to verify data
    console.log('Fetched Ethereum price:', ethPrice);

    // Save price to database
    const newPrice = new EthPrice({ price: ethPrice });
    await newPrice.save();

    console.log('Ethereum price saved:', ethPrice);
  } catch (error) {
    console.error('Error fetching Ethereum price:', error.message);
  }
});

app.get('/api/expenses', async (req, res) => {
  const { address } = req.query;

  try {
    const transactions = await Transaction.find({ address });
    if (!transactions.length) {
      return res.status(404).json({ message: 'No transactions found for this address' });
    }

    const totalExpenses = transactions.reduce((acc, tx) => {
      if (!tx.gasUsed || !tx.gasPrice) {
        console.warn('Missing gasUsed or gasPrice in transaction:', tx);
        return acc;
      }
      return acc + (parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)) / 1e18;
    }, 0);

    const latestPrice = await EthPrice.findOne().sort({ timestamp: -1 });
    if (!latestPrice) {
      return res.status(404).json({ message: 'Ethereum price not found' });
    }

    res.status(200).json({ totalExpenses, currentEthPrice: latestPrice.price });
  } catch (error) {
    console.error('Error in /api/expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
