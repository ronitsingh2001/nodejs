const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const rootDir = require('./utils/path')

const app = express();

const adminRouter = require('./routes/admin')
const shopRouter = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/admin/', adminRouter)
app.use(shopRouter)

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(rootDir, 'views', '404.html'))
})


// const server = http.createServer(app);
// server.listen(3000);

app.listen(3000);