const Product = require("../models/product");

//Here we set the functions to return or send data on a given route that is going to be setup in the jobs.js file in routes folder
const getAllProductsStatic = async (req, res) => {
  //If we throw a new Error here it will go to our custom errorHandlerMiddleware in the app.js file since the async-express-errors package handles it for us

  //throw new Error("Testing async errors");

  //Here we are manually getting the products from the ikea company (we could use other properties, like name, featured, etc) and passing it to the express.json() middleware adding the numbers of hits properties that is just the length of the object we are receiving from the api call

  //We will implement the dynamic calls in the getAllProducts()
  const products = await Product.find({ company: "ikea" });
  res.status(200).json({ products, nHits: products.length });
};

const getAllProducts = async (req, res) => {
  //Here we decide which query paramenters will be used and destructured (we get to name the queries)
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  //This checks if the featured query parameter exists
  if (featured) {
    //If it exists, it adds it as a new property to the queryObject object
    queryObject.featured = featured === "true" ? true : false;
  }

  if (company) {
    queryObject.company = company;
  }

  if (name) {
    //$regex is a query name operation that allows us to get the items that contains the characters of a given query parameter (name in this case) and the 'i' in the options is to make the regex case insensitive
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (numericFilters) {
    //Here we make a map with symbols as keys and their respective mongoose query operators as the value
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };

    //Store the all keys in a regex variable so we can later map them and replace them with thier respective value
    const regEx = /\b(<|>|=|<=|>=)\b/g;

    //In this variable we'll store the result of the following function:
    //Replace the symbol we get from the numericFilter query parameter and replace it with the value that matches the key. Ex: get ">" from the numericFilter query parameter, then replace it with the value that matches the key "-$gt-" (in this case)
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );

    //Array of options from which we will implement the numeric filters from
    const options = ["price", "ratings"];
    console.log("From filters variable:", filters);

    //First, split the filters where there is a comma, and for each filter we get destrcture into field, operator and value each items that contains a "-". Ex: in a filter item we have "price-$lt-40" we destructure price into field, $lt into operator and 40 into value
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");

      //Only if the fiedl we get from the destructured items is in the options array we set it as a new property in the queryObject object and set the operator as it's key, and the value as its value
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  console.log(queryObject);

  let result = Product.find(queryObject);

  if (sort) {
    //When there are multiple sort properties join them together
    const sortList = sort.split(",").join(" ");
    //Set the result variable equal to the sorted results
    result = result.sort(sortList);
  } else {
    //If the sort query parameter is not passed, sort the results by the "createdAt" property
    result = result.sort("createdAt");
  }

  if (fields) {
    //When there are multiple field properties join them together
    const fieldsList = fields.split(",").join(" ");
    //Set the result variable equal to the selected fields results
    result = result.select(fieldsList);
  }

  //Here we set the page and limit variables that will take the their respective values from the query parameters if they're passed, otherwise, will set them to 1 and 10 respectively

  //This is the page number we want to get the result from
  const page = Number(req.query.page) || 1;
  //This is the amount of products per page we want to get
  const limit = Number(req.query.limit) || 10;

  //This skip variable will give us the amount of products we want to skip based on the page and the limit variable.
  //Ex:we want to get the products of page 3 when the limit is set to 2. So we say (3 - 1)= 2 * 2 which equals to 4 and that's the amount of products to skip, therefore, we'll only get the products 5 and 6 since the first 4 products will be skipped
  const skip = (page - 1) * limit;

  //We set the result variable equal to result with the given amount of products to skip and products per page to get
  result = result.skip(skip).limit(limit);

  //Await for the result variable to be resolved and store it in the products variable
  const products = await result;
  res.status(200).json({ products, nHits: products.length });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
