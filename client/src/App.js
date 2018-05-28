import React, { Component } from 'react';

import DrawingForm from './components/Drawing/Form';
import DrawingList from './components/Drawing/List';
import Drawing from './components/Drawing/Drawing';
import Connection from './components/UI/Connection';

class App extends Component {
  state = {};

  selectDrawing = (drawing) => {
    this.setState({
      selectedDrawing: drawing
    });
  };

  render() {
    let ctrl = (
      <div>
        <DrawingForm />
        <DrawingList selectDrawing={this.selectDrawing} />
      </div>
    );

    if (this.state.selectedDrawing) {
      ctrl = (
        <Drawing
          drawing={this.state.selectedDrawing}
          key={this.state.selectedDrawing.id}
        />
      );
    }

    return (
      <div className="App">
        <div className="App-header">
          <h2>Our awesome drawing app</h2>
        </div>
        <Connection />
        {ctrl}
      </div>
    );
  }
}

export default App;
