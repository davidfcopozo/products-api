require("dotenv").config();
const connectDB = require("./db/connect");
const Product = require("./models/product");
const jsonProducts = require("./products.json");

//This function is used to just dynamically add the data we have in the products.json file to the database
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    //This is just to make sure there are no products in the data base so we can start from scratch (this is optional).
    await Product.deleteMany();
    await Product.create(jsonProducts);
    console.log("Populate connection successful!!!");
    //Once everything is done without any errors, we call exit method to terminate the procss synchronously with the success exit code '0'
    process.exit(0);
  } catch (error) {
    console.log(error);
    //Otherwise, will force the process to exit as quickly as possible even if there are still asynchronous operations pending that have not yet completed fully with the failure exite code '1'
    process.exit(1);
  }
};

start();
