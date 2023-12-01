import express from 'express'
import {config } from 'dotenv'
config({path:'./config/dev.config.env'})
import userRouter from './src/modules/User/user.routes.js'
import { globalResponseHandler } from './src/utils/errorHandling.js'
import db_connection from './DB/connection.js'

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use('/api/users', userRouter)
db_connection()

app.use(globalResponseHandler)

app.all('*', (req, res, next) =>
  res.status(404).json({ message: '404 Not Found URL' }),
)


app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))