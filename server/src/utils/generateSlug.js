const slugify = require('slugify');
const Restaurant = require('../models/Restaurant.model');

const generateSlug = async (name) => {
  let slug = slugify(name, { lower: true, strict: true });
  let exists = await Restaurant.findOne({ slug });
  let counter = 1;
  while (exists) {
    slug = `${slugify(name, { lower: true, strict: true })}-${counter++}`;
    exists = await Restaurant.findOne({ slug });
  }
  return slug;
};

module.exports = generateSlug;