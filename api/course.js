const Joi = require('joi');
var sql = require("mssql");
require('dotenv').load();

//Initiallising connection string
var dbConfig = {
    user: process.env.user,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database,
    options: {
        abortTransactionOnError: true, // <-- SET XACT_ABORT ON
        multipleStatements: true,
        encrypt: false
    }
};

exports.findAll = (req,res)=>{
    sql.connect(dbConfig, function() {
        var request = new sql.Request();
        var courseId = 'select * from courses';
        request.query(courseId, function(err, recordset) {
            if(err) { console.log(err); sql.close(); return; }
            res.end(JSON.stringify(recordset.recordset));
            sql.close();
        });
    });
};

exports.findCourse = (req, res)=>{
    sql.connect(dbConfig, function() {
        var request = new sql.Request();
        var courseId = `select * from courses where course_Id = ${req.params.id}`;
        request.query(courseId, function(err, recordset) {
            if(err){
                console.log(err); sql.close(); return;
            }
            res.end(JSON.stringify(recordset.recordset));
            sql.close();
        });
    });
};

exports.insertCourse = (req, res) => {

    // const result = validateCourse(req.body);

    // if(result.error){
    //     res.status(400).send(result.error.details[0].message);
    //     return;
    // }
    sql.connect(dbConfig, function() {
        
        var request = new sql.Request();
        var post = [];
        for(var i = 0; i < req.body.length; i++)
            post.push(req.body[i].course_Name)
        console.log(post);
        var inseredQuery = ('insert into courses (course_Name) values ?', [post]);
        request.query(inseredQuery, function(err, insertedData) {
            if(err) { res.status(400).send(err); sql.close(); return; }
            res.send(insertedData);
            sql.close();
        });
    });
};

exports.updateCourse = (req, res) =>{
    const result = validateCourse(req.body);
    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }
    sql.connect(dbConfig, function() {
        const transaction = new sql.Transaction();
        transaction.begin(function(err){
            if (err){ res.send(err); return }

            var request = new sql.Request(transaction);
            var courseId = `select * from courses where course_Id = ${req.params.id}`;
            request.query(courseId, function(err, recordset) {
                if(err) { console.log(err); sql.close(); return; }
                // res.send(recordset);
                if(recordset.recordset.length!=0){
                    var updateQuery = `update courses set course_Name = '${req.body.name}' where course_Id = ${req.params.id}`
                    request.query(updateQuery, function(err, updatedData) {
                        if(err) { console.log(err); sql.close(); return; }
                        
                        if(updatedData.rowsAffected!=0){
                            var inseredQuery = `insert into degree(name) values ('1')`
                            request.query(inseredQuery, function(err, insertedData) {
                                if(err) { res.status(400).send(err); sql.close(); return; }
                                transaction.commit(err);
                                res.send(insertedData);
                                sql.close();
                            });
                        }
                    });
                }
            });
        });
    });
};

exports.deleteCourse = (req, res) =>{
    const result = validateCourse(req.body);
    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }

    sql.connect(dbConfig, function() {
        var request = new sql.Request();
        var inseredQuery = `Delete from courses where course_Id ='${req.params.id}'`
        request.query(inseredQuery, function(err, insertedData) {
            if(err) { res.status(400).send(err); sql.close(); return; }
            res.send(insertedData);
            sql.close();
        });
    });
    
};

function validateCourse(course){
    const schema = {
        name : Joi.string().min(3).required()
    };
    return Joi.validate(course,schema);
}