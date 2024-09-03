import axios from 'axios';
import Transaction from '../models/transaction.model.js';
import Price from '../models/price.model.js'; 
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

export const getExpenses = async (req, res) => {
  const { address } = req.params;

  try {
    const transactions = await Transaction.find({ address });
 
    const totalExpense = transactions.reduce((acc, tx) => {
      const gasUsed = parseFloat(tx.gasUsed);
      const gasPrice = parseFloat(tx.gasPrice);
      return acc + (gasUsed * gasPrice) / 1e18;
    }, 0);
    const latestPrice = await Price.findOne({ currency: 'INR' }).sort({ timestamp: -1 });

    res.status(200).json({
      totalExpense,
      currentEtherPrice: latestPrice ? latestPrice.value : 'N/A',
    });
  } catch (error) {
    console.error('Error calculating expenses:', error);
    res.status(500).json({ error: 'Error calculating expenses' });
  }
};

export default {
  fetchTransactions,
  getExpenses,
};
