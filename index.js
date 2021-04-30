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

async function getData() {
  try {
    const res = await pool.query(
      "SELECT * FROM track_points",
      (err, res) => {
        if (err) {
          throw err
        }
        console.log('getData, res- ', res.rows[0])
        return JSON.stringify(res.rows)
      }
    )
  } catch (err) {
    return err.stack
  }
}

async function getDist(locationOneLatLon, locationTwoLatLon) {
  const query = "SELECT ST_DISTANCE" +
    "(ST_GeographyFromText('POINT(" + `${locationOneLatLon[0]} ` + `${locationOneLatLon[1]}` + ")')," +
    "ST_GeographyFromText('POINT(" + `${locationTwoLatLon[0]} ` + `${locationTwoLatLon[1]}` + ")'));"
  try {
    var dist = await pool.query(
      query
    )
      .then((data) => {
        return data.rows[0].st_distance
      })
  } catch (err) {
    return err.stack
  }
  console.log("getDist, var dist- ", dist)
  return dist
}

app.get('/222', async (req, result) => {
  // get all points -- PSQL Query
  var points = await pool.query("SELECT * FROM track_points")
  console.log('points.rows[0]', points.rows[0])
  points = points.rows
  // rawData = JSON.parse(rawData)
  console.log('rawData-', points[0])
  var stateKeyedQueries = {}
  for (var i = 0; i < points.length - 2; i++) {
    console.log(i, ' forLoop rawData- ', points[i])
    // establish states of points -- Library
    var stateName = reverse.lookup(points[i].lat, points[i].lon, 'us').state
    var nextStateName = reverse.lookup(points[i + 1].lat, points[i + 1].lon, 'us').state

    console.log('stateName- ', stateName, '|| nextStateName- ', nextStateName)
    if (stateName === nextStateName) {
      console.log('equality test- ', stateName === nextStateName)
      let stateLatLon = [points[i].lat, points[i].lon]
      let nextStateLatLon = [points[i + 1].lat, points[i + 1].lon]
      if (stateKeyedQueries[stateName] === undefined) {
        stateKeyedQueries[stateName] = []
      }
      stateKeyedQueries[stateName].push("SELECT ST_DISTANCE" +
        "(ST_GeographyFromText('POINT(" + `${stateLatLon[0]} ` + `${stateLatLon[1]}` + ")')," +
        "ST_GeographyFromText('POINT(" + `${nextStateLatLon[0]} ` + `${nextStateLatLon[1]}` + ")'));")
    }
    // if (i === 1000) {
    //   break
    // }
  }
  // get distance of points -- PostGis Query
  // var keyList = Object.keys(stateKeyedQueries)
  // var promisedArr = []
  for (var state in stateKeyedQueries) {
    var i = 0
    console.log('for in- ', i, state)
    i++
    // console.log("stateKeyedQueries- ", stateKeyedQueries)
    var promises = stateKeyedQueries[state].map((queryString) => pool.query(queryString))
    // console.log('promises- ', promises)
    var promisedQueries = await Promise.all(promises)
    stateKeyedQueries[state] = promisedQueries.map(queryResult =>
      queryResult.rows[0].st_distance
    )
  }
  console.log('stateKeyedQueries w/ st_distance- ', stateKeyedQueries)
  result.send(JSON.stringify(stateKeyedQueries))
  // add up distance traveled in each state -- Basic JS
  // return state distances traveled -- result.send()


  // var rawData = [] //await getData()
  // let stateTotals = {}
  // pool.query("SELECT * FROM track_points")
  //   .then(res => {
  //     console.log('res.rows[0]', res.rows[0])
  //     rawData = res.rows
  //     // rawData = JSON.parse(rawData)
  //     console.log('rawData-', rawData[0])
  //     var testArr = []
  //     for (var i = 0; i < rawData.length; i++) {
  //       console.log(i, ' forLoop rawData- ', rawData[i])

  //       var stateName = reverse.lookup(rawData[i].lat, rawData[i].lon, 'us').state
  //       var nextStateName = reverse.lookup(rawData[i + 1].lat, rawData[i + 1].lon, 'us').state

  //       console.log('stateName- ', stateName, '|| nextStateName- ', nextStateName)
  //       if (stateName === nextStateName) {
  //         let stateLatLon = [rawData[i].lat, rawData[i].lon]
  //         let nextStateLatLon = [rawData[i + 1].lat, rawData[i + 1].lon]
  //         testArr.push("SELECT ST_DISTANCE" +
  //           "(ST_GeographyFromText('POINT(" + `${stateLatLon[0]} ` + `${stateLatLon[1]}` + ")')," +
  //           "ST_GeographyFromText('POINT(" + `${nextStateLatLon[0]} ` + `${nextStateLatLon[1]}` + ")'));")
  //         console.log('equality test- ', stateName === nextStateName)
  //       }
  //       if (i === 50) {
  //         break
  //       }
  //     }
  //     return testArr
  //   })
  //   .then(async res => {
  //     var compiledData = []
  //     compiledData = await new Promise((resolve, reject) => {
  //       var collector = []
  //       res.forEach(async item => {
  //         var itemQuery = await pool.query(item)
  //         console.log('st_distance query result- ', itemQuery.rows[0].st_distance)
  //         collector.push(itemQuery.rows[0].st_distance)
  //       })
  //       resolve(collector)
  //     })
  //     console.log('compiledData- ', compiledData)
  //     return compiledData
  //   })
  //   .then(res => {
  //     console.log('final data- ', res)
  //     result.status(200).send(JSON.stringify(res))
  //   })
})

app.get('/test', async (req, result) => {
  const query = "SELECT ST_DISTANCE" +
    "(ST_GeographyFromText('POINT(" + `38.413551 ` + `-82.577080` + ")')," +
    "ST_GeographyFromText('POINT(" + `38.412350 ` + `-82.575912` + ")'));"
  var dist = await getDist([`38.413551 `, `-82.577080`], [`38.412350 `, `-82.575912`])
  console.log(dist)
  result.status(200).send(JSON.stringify(dist))
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



 // var dist //= await getDist(stateLatLon, nextStateLatLon)
  // pool.query(query)
  //(err, res) => {
  //   pool.release()
  //   console.log('second pool- ', res)
  //   if (err) {
  //     throw err
  //   }

  //   console.log('st_distance query- ', res.rows[0])
  //   dist = res.rows[0].st_distance
  //   console.log('st_distance- ', dist)
  //   if (stateTotals[stateName]) {
  //     stateTotals[stateName] += dist
  //   } else {
  //     stateTotals[stateName] = dist
  //   }

  // })
  // .then(res => {
  //   console.log('st_distance query- ', res.rows[0])
  //   dist = res.rows[0].st_distance
  //   console.log('st_distance- ', dist)
  //   if (stateTotals[stateName]) {
  //     stateTotals[stateName] += dist
  //   } else {
  //     stateTotals[stateName] = dist
  //   }
  // })
  // }
  // console.log('stateTotals- ', stateTotals)
  // continue
  // }
  // })

  // rawData.forEach((point, index, rawData) => {
  //   let stateLatLon = [rawData[index].lat, rawData[index].lon]
  //   let nextStateLatLon = [rawData[index + 1].lat, rawData[index + 1].lon]
  //   const query = "SELECT ST_DISTANCE" +
  //     "(ST_GeographyFromText('POINT(" + `${stateLatLon[0]} ` + `${stateLatLon[1]}` + ")')," +
  //     "ST_GeographyFromText('POINT(" + `${nextStateLatLon[0]} ` + `${nextStateLatLon[1]}` + ")'));"

  //   var stateName = reverse.lookup(rawData[index].lat, rawData[index].lon, 'us').state
  //   var nextStateName = reverse.lookup(rawData[index + 1].lat, rawData[index + 1].lon, 'us').state

  //   if (stateName === nextStateName) {
  //     var dist = await getDist(stateLatLon, nextStateLatLon)
  //     if (stateTotals[stateName]) {
  //       stateTotals[stateName] += 1
  //     }
  //   }
  // })

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
