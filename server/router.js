const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController')
const chatRoomController = require('./controllers/chatRoom')
const dataService = require('./services/dataService')
const authMiddleware = require('./middlewares/authMiddleware')


// router.get('/', (req, res) => {
//     res.sendStatus(200);
// })
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/fbLogin', userController.fbLogin);
router.post('/logout', userController.logoutUser);
router.post('/google-auth', userController.googleLogin)
router.post('/github-auth', userController.githubLogin)
router.post('/refresh', userController.refresh)
router.get('/profile/me',authMiddleware, userController.getProfile)
/// USER
// router.get('/users',userController.onGetAllUsers)
// router.get('/user:id',userController.onGetUserById)
router.get('/conversations',chatRoomController.getRecentConversation)
router.post('/initiate',chatRoomController.initiate)
router.get('/:roomId', chatRoomController.getConversationByRoomId)
router.post('/:roomId/message',chatRoomController.postMessage)
router.put('/:roomId/mark-read',chatRoomController.markConversationReadByRoomId)

router.get('/data', authMiddleware, dataService.getData);


// router.post('/login', userController.login);


// router.get('/facebook_auth', authService);

module.exports = router;