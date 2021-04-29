const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const Pool = require("pg").Pool
const reverse = require('reverse-geocode')

const app = express()
const pool = new Pool({
  user: 'docker',
  host: 'localhost',
  database: 'gis',
  password: 'docker',
  port: 25432
})


app.use(cors())
app.use(bodyParser.json())

async function getData = () {
  try {
    const res = await pool.query(

    )
  }
}

app.get('/', (req, result) => {
  let rawData = await pool.query(
    "SELECT * FROM track_points",
    (err, res) => {
      if (err) {
        throw err
      }
      console.log('Data fetch success', new Date())
      result.send(JSON.stringify(res.rows))
    })
  let stateTotals = {}
  rawData.forEach((point, index, rawData) => {
    let stateLatLon = [rawData[index].lat, rawData[index].lon]
    let nextStateLatLon = [rawData[index + 1].lat, rawData[index + 1].lon]
    const query = "SELECT ST_DISTANCE" +
      "(ST_GeographyFromText('POINT(" + `${stateLatLon[0]} ` + `${stateLatLon[1]}` + ")')," +
      "ST_GeographyFromText('POINT(" + `${nextStateLatLon[0]} ` + `${nextStateLatLon[1]}` + ")'));"

    var stateName = reverse.lookup(rawData[index].lat, rawData[index].lon, 'us').state
    var nextStateName = reverse.lookup(rawData[index + 1].lat, rawData[index + 1].lon, 'us').state

    if (stateName === nextStateName) {
      var dist = await pool.query(query)
      if (stateTotals[stateName]) {
        stateTotals[stateName] +=
        }
    }
  })
})

app.get('/stateDist', (req, result) => {
  console.log('req- ', req)
  // console.log('stateDist, request- ', request)
  const state1 = req.query.state
  const state2 = req.query.state2
  const query = "SELECT ST_DISTANCE" +
    "(ST_GeographyFromText('POINT(" + `${state1} ` + `${state1}` + ")')," +
    "ST_GeographyFromText('POINT(" + `${state2} ` + `${state2}` + ")'));"
  console.log('query- ', query)
  pool.query(
    query,
    (err, res) => {
      if (err) {
        throw err
      }
      console.log('st_distance- ', res.rows[0].st_distance)
      result.send(JSON.stringify(res.rows[0].st_distance))
    }
  )
})

app.listen(8000, () => {
  console.log('server OK')
})



// let rawData = await pool.query(
//   "SELECT * FROM track_points",
//   (err, res) => {
//     if (err) {
//       throw err
//     }
//     console.log('Data fetch success', new Date())
//     result.send(JSON.stringify(res.rows))
//   })

// console.log('row 1- ', res.rows[0])

// const query = "SELECT ST_DISTANCE" +
//   "(ST_GeographyFromText('POINT(" + `${Number(res.rows[0].lon)} ` + `${Number(res.rows[0].lat)}` + ")')," +
//   "ST_GeographyFromText('POINT(" + `${state2} ` + `${state2}` + ")'));"
// console.log('query- ', query)
// pool.query(
//   query,
//   (err, res) => {
//     if (err2) {
//       throw err2
//     }
//     console.log('ST_Distance-', res2)
//     dist = res2.rows[0].st_distance
//     console.log('distnace from res2- ', res2.rows[0].st_distance)
//   }
// )

// var stateDist = {}
// // console.log('res.rows ', res.rows)
// for (var i = 0; i < res.rows.length; i++) {
//   const query = "SELECT ST_DISTANCE" +
//     "(ST_GeographyFromText('POINT(" + `${Number(res.rows[i].lon)} ` + `${Number(res.rows[i].lat)}` + ")')," +
//     "ST_GeographyFromText('POINT(" + `${Number(res.rows[i + 1].lon)} ` + `${Number(res.rows[i + 1].lat)}` + ")'));"
//   var distance = pool.query(
//     query,
//     (err, res2) => {
//       if (err2) {
//         throw err2
//       }
//       console.log('distnace from res2- ', res2.rows[0].st_distance)
//       return res2.rows[0].st_distance
//     }
//   )
//   const state = reverse.lookup(res.rows[i].lat, res.rows[i].lon, 'us').state
//   const state2 = reverse.lookup(res.rows[i + 1].lat, res.rows[i + 1].lon, 'us').state

//   const stateCheck = (state, state2) => {
//     console.log('state lookup- ', state, state2)
//     if (state.length !== state2.length) {
//       return false
//     }
//     for (var j = 0; j < state.length; j++) {
//       if (state[j] !== state2[j]) {
//         return false
//       }
//     }
//     return true
//   }
//   if (stateCheck(state, state2) === true) {
//     if (stateDist.state === undefined) {
//       stateDist.state += distance
//     }
//   }
// }
// console.log('query- ', query)
