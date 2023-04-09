const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("connecting....");
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log("mongodb connected");
  } catch (err) {
    console.log(err.message);

    process.exit(1);
  }
};

module.exports = connectDB;