// // server.js
// require('dotenv').config(); // Load environment variables
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // --- Middleware ---
// app.use(cors()); // Allow requests from different origins (like your phone)
// app.use(express.json()); // Allow the app to accept JSON data

// // --- MongoDB Connection ---
// // Replace 'your_connection_string' below with your actual MongoDB URI
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boardvista';

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// // --- Database Schema (The Blueprint) ---
// const listingSchema = new mongoose.Schema({
//   title: String,
//   rent: String,      // e.g., "30,000.00"
//   capacity: String,  // e.g., "8"
//   phone: String,
//   imageUrl: String,  // URL string
// });

// const Listing = mongoose.model('Listing', listingSchema);

// // --- API Routes ---

// // 1. GET Route: This is what your React Native app calls
// app.get('/api/boardings', async (req, res) => {
//   try {
//     const listings = await Listing.find(); // Fetch all boardings
//     res.json(listings);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 2. POST Route: Use this (via Postman) to add data easily
// app.post('/api/boardings', async (req, res) => {
//   const newListing = new Listing({
//     title: req.body.title,
//     rent: req.body.rent,
//     capacity: req.body.capacity,
//     phone: req.body.phone,
//     imageUrl: req.body.imageUrl
//   });

//   try {
//     const savedListing = await newListing.save();
//     res.status(201).json(savedListing);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // --- Start Server ---
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });