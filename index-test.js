// import DragScale from './lib/react-dragScale';
import React from 'react'
import ReactDOM from 'react-dom'
import DragScale from './src'

var points = []
for(var i=0;i<1;i++){
  points.push({id:i,x:100,y:100,content:<div><span style={{background:'#000',display:'inline-block',width:'20px',height:'20px'}}></span></div>, offset:{top:10,left:10}})
}

ReactDOM.render(
  <DragScale scaleable={true} draggable={true} maxZoom={100} img='http://pic29.nipic.com/20130520/9252150_155453366374_2.jpg' points={points}/>,
  document.getElementById('root')
)