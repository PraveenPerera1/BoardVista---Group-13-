const Chat = require('../models/Chat');
const BoardingHouse = require('../models/BoardingHouse');
const { validationResult } = require('express-validator');

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.user': req.user.id,
    })
      .populate('participants.user', 'name profileImage')
      .populate('boardingHouse', 'title images')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.user', 'name profileImage')
      .populate('boardingHouse', 'title')
      .populate('messages.sender', 'name profileImage');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const isParticipant = chat.participants.some(
      participant => participant.user._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat',
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { boardingHouseId, participantId } = req.body;

    const boardingHouse = await BoardingHouse.findById(boardingHouseId);
    if (!boardingHouse) {
      return res.status(404).json({
        success: false,
        message: 'Boarding house not found',
      });
    }

    const existingChat = await Chat.findOne({
      boardingHouse: boardingHouseId,
      'participants.user': { $all: [req.user.id, participantId] },
    });

    if (existingChat) {
      const populatedChat = await Chat.findById(existingChat._id)
        .populate('participants.user', 'name profileImage')
        .populate('boardingHouse', 'title images');

      return res.status(200).json({
        success: true,
        data: populatedChat,
      });
    }

    const chat = await Chat.create({
      participants: [
        { user: req.user.id, role: req.user.role },
        { user: participantId, role: req.user.role === 'owner' ? 'user' : 'owner' },
      ],
      boardingHouse: boardingHouseId,
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.user', 'name profileImage')
      .populate('boardingHouse', 'title images');

    res.status(201).json({
      success: true,
      data: populatedChat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { content, messageType = 'text', fileUrl } = req.body;

    let chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const isParticipant = chat.participants.some(
      participant => participant.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat',
      });
    }

    const message = {
      sender: req.user.id,
      content,
      messageType,
      fileUrl,
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    chat.updatedAt = new Date();

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.user', 'name profileImage')
      .populate('messages.sender', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populatedChat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const isParticipant = chat.participants.some(
      participant => participant.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat',
      });
    }

    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id && !message.isRead) {
        message.isRead = true;
        message.readAt = new Date();
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getChats,
  getChat,
  createChat,
  sendMessage,
  markMessagesAsRead,
};
