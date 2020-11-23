const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const { APP_PORT } = process.env

// Import routes
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const friendRoute = require('./routes/friends')
const messageRoute = require('./routes/messages')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())
app.use('/uploads', express.static('assets/uploads'))

app.use('/', authRoute)
app.use('/', userRoute)
app.use('/', friendRoute)
app.use('/', messageRoute)

app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'Backend is running'
  })
})

app.listen(APP_PORT, () => {
  console.log(`App is listening on port ${APP_PORT}`)
})
