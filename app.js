const express = require('express')
const fetch = require('node-fetch')
const pgp = require("pg-promise")()

const KEY = "073dfd9227c6474136cdf93e299ca5f9"

const app = express()

const db = pgp("postgres://user:password@localhost:5432/weather website")


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use(express.static(__dirname));

app.get('/weather/city', function (req, res) {
    getDataByCityName(req.query["q"], res).then((response) => {
        res.send(response)
    })
})

app.get('/weather/coordinates', function (req, res) {
    getDataByCoords(req.query["lat"], req.query["lon"], res).then((response) => {
        res.send(response)
    })
})

app.get('/favorites', function (req, res) {
    db.any(`SELECT city FROM "favorite cities"`).then((response) => {
        res.send(response.map(value => value['city']))
    });
})

app.post('/favorites', function (req, res) {
    let city = req.query["city"]
    db.none('INSERT INTO "favorite cities" VALUES($1)', city).then(() => {
        res.statusCode = 202
        res.send()
    }).catch((e) => {
        internalError(e, res)
    })
})

app.delete('/favorites', function (req, res) {
    db.none('DELETE FROM "favorite cities" WHERE id IN (SELECT id FROM "favorite cities" LIMIT 1 OFFSET $1)', req.query["id"]).then(() => {
        res.statusCode = 202
        res.send()
    }).catch((e) => {
        internalError(e, res)
    })
})


function internalError(e, res) {
    console.log(e.message)
    res.statusCode = 500
    res.send()
}

function getDataByCoords(lat, lon, res) {
    let link = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric&mode=xml`
    return sendRequest(link, res)
}

function getDataByCityName(city, res) {
    let link = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${KEY}&units=metric&mode=xml`
    return sendRequest(link, res)
}

function sendRequest(link, res) {
    return fetch(link).then((response) => {
        if (response.status !== 200) {
            res.statusCode = response.status
            res.send()
        } else {
            return response.text()
        }
    }).catch((e) => {
        internalError(e, res)
    })
}

app.listen(3000)