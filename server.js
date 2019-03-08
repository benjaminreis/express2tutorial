//from tutorial here:  https://vmokshagroup.com/blog/building-restful-apis-using-node-js-express-js-and-ms-sql-server/

//Initializing node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql/msnodesqlv8");
var app = express();

// Body Parser Middleware
app.use(bodyParser.json());

//CORS Middleware
//More on CORS:  https://docs.microsoft.com/en-us/aspnet/web-api/overview/security/enabling-cross-origin-requests-in-web-api
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});


//Setting up server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


//Initializing connection string
var dbConfig = {
    // server: "localhost",
    // database: "Training",
    // driver: 'msnodesqlv8',
    // options: {
    //     trustedConnection: true
    //   }
    connectionString: 'Driver=SQL Server;data source=localhost;Server=localhost;Database=Training;Trusted_Connection=true;'

};

var executeQuery = function(res, query, parameters){
    sql.close();//not a great solution.  need to use connectionpool to reuse connection
    sql.connect(dbConfig, function (err) {
        if (err) {
            console.log("error while connection to database: " + err);
            sql.close(); 
            res.send(err);
        }
        else {
            //create Request object
            var request = new sql.Request();

            if (typeof parameters !== 'undefined' && parameters !== null && parameters.length > 0) {
                parameters.forEach(function(p) {
                    request.input(p.name, p.sqltype, p.value);
                });
            }

            //query to the db
            request.query(query, function (err, rs) {
                if (err) {
                    console.log("Error while querying databse: " + err);
                    res.status(400);  //400 is the error code for GET/POST/PUT/DELETE
                    res.send(err);
                }
                else {
                    res.status(201);  //POST request need to be 200, all others are 201 need to find a better way to do this... 
                    res.send(rs['recordset']);
                }
                sql.close();
            });
        }

    });
}

//GET API
app.get("/api/Students", function(req, res) {
    var limit = 50;
    var query = "select TOP (@limit) * from Students";
    var parameters = [];
    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    } 
    parameters.push({ name: "limit", sqltype: sql.Int, value: limit});

    executeQuery (res, query, parameters);
    
});

//GET ONE API
app.get("/api/Students/:id", function(req, res) {
    var limit = 50;
    var query = "select TOP (@limit) * from Students WHERE ID = @ID";
    var parameters = [];
    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    } 
    parameters.push({ name: "limit", sqltype: sql.Int, value: limit});
    parameters.push({name: "ID", sqltype: sql.Int, value: req.params.id});

    executeQuery (res, query, parameters);
    
});

//Search Students filtering on the JSON that is passed in
app.post("/api/SearchStudents", function(req, res) {
    //TODO BEN
});

//POST API
app.post("/api/Students", function(req, res){
 
    var parameters = [
        { name: "FirstName", sqltype: sql.NVarChar, value: req.body.FirstName},
        { name: "LastName", sqltype: sql.NVarChar, value: req.body.LastName},
        { name: "GraduationDate", sqltype: sql.DateTime2, value: req.body.GraduationDate},
        { name: "LoanBalance", sqltype: sql.Decimal, value: req.body.LoanBalance},
        { name: "Servicer", sqltype: sql.NVarChar, value: req.body.Servicer},
        { name: "SchoolName", sqltype: sql.NVarChar, value: req.body.SchoolName},
        { name: "StudentID", sqltype: sql.Int, value: req.body.StudentID},
        { name: "Status", sqltype: sql.TinyInt, value: req.body.Status},
    ];
    var query = "INSERT INTO [STUDENTS] (FirstName, LastName, GraduationDate, LoanBalance, Servicer, SchoolName, StudentID, Status) VALUES (@FirstName, @LastName, @GraduationDate, @LoanBalance, @Servicer, @SchoolName, @StudentID, @Status);";

            executeQuery (res, query, parameters);

});



// PUT API
app.put("/api/Students/:id", function(req , res){
var parameters = [];
var query = "UPDATE [DBO].[Students] SET ";
var bCanInsert = true;
var obj = req.body;
var paramID = parseInt(req.params.id);

    if (paramID != parseInt(obj.ID)) {
        bcaninsert = false;  //the id passed in to the URL and the JSON much match

        return res.sendStatus(400);
    }

    if (typeof obj.ID !== 'undefined' && obj.ID !== null && obj.ID !== ''  && parseInt(obj.ID) > 0)
    {
        parameters.push({ name: "ID", sqltype: sql.Int, value: parseInt(obj.ID)});

    } else {
        bCanInsert = false;
    }


    if (typeof obj.FirstName !== 'undefined' && obj.FirstName !== null && obj.FirstName !== '')
    {
        parameters.push({ name: "FirstName", sqltype: sql.NVarChar, value: obj.FirstName});
        query += "FirstName = @Firstname,"
    }

    if (typeof obj.LastName !== 'undefined' && obj.LastName !== null && obj.LastName !== '')
    {
        parameters.push({ name: "LastName", sqltype: sql.NVarChar, value: obj.LastName});
        query += "LastName = @LastName,"
    }

    if (typeof obj.GraduationDate !== 'undefined' && obj.GraduationDate !== null && obj.GraduationDate !== '')
    {
        parameters.push({ name: "GraduationDate", sqltype: sql.DateTime2, value: obj.GraduationDate});
        query += "GraduationDate = @GraduationDate,"
    }

    if (typeof obj.LoanBalance !== 'undefined' && obj.LoanBalance !== null && obj.LoanBalance !== '')
    {
        parameters.push({ name: "LoanBalance", sqltype: sql.Decimal, value: obj.LoanBalance});
        query += "LoanBalance = @LoanBalance,"
    }

    if (typeof obj.Servicer !== 'undefined' && obj.Servicer !== null && obj.Servicer !== '')
    {
        parameters.push({ name: "Servicer", sqltype: sql.NVarChar, value: obj.Servicer});
        query += "Servicer = @Servicer,"
    }

    if (typeof obj.SchoolName !== 'undefined' && obj.SchoolName !== null && obj.SchoolName !== '')
    {
        parameters.push({ name: "SchoolName", sqltype: sql.NVarChar, value: obj.SchoolName});
        query += "SchoolName = @SchoolName,"
    }

    if (typeof obj.StudentID !== 'undefined' && obj.StudentID !== null && obj.StudentID !== '')
    {
        parameters.push({ name: "StudentID", sqltype: sql.Int, value: obj.StudentID});
        query += "[StudentID] = @StudentID,"
    }

    if (typeof obj.Status !== 'undefined' && obj.Status !== null && obj.Status !== '')
    {
        parameters.push({ name: "Status", sqltype: sql.TinyInt, value: obj.Status});
        query += "[Status] = @Status,"
    }

    if (bCanInsert && parameters.length > 1)  //the ID will be in there, and at least one other.
    {
        query = query.slice(0, -1);  //chop off the comma at the end
        query += " WHERE [ID] = @ID;"; 
        executeQuery (res, query, parameters);
    }

});


// DELETE API
app.delete("/api/Students/:id", function(req, res){
    var parameters = [];
    //var bCanInsert = true;
    var query = "DELETE FROM Students WHERE ID=@ID";
    if (typeof req.params.id !== 'undefined' && req.params.id !== null && req.params.id !== '' && (parseInt(req.params.id) > 0)) {
        parameters.push({ name: "ID", sqltype: sql.Int, value: parseInt(req.params.id)});
        executeQuery (res, query, parameters);

    } else {
        //Dont execute the query...  maybe a more graceful way to handle this?
    }
});