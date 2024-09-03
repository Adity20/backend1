// controllers/priceController.js
import axios from 'axios';
import Price from '../models/price.model.js';

export const fetchAndStorePrice = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'ethereum',
          vs_currencies: 'inr',
        },
      }
    );

    const ethPriceInINR = response.data.ethereum.inr;

    const price = new Price({
      currency: 'INR',
      value: ethPriceInINR,
    });

    await price.save();

    console.log(`Ethereum price updated: INR ${ethPriceInINR}`);
  } catch (error) {
    console.error('Error fetching Ethereum price:', error.message);
  }
};

export default {
  fetchAndStorePrice,
};
