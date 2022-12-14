require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./router');
const exceptionsMiddleware = require('./middlewares/exceptionsMiddleware');
const app = express();
require('express-ws')(app);

const websocket = require('./websocket/Websocket')

const port = process.env.PORT || 3004;
app.use(cookieParser('refreshToken'))

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser('secret key'))
app.use('/api/', router)


app.ws('/', function(ws, req) {
    const params = new URLSearchParams(req.url.split("?")[1]);
    const userToken = params.get("userToken")
    websocket.addConnection(ws)
    ws.on('message', websocket.onMessage(ws));
});
app.use(exceptionsMiddleware)

mongoose.connect(process.env.DB_URL).then(() => console.log('DB CONNECTED')).catch(err => console.log(err))

app.listen(port, () => console.log(`Listening on port ${port}`));


