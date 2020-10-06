import express from 'express'
import cors from 'cors'
import get_ip from 'ipware'

// Babal Async
import 'regenerator-runtime/runtime.js'

const app = express()
const port = process.env.PORT | 3001

app.use('/*', function(req, res, next) {
  res.status(200).set('Access-Control-Allow-Origin', '*')
  res.status(200).set('Cache-Control', 'no-store')
  next()
})

app.get('/', cors(), function(req, res, next) {
  const getIP = get_ip().get_ip
  function IP() {
    const ipaddr = getIP(req)
    return ipaddr['clientIp']
  }
  let ip = IP()

  // const ip = req.get('x-forwarded-for') || req.connection.remoteAddress
  res.status(200).send(`Your IP Address ${ip}`)
  next()
})

app.use('/json', cors(), (req, res, next) => {
  const ip = req.get('x-forwarded-for') || req.connection.remoteAddress
  // Convert IPv4, IPv6 to decimal number
  function convertIpToDecimal() {
    // a not-perfect regex for checking a valid ip address
    // It checks for (1) 4 numbers between 0 and 3 digits each separated by dots (IPv4)
    // or (2) 6 numbers between 0 and 3 digits each separated by dots (IPv6)
    const ipAddressRegEx = /^(\d{0,3}\.){3}.(\d{0,3})$|^(\d{0,3}\.){5}.(\d{0,3})$/
    const valid = ipAddressRegEx.test(ip)
    if (!valid) {
      return false
    }
    const dots = ip.split('.')
    // make sure each value is between 0 and 255
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i]
      if (dot > 255 || dot < 0) {
        return false
      }
    }
    if (dots.length == 4) {
      // IPv4
      return ((+dots[0] * 256 + +dots[1]) * 256 + +dots[2]) * 256 + +dots[3]
    } else if (dots.length == 6) {
      // IPv6
      // TODO :
      //
      //
      //
      return (
        ((+dots[0] * 256 + +dots[1]) * 256 + +dots[2]) * 256 +
        +dots[3] * 256 +
        +dots[4] * 256 +
        +dots[5]
      )
    }
    return false, ip
  }

  res.json({
    ip: ip,
    ip_decimal: convertIpToDecimal(),
    headers: req.headers,
  })

  next()
})

app.use('/ip', cors(), (req, res, next) => {
  const ip = req.get('x-forwarded-for') || req.connection.remoteAddress
  res.send(ip)
  next()
})

app.use('/ua', cors(), (req, res, next) => {
  const ua = (res.locals.ua = req.get('User-Agent'))
  res.send(ua)
  next()
})

app.use('/lang', cors(), (req, res, next) => {
  const lang = (res.locals.lang = req.get('accept-language'))
  res.send(lang)
  next()
})

app.use('/port', cors(), (req, res, next) => {
  res.json({
    headers: req.headers,
  })
  next()
})

app.use('/via', cors(), (req, res, next) => {
  const via = (res.locals.via = req.get('vie'))
  res.send(via)
  next()
})

app.use('/connection', cors(), (req, res, next) => {
  const connection = (res.locals.connection = req.get('Connection'))
  res.send(connection)
  next()
})

app.listen(port, error => {
  if (error) {
    console.log(error)
  }
  return console.log(`Ifconfig is now listening at ${port}`)
})
