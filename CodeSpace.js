const { Schema, model } = require("mongoose");

const CodeSpace = new Schema({
  _id: String,
  data: Object,
});

module.exports = model("CodeSpace", CodeSpace);
