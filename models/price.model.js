import { Schema, model } from 'mongoose';

const priceSchema = new Schema({
  currency: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Price = model('Price', priceSchema);
export default Price;
