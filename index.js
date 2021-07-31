/**
 *      Title: NODE EXPRESS CACHING FETCHED DATA with REDIS
 *      Description: This code is a demo on caching data with Redis to lower latency and speed up load time
 *      Credits: API credits to www.messari.io
 */

const express = require('express')
const redis = require('redis')
const fetch = require('node-fetch')

let PORT = process.env.PORT || 4000;
let REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT)
const app = express()



// FETCH DATA FROM API
// credits to www.messari.io
async function getCoin (request, response, next) {
    try {
        console.log('fetching data...')
        const {coin} = request.params;
        const respond = await fetch(`https://data.messari.io/api/v1/assets/${coin}/profile`)
        const data = await respond.json()
        const current = JSON.stringify(data)

        client.setex('coin', 3600, current)
        return response.send({ coin:coin, fresh_data: data})

    } catch (error) {
        response.send({'Something went wrong on "GET_COIN" function': error})
    }
}


//CACHE MIDDLEWARE
function cache(request,response,next) {
    const {coin} = request.params
    client.get('coin',(error, data) => {
        const parsed = JSON.parse(data)
        if(error) response.send({'Something went wrong on getting data from the cache': error})
        if(parsed.data.slug === coin ) {
            response.send({coin: coin, cached_data: parsed})
        }
         else {
            next()
        }
    })
}


//ROUTER
app.get('/crypto/:coin', cache, getCoin)


//PORT LISTENER
app.listen(PORT, () => {
    console.log('listening to port', PORT)
})


