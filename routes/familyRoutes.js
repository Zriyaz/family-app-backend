import express from 'express';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { sanitizeInput } from '../middleware/sanitizeInput.js';
import logger from '../config/logger.js';
import { validate, validateRequest } from '../middleware/validate.js';
import {
  createFamilyMemberSchema,
  updateFamilyMemberSchema,
  deleteFamilyMemberSchema,
} from '../schemas/familySchemas.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/family
// @desc    Get all family members for logged in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(familyMembers);
  } catch (error) {
    logger.error(`Get family members error: ${error.message}`, { error: error.stack });
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/family
// @desc    Add a new family member
// @access  Private
router.post(
  '/',
  validate(createFamilyMemberSchema, 'body'),
  async (req, res) => {
    try {
      const { name, relationship, age } = req.body;

      // Sanitize inputs
      const sanitizedName = sanitizeInput(name);

      const familyMember = await FamilyMember.create({
        userId: req.user._id,
        name: sanitizedName,
        relationship,
        age: age !== undefined ? age : undefined,
      });

      res.status(201).json(familyMember);
    } catch (error) {
      logger.error(`Create family member error: ${error.message}`, { error: error.stack });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/family/:id
// @desc    Update a family member
// @access  Private
router.put(
  '/:id',
  validateObjectId,
  validateRequest(updateFamilyMemberSchema),
  async (req, res) => {
    try {
      const familyMember = await FamilyMember.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!familyMember) {
        return res.status(404).json({ message: 'Family member not found' });
      }

      const { name, relationship, age } = req.body;
      if (name !== undefined) familyMember.name = sanitizeInput(name);
      if (relationship !== undefined) familyMember.relationship = relationship;
      if (age !== undefined) familyMember.age = age;

      await familyMember.save();
      res.json(familyMember);
    } catch (error) {
      logger.error(`Update family member error: ${error.message}`, { error: error.stack });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/family/:id
// @desc    Delete a family member
// @access  Private
router.delete(
  '/:id',
  validateObjectId,
  validate(deleteFamilyMemberSchema, 'params'),
  async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!familyMember) {
      return res.status(404).json({ message: 'Family member not found' });
    }

    await familyMember.deleteOne();
    res.json({ message: 'Family member removed' });
  } catch (error) {
    logger.error(`Delete family member error: ${error.message}`, { error: error.stack });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

