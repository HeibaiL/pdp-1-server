const makeValidation = require("@withvoid/make-validation")
// models
const ChatRoom = require('../schemas/chatRoom.js');
const ChatMessage = require('../schemas/chatMessage.js');
const UserModel = require('../schemas/userSchema.js');

class chatRoomController {
    async initiate(req, res) {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    // userIds: {
                    //     options: {unique: true, empty: false, stringOnly: true}
                    // }
                }
            }));

            if (!validation.success) return res.status(400).json({...validation});
            const {userIds, type} = req.body;
            const {userId: chatInitiator} = req;
            const allUserIds = [...userIds, chatInitiator];
            const chatRoom = await ChatRoom.initiateChat(allUserIds, type, chatInitiator);


            return res.status(200).json({success: true, chatRoom});
        } catch (error) {
            return res.status(500).json({success: false, error: error})
        }
    }

    async postMessage(req, res){
        try {
            const {roomId} = req.params;
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    // messageText: {type: types.string},
                }
            }));
            if (!validation.success) return res.status(400).json({...validation});
            const messagePayload = {
                messageText: req.body.messageText,
            };

            const currentLoggedUser = req.body.userId;

            const post = await ChatMessage.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);
            global.io.sockets.in(roomId).emit('new message', {message: post});
            return res.status(200).json({success: true, post});
        } catch (error) {
            return res.status(500).json({success: false, error: error})
        }
    }

    async getRecentConversation(req, res){
        try {
            const currentLoggedUser = req.query.userId;

            const options = {
                page: parseInt(req.query.page) || 0,
                limit: parseInt(req.query.limit) || 10,
            };
            const rooms = await ChatRoom.getChatRoomsByUserId(currentLoggedUser);
            const roomIds = rooms.map(room => room._id);
            const recentConversation = await ChatMessage.getRecentConversation(
                roomIds, options, currentLoggedUser
            );
            return res.status(200).json({success: true, conversation: recentConversation});
        } catch (error) {
            return res.status(500).json({success: false, error: error})
        }
    }

    async getConversationByRoomId(req, res){
        try {
            const {roomId} = req.params;
            const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: 'No room exists for this id',
                })
            }
            const users = await UserModel.getUserByIds(room.userIds);
            const options = {
                page: parseInt(req.query.page) || 0,
                limit: parseInt(req.query.limit) || 10,
            };
            const conversation = await ChatMessageModel.getConversationByRoomId(roomId, options);
            return res.status(200).json({
                success: true,
                conversation,
                users,
            });
        } catch (error) {
            return res.status(500).json({success: false, error});
        }
    }

    async markConversationReadByRoomId(req, res){
        try {
            const {roomId} = req.params;
            const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: 'No room exists for this id',
                })
            }

            const currentLoggedUser = req.userId;
            const result = await ChatMessageModel.markMessageRead(roomId, currentLoggedUser);
            return res.status(200).json({success: true, data: result});
        } catch (error) {
            return res.status(500).json({success: false, error});
        }
    }
}

module.exports = new chatRoomController();