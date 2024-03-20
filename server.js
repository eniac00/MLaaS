const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const upload = require('express-fileupload');
const hbs = require('hbs');
const PORT = process.env.PORT || 3000;


// middlewares 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '/public')));
app.use(upload());

// configuring the templating engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/templates/views'));

// resitering partials for templating engine
hbs.registerPartials(path.join(__dirname, '/templates/partials'));


// routes starts here
app.use('/', require('./routes/root'));
app.use('/create', require('./routes/create'));
app.use('/train', require('./routes/train'));


// telling the app to listen on port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));