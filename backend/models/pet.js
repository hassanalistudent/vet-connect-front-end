import mongoose from "mongoose";

const PetSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  petType: { type: String, enum: ["Cat", "Dog", "Bird"], required: true },
  petName:String,
  breed: String,
  age: Number,
  gender: { type: String, enum: ["Male", "Female"] },
  weight: Number,
  petImages: String,
},{timestamps:true});

export default mongoose.model("Pet", PetSchema);
