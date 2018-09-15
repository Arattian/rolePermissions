const express = require('express');
const db = require('./database').db;

const app = express();

const userPermissions = {
    get: ['/users', '/users/:id'],
    post: ['/articles'],
}

const adminPermissions = {
    get: ['/kits'],
    post: ['/kits'],
    put: ['/users/:id/edit', '/articles'],
}

app.use(getToken);
app.use(authenticate);

app.get(userPermissions.get, accessControl('user', 'admin'));
app.get(adminPermissions.get, accessControl('admin'));

app.post(userPermissions.post, accessControl('user', 'admin'));
app.post(adminPermissions.post, accessControl('admin'));

app.put(adminPermissions.put, accessControl('admin'));

function getToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token) {
        req.token = token;
        next();
    } else {
        res.json({statusCode: 401, message: 'Unauthorized. Please sign in.'});
    }
}

function authenticate(req, res, next) {
    for (let user of db) {
        if (req.token === user.token) {
            req.role = user.role;
        }
    }
    //if token doesn't exist in database
    if (!req.role) {
        res.json({statusCode: 401, message: 'Unauthorized. Please sign in.'});
    } else {
        next();
    }
}

function accessControl(...allowedFor) {
    const access = role => allowedFor.indexOf(role) != -1;
    return (req, res, next) => {
        if(access(req.role)) {
            //here will be next();
            res.json(`Access allowed for ${req.role}`);
        } else {
            res.json(`Access denied for ${req.role}`);
        }
    }
}



app.listen(3000);