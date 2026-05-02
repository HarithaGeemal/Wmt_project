import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

categorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

export default mongoose.model('Category', categorySchema, 'Category');
