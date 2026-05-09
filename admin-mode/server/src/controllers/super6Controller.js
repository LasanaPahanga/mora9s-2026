import { getPool, emitToUsers } from '../app.js';
import { getPool } from '../db.js';
import { emitToUsers } from '../utils/socket.js';
import { promoteGroupToSuper6 } from './promotionController.js';
import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";

// Promote top teams from each group into Super6 placeholders (A1,A2,B1,B2,C1,C2)
// Manual endpoint to trigger group->super6 promotion
export const generateSuper6 = async (req, res) => {
  try {
    const success = await promoteGroupToSuper6();
    if (success) {
      res.json({ message: 'Group stage promotions complete' });
    } else {
      res.status(400).json({ error: 'Promotion not yet available - some group matches still pending' });
    }
  } catch (err) {
    console.error('Error generating Super6 promotions', err);
    res.status(500).json({ error: 'Failed to generate Super6 promotions' });
  }
};

export default { generateSuper6 };
