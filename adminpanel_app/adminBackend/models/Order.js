import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'accepted', 'delivering', 'completed', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: { type: String, enum: ['card', 'cash'], required: true, default: 'card' },
    paymentId: { type: String },
    razorPayOrderId: { type: String },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    shopName: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

export default mongoose.model('Order', orderSchema, 'Order');
