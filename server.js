'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token = 'EAAXDhwofrAMBAOMAFaFpd1vwPPYJzyIowzS3wijeif8WlQA6QaqwyCWjRf1xZAXxFeVXFg3ZATxBBncE1xjinldVVWQfjGJDOUP2tilQQj6OPB3WMGJ5L502ZA3eHWc08yETrDihZBUa84MQXAF1CLdi4ZCZCMZBrooEX78DbgxzQZDZD'
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get('/', function (req, res) {
  res.send('test test')
})
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === '123456') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})
app.post('/webhook/', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      var location = event.message.text
      var weatherEndpoint = 'http://api.openweathermap.org/data/2.5/weather?q=' +location+ '&units=metric&appid=65c6f7143e515e5a7bf84d21731ae515'
      request({
        url: weatherEndpoint,
        json: true
      }, function(error, response, body) {
        try {
          var condition = body.main;
          var condition2 = body.weather;
          sendTextMessage(sender, "ตอนนี้อุณหภูมิใน " + location + " อยู่ที่ " + condition.temp + " องศาเซลเซียส" );
          sendTextMessage(sender, "โดยอุณหภูมิสูงสุดจะอยู่ที่ " + condition.temp_max + " องศาเซลเซียส" );
          sendTextMessage(sender, "โดยอุณหภูมิต่ำสุดจะอยู่ที่ " + condition.temp_min + " องศาเซลเซียส" );
          sendTextMessage(sender, "ค่าความชื้นอยู่ที่ " + condition.humidity);
        } catch(err) {
          console.error('error caught', err);
          sendTextMessage(sender, "เราหาเมืองนี้ไม่เจอ...กรุณากรอกใหม่อีกครั้ง");
        }
      })

      if (text === 'Generic') {
        sendGenericMessage(sender)
        continue
      }
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      sendTextMessage(sender, 'สวัสดีครับ อยากรู้อุณหภูมิเมืองไหน บอกเราได้เลยครับ')
      continue
    }
  }
  res.sendStatus(200)
})

function sendTextMessage (sender, text) {
  let messageData = { text: text }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendGenericMessage (sender) {
  let messageData = {
    'attachment': {
      'type': 'template',
      'payload': {
        'template_type': 'generic',
        'elements': [{
          'title': 'First card',
          'subtitle': 'Element #1 of an hscroll',
          'image_url': 'http://messengerdemo.parseapp.com/img/rift.png',
          'buttons': [{
            'type': 'web_url',
            'url': 'https://www.messenger.com',
            'title': 'web url'
          }, {
            'type': 'postback',
            'title': 'Postback',
            'payload': 'Payload for first element in a generic bubble'
          }]
        }, {
          'title': 'Second card',
          'subtitle': 'Element #2 of an hscroll',
          'image_url': 'http://messengerdemo.parseapp.com/img/gearvr.png',
          'buttons': [{
            'type': 'postback',
            'title': 'Postback',
            'payload': 'Payload for second element in a generic bubble'
          }]
        }]
      }
    }
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
