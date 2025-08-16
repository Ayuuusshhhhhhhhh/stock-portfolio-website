const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['buy', 'sell'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Price per share is required'],
    min: [0, 'Price cannot be negative'],
  },
  total: {
    type: Number,
    //required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Calculate total before saving
transactionSchema.pre('save', function(next) {
  this.total = this.quantity * this.price;
  next();
});

// Index for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, symbol: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
