const express = require('express');
const { body } = require('express-validator');
const {
  getChats,
  getChat,
  createChat,
  sendMessage,
  markMessagesAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getChats)
  .post(
    protect,
    [
      body('boardingHouseId').notEmpty().withMessage('Boarding house ID is required'),
      body('participantId').notEmpty().withMessage('Participant ID is required'),
    ],
    createChat
  );

router.route('/:id')
  .get(protect, getChat)
  .post(
    protect,
    [
      body('content').notEmpty().withMessage('Message content is required'),
      body('messageType').optional().isIn(['text', 'image', 'file']),
    ],
    sendMessage
  )
  .put(protect, markMessagesAsRead);

module.exports = router;
