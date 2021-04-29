import React from 'react'
import State from './State'
const reverse = require('reverse-geocode')

class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      states: {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
      },
      rawData: [],
      isLoaded: false,
      stateDist: {
      },
      distanceTemp: 0
    }
  }

  componentDidMount() {
    var self = this
    fetch("http://localhost:8000/")
      .then(res => res.json())
      .then(
        (result) => {
          self.setState({
            isLoaded: true,
            rawData: result
          })
          console.log('rawData- ', this.state.rawData)
          for (var i = 0; i < self.state.rawData.length; i++) {
            let same = true
            var state = reverse.lookup(self.state.rawData[i].lat, self.state.rawData[i].lon, 'us').state
            var state2 = reverse.lookup(self.state.rawData[i + 1].lat, self.state.rawData[i + 1].lon, 'us').state
            if (state.length === state2.length) {
              for (var j = 0; j < state.length; j++) {
                if (state[j] !== state2[j]) {
                  same = false
                  break
                }
              }
            } else {
              same = false
            }
            if (same) {
              // let data = {
              //   state: self.state.rawData[i].lon + ' ' + self.state.rawData[i].lat,
              //   state2: self.state.rawData[i + 1].lon + ' ' + self.state.rawData[i + 1].lat
              // }
              var stateStr = self.state.rawData[i].lon + ' ' + self.state.rawData[i].lat
              var state2Str = self.state.rawData[i + 1].lon + ' ' + self.state.rawData[i + 1].lat
              fetch(`http://localhost:8000/stateDist?state=${stateStr}&state2=${state2Str}`)
                .then(res => res.json())
                .then(
                  (resDist) => {
                    console.log('distance- ', resDist)
                    self.setState({
                      distanceTemp: self.state.distanceTemp += resDist
                    })
                  }
                )
            }
          }
        }
      )
  }

  render() {
    const statesToRender = []
    // console.log('tempDist- ', this.state.distanceTemp)
    for (var stateAbrv in this.state.states) {
      var self = this
      statesToRender.push(<State stateName={self.state.states[stateAbrv]} key={stateAbrv} distance={self.state.stateDist[self.state.states[stateAbrv]]}></State >)
    }
    return (
      <div className='hello-world' >
        <h1>Hello World</h1>
        <p>Welcome to my worlD!!!</p>
        <h3>These are your states!</h3>
        { statesToRender}
        {this.state.distanceTemp}
      </div>
    )

  }
}
export default Main