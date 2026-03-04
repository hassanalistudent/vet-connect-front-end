import asyncHandler from "express-async-handler";
import Pet from "../models/pet.js";
import User from "../models/user.js";

// createPet - No change needed (handles empty array fine)
const createPet = asyncHandler(async (req, res) => {
  const { petType, breed,petName, age, gender, weight, petImages } = req.body;
  
  const ownerId = req.user._id;
  
  const pet = new Pet({
    ownerId,
    petType,
    petName,
    breed,
    age,
    gender,
    weight,
    petImages: petImages || "", // Single string now
  });
  
  const createdPet = await pet.save();
  const populatedPet = await Pet.findById(createdPet._id).populate(
    "ownerId",
    "fullName email phone"
  );
  
  res.status(201).json(populatedPet);
});

// updatePet - Key change here
const updatePet = asyncHandler(async (req, res) => {
  const { petType,petName, breed, age, gender, weight, petImages } = req.body;
  
  const pet = await Pet.findById(req.params.id);
  
  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }
  
  if (
    pet.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== "Admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this pet");
  }
  
  // Update only provided fields
  if (petType !== undefined) pet.petType = petType;
  if (petName !== undefined) pet.petName = petName;
  if (breed !== undefined) pet.breed = breed;
  if (age !== undefined) pet.age = age;
  if (gender !== undefined) pet.gender = gender;
  if (weight !== undefined) pet.weight = weight;
  if (petImages !== undefined) pet.petImages = petImages; // Single string
  
  const updatedPet = await pet.save();
  const populatedPet = await Pet.findById(updatedPet._id).populate(
    "ownerId",
    "fullName email phone"
  );
  
  res.json(populatedPet);
});

// @desc    Get all pets (admin/vet view)
// @route   GET /api/pets
// @access  Private (admin/vet only)
const getPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({})
    .populate("ownerId", "fullName email phone")
    .sort({ createdAt: -1 });

  res.json(pets);
});

// @desc    Get pet by ID
// @route   GET /api/pets/:id
// @access  Private (owner or admin/vet)
const getPetById = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate(
    "ownerId",
    "fullName email phone"
  );

  if (pet) {
    res.json(pet);
  } else {
    res.status(404);
    throw new Error("Pet not found");
  }
});
// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private (owner or admin)
const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  // Authorization: owner or admin
  if (
    pet.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== "Admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this pet");
  }

  await Pet.deleteOne({ _id: req.params.id });
  res.json({ message: "Pet removed" });
});
const getUserPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ ownerId: req.user._id })
    .populate("ownerId", "fullName email")
    .sort({ createdAt: -1 });

  res.json(pets);
});


export {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getUserPets
};
