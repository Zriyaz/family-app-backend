import { Router, Request, Response } from 'express';
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

const router = Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/family
// @desc    Get all family members for logged in user
// @access  Private
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const familyMembers = await FamilyMember.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(familyMembers);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error(`Get family members error: ${errorMessage}`, { error: errorStack });
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/family
// @desc    Add a new family member
// @access  Private
router.post(
  '/',
  validate(createFamilyMemberSchema, 'body'),
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(`Create family member error: ${errorMessage}`, { error: errorStack });
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
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(`Update family member error: ${errorMessage}`, { error: errorStack });
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
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(`Delete family member error: ${errorMessage}`, { error: errorStack });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;

