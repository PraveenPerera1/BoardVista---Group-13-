const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  fileUrl: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'tenant'],
      required: true,
    },
  }],
  boardingHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingHouse',
    required: true,
  },
  lastMessage: {
    type: messageSchema,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

chatSchema.index({ participants: 1 });
chatSchema.index({ boardingHouse: 1 });

chatSchema.methods.markMessagesAsRead = async function (userId) {
  await this.updateMany(
    { 'messages.sender': { $ne: userId } },
    { $set: { 'messages.$[elem].isRead': true, 'messages.$[elem].readAt': new Date() } },
    { arrayFilters: [{ 'elem.sender': { $ne: userId } }] }
  );
};

chatSchema.methods.getUnreadCount = async function (userId) {
  return this.messages.filter(msg => 
    msg.sender.toString() !== userId.toString() && !msg.isRead
  ).length;
};

module.exports = mongoose.model('Chat', chatSchema);
