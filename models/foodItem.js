const {mongoose,Schema,connection} = require("../connection")

let foodItemSchema = new Schema({
  name: String,
  price: Number,
  description: String,
  picture : String,
  createdOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

//last one is actual collection name in db and its essential
let FoodItem = connection.model("FoodItem", foodItemSchema, "foodItem");

module.exports = {
  FoodItem: FoodItem,
  FoodItemSchema: foodItemSchema,
};
