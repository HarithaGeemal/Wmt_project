import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, default: 'Home' }, // Home, Work
    name: { type: String, required: true }, // recipient
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

export default mongoose.model('Address', addressSchema, 'Address');
