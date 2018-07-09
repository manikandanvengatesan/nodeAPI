const express = require('express');
const app = express();
const cour = require('./api/course');
app.use(express.json());

//CORS Middleware
// app.use(function (req, res, next) {
//     //Enabling CORS 
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
//     next();
// });

app.get('/api/courses',cour.findAll);
app.get('/api/courses/:id',cour.findCourse);
app.post('/api/courses',cour.insertCourse);
app.put('/api/courses/:id',cour.updateCourse);
app.delete('/api/courses/:id',cour.deleteCourse);


const port = process.env.PORT || 3000;
app.listen(port,()=>console.log(`listening on port ${port}`));
