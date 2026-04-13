import mongoose from 'mongoose';
import User from './server/models/User.js';

mongoose.connect('mongodb://localhost:27017/iet-placement-portal')
  .then(async () => {
      const u = await User.findOne({ rollNumber: '2200520100062' });
      console.log('User found:', u);
      process.exit(0);
  });
