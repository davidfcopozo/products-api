require("dotenv").config();
const express = require("express");
const connectDB = require("./db/connect");
const app = express();
const productsRouter = require("./routes/products");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
require("express-async-errors");

const port = process.env.PORT || 3001;

//Middleware
app.use(express.json({}));

//Routes

//(we use .use() instead of .get() since we are getting the request in the products router file)
app.use("/api/v1/products", productsRouter);

app.get("/", (req, res) => {
  res.send('<h1>Products API</h1><a href="/api/v1/products">Products</a>');
});
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  //connectDB
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
