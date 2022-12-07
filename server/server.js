require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./router');
const exceptionsMiddleware = require('./middlewares/exceptionsMiddleware');


const app = express();

const port = process.env.PORT || 3004;

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser('secret key'))
app.use('/api/', router)

app.use(exceptionsMiddleware)

mongoose.connect(process.env.DB_URL).then(() => console.log('DB CONNECTED')).catch(err => console.log(err))

app.listen(port, () => console.log(`Listening on port ${port}`));


