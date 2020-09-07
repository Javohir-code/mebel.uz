const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
