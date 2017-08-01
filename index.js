// import DragSacle from './lib'
// import * as Dragzoom from './dist/react-dragScale'
// console.log(Dragzoom)
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Dragzoom from './src';

ReactDOM.render(
  <Dragzoom img="http://seopic.699pic.com/photo/00044/9957.jpg_wh1200.jpg" />,
    document.getElementById('root'),
);
