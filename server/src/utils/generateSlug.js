/**
 * URL Slug Generator
 * Creates SEO-friendly URL slugs from restaurant names
 * 
 * @module utils/generateSlug
 * @description
 * Generates unique URL-friendly slugs for restaurants:
 * - Converts name to lowercase with hyphens
 * - Removes special characters
 * - Ensures uniqueness by appending counter if needed
 */

/**
 * Generates a unique slug from restaurant name
 * 
 * @function generateSlug
 * @async
 * @param {string} name - Restaurant name to convert to slug
 * @returns {string} Unique URL-friendly slug
 * 
 * @description
 * - Uses slugify library to convert name to URL-safe format
 * - Checks database for existing slugs to ensure uniqueness
 * - Appends numeric counter if slug already exists
 * 
 * @example
 * // Simple name
 * await generateSlug('My Restaurant')
 * // => "my-restaurant"
 * 
 * @example
 * // Duplicate name (adds counter)
 * await generateSlug('My Restaurant')
 * // => "my-restaurant-2"
 */
const slugify = require('slugify');
const Restaurant = require('../models/Restaurant.model');

const generateSlug = async (name) => {
  // Convert name to lowercase slug (removes special chars)
  let slug = slugify(name, { lower: true, strict: true });
  
  // Check if slug already exists in database
  let exists = await Restaurant.findOne({ slug });
  let counter = 1;
  
  // Keep appending counter until unique slug is found
  while (exists) {
    slug = `${slugify(name, { lower: true, strict: true })}-${counter++}`;
    exists = await Restaurant.findOne({ slug });
  }
  
  return slug;
};

module.exports = generateSlug;