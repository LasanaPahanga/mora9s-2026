import express from 'express';
import { promoteGroupToSuper6, promoteSuper6ToSemiFinals, promoteWomenGroupToSemiFinals, promoteWomenSemiToFinals, promoteMenSemiToFinals } from '../controllers/promotionController.js';
import { verifyAdminToken } from '../middleware/verifyAdminToken.js';

const router = express.Router();

// Manually trigger group->super6 promotion for men
router.post('/group-to-super6', verifyAdminToken, async (req, res) => {
  try {
    const success = await promoteGroupToSuper6();
    if (success) {
      res.json({ message: 'Men group stage promotions complete' });
    } else {
      res.status(400).json({ error: 'Promotion not yet available - some group matches still pending' });
    }
  } catch (err) {
    console.error('Error promoting group to super6', err);
    res.status(500).json({ error: 'Failed to promote group to super6' });
  }
});

// Manually trigger super6->semi-finals promotion for men
router.post('/super6-to-semi', verifyAdminToken, async (req, res) => {
  try {
    const result = await promoteSuper6ToSemiFinals();
    if (result.ok) {
      res.json({ message: 'Men super6 to semi-finals promotion complete' });
    } else {
      res.status(400).json({
        error: result.message || 'Promotion not yet available — men\'s Super 6 incomplete',
        pendingMatchIds: result.pendingMatchIds ?? []
      });
    }
  } catch (err) {
    console.error('Error promoting super6 to semi-finals', err);
    res.status(500).json({ error: 'Failed to promote super6 to semi-finals' });
  }
});

// Manually trigger women group->semi-finals (women skip super6)
router.post('/women-group-to-semi', verifyAdminToken, async (req, res) => {
  try {
    const success = await promoteWomenGroupToSemiFinals();
    if (success) {
      res.json({ message: 'Women group stage complete, semi-finals ready' });
    } else {
      res.status(400).json({ error: 'Promotion not yet available - some group matches still pending' });
    }
  } catch (err) {
    console.error('Error checking women group stage', err);
    res.status(500).json({ error: 'Failed to check women group stage' });
  }
});

// Manually trigger women semi-finals->finals
router.post('/women-semi-to-finals', verifyAdminToken, async (req, res) => {
  try {
    const success = await promoteWomenSemiToFinals();
    if (success) {
      res.json({ message: 'Women semi-finals to finals promotion complete' });
    } else {
      res.status(400).json({ error: 'Promotion not yet available - some semi-final matches still pending' });
    }
  } catch (err) {
    console.error('Error promoting women semi-finals to finals', err);
    res.status(500).json({ error: 'Failed to promote women semi-finals to finals' });
  }
});

// Manually trigger men semi-finals->finals
router.post('/men-semi-to-finals', verifyAdminToken, async (req, res) => {
  try {
    const success = await promoteMenSemiToFinals();
    if (success) {
      res.json({ message: 'Men semi-finals to finals promotion complete' });
    } else {
      res.status(400).json({ error: 'Promotion not yet available - some semi-final matches still pending' });
    }
  } catch (err) {
    console.error('Error promoting men semi-finals to finals', err);
    res.status(500).json({ error: 'Failed to promote men semi-finals to finals' });
  }
});

export default router;
