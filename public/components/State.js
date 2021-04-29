import React from 'react'

class State extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <h1>{this.props.stateName}</h1>
        <div>{this.props.miles}</div>
      </div>
    )
  }
}
export default State