const express = require('express');
const app = express()

//USE PROXY SERVER TO REDIRECT THE INCOMMING REQUEST
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken')
const JWT_SECRETE = "347186591486#^%%ABCF*##GHE"

function authToken(req, res, next) {
    console.log(req.headers.authorization)
    const header = req?.headers.authorization;
    const token = header && header.split(' ')[1];

    if (token == null) return res.status(401).json("Please send token");

    jwt.verify(token, JWT_SECRETE, (err, user) => {
        if (err) return res.status(403).json("Invalid token", err);
        req.user = user;
        next()
    })
}

function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json("Unauthorized");
        }
        next();
    }
}

/*
localhost:4000/reg/registration

{
  "firstname":"Tim",
  "email":"k@gmail.com",
  "password":"chan",
  "mobile": 12345678,
  "role": "employee"
}
*/

//REDIRECT TO THE REGISTRATION MICROSERVICE

app.use('/reg', (req, res) => {
    console.log("INSIDE API GATEWAY REGISTRATION ROUTE")
    proxy.web(req, res, { target: 'http://localhost:5000' });
})

/*
localhost:4000/auth/login

{
  "email":"a@gmail.com",
  "password":"AUPP",
  "role":"employee"
}

*/

//REDIRECT TO THE LOGIN(Authentication) MICROSERVICE
app.use('/auth', (req, res) => {
    console.log("INSIDE API GATEWAY LOGIN ROUTE")
    proxy.web(req, res, { target: 'http://localhost:5000' });
})

/*
localhost:4000/teacher/addtask
{
  "assignmentname":"Task 5",
  "assignmentdesc":"Urgent Task 5",
  "assignmentduedate":"15/06/25"
}

localhost:4000/employer/removetask/4262

localhost:4000/employer/searchemployee/Tim
*/

//REDIRECT TO THE EMPLOYER MICROSERVICE
app.use('/CEO', authToken, authRole('CEO'),(req, res) => {
    console.log("INSIDE API GATEWAY CEO ROUTE")
    proxy.web(req, res, { target: 'http://localhost:5001' });
})

/*
localhost:4000/employee/viewallassignment

localhost:4000/student/updateprofile/4924
{
  "newpassword":"xyz",
  "newmobile":"9874563"
}

localhost:4000/student/submitassignment
{
  "assignmentid":"7531",
  "studentname":"Chandan",
  "description":"ABCD"
}
*/

//REDIRECT TO THE STUDENT MICROSERVICE
app.use('/supervisor',authToken, authRole('supervisor'), (req, res) => {
    console.log("INSIDE API GATEWAY SUPERVISOR ROUTE")
    proxy.web(req, res, { target: 'http://localhost:5002' });
})

app.listen(4000, () => {
    console.log("API Gateway Service is running on PORT NO : 4000")
})