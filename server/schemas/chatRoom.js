const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// export const CHAT_ROOM_TYPES = {
//     CONSUMER_TO_CONSUMER: "consumer-to-consumer",
//     CONSUMER_TO_SUPPORT: "consumer-to-support",
// };

const chatRoomSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => uuidv4().replace(/\-/g, ""),
        },
        userIds: Array,
        type: String,
        chatInitiator: String,
    },
    {
        timestamps: true,
        collection: "chatrooms",
    }
);


chatRoomSchema.statics.getChatRoomsByUserId = async function (userId) {

    try {
        const rooms = await this.find({ userIds: { $all: [userId] } });
        return rooms;
    } catch (error) {
        throw error;
    }
}


chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
    try {
        const room = await this.findOne({ _id: roomId });
        return room;
    } catch (error) {
        throw error;
    }
}


chatRoomSchema.statics.initiateChat = async function (userIds, type, chatInitiator) {
    try {
        const availableRoom = await this.findOne({
            userIds: {
                $size: userIds.length,
                $all: [...userIds],
            },
            type,
        });
        if (availableRoom) {
            return {
                isNew: false,
                message: 'retrieving an old chat room',
                chatRoomId: availableRoom._doc._id,
                type: availableRoom._doc.type,
            };
        }

        const newRoom = await this.create({ userIds, type, chatInitiator });
        return {
            isNew: true,
            message: 'creating a new chatroom',
            chatRoomId: newRoom._doc._id,
            type: newRoom._doc.type,
        };
    } catch (error) {
        throw error;
    }
}

module.exports = mongoose.model("ChatRoom", chatRoomSchema);

