const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");

// Getting all contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Creating a new contact
router.post("/", async (req, res) => {
  const { firstName, lastName, email, phoneNumber, company, jobTitle } = req.body;

  try {
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      jobTitle,
    });

    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Updating a contact
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phoneNumber, company, jobTitle } = req.body;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phoneNumber, company, jobTitle },
      { new: true }
    );

    if (!updatedContact) return res.status(404).json({ message: "Contact not found" });

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deleting a contact
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) return res.status(404).json({ message: "Contact not found" });

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
