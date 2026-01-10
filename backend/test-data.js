const mongoose = require('mongoose');
const BoardingHouse = require('./models/BoardingHouse');
const User = require('./models/User');
require('dotenv').config();

const sampleData = {
  title: "Happy Boarding House",
  description: "A comfortable boarding house in Vavuniya with all modern facilities",
  address: {
    street: "No. 300, 2nd Lane, Mosque Road, Pampaimadu",
    city: "Vavuniya"
  },
  coordinates: {
    latitude: 8.7548,
    longitude: 80.4979
  },
  price: {
    monthly: 30000,
    deposit: 50000
  },
  gender: "co-ed",
  facilities: ["WiFi", "Parking", "Laundry", "Kitchen", "Air Conditioning"],
  roomTypes: [
    {
      name: "Single Room",
      capacity: 1,
      available: 4,
      price: 30000
    },
    {
      name: "Shared Room",
      capacity: 2,
      available: 2,
      price: 15000
    }
  ],
  images: [{ url: "https://picsum.photos/seed/boarding1/400/300" }],
  rules: ["No smoking", "Quiet hours after 10 PM"],
  isAvailable: true,
  isVerified: true
};

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create a dummy owner first
    const owner = await User.create({
      name: "John Owner",
      email: "owner@example.com",
      password: "password123",
      role: "owner",
      phone: "024-1234567",
      isVerified: true
    });
    console.log('Sample owner created:', owner.name);

    // Clear existing data
    await BoardingHouse.deleteMany({});
    console.log('Cleared existing boarding houses');

    // Add owner to sample data
    const boardingData1 = {
      ...sampleData,
      owner: owner._id
    };

    const boardingHouse = await BoardingHouse.create(boardingData1);
    console.log('Sample boarding house created:', boardingHouse.title);

    // Add more sample data
    const sample2 = {
      ...sampleData,
      title: "Green Valley Boarding",
      address: {
        street: "No. 45, Kandy Road, Vavuniya",
        city: "Vavuniya"
      },
      coordinates: {
        latitude: 8.7600,
        longitude: 80.5000
      },
      price: {
        monthly: 25000,
        deposit: 40000
      },
      facilities: ["WiFi", "Parking", "Hot Water", "Study Room"],
      roomTypes: [
        {
          name: "Single Room",
          capacity: 1,
          available: 3,
          price: 25000
        }
      ],
      owner: owner._id
    };

    await BoardingHouse.create(sample2);
    console.log('Second sample boarding house created');

    console.log('\nSample data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleData();
