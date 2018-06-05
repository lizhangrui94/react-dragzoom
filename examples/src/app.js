import React from 'react'
import Dragzoom, { DragzoomPolygon, DragzoomItems, DragzoomItem } from 'react-dragzoom'

const Polygon = DragzoomPolygon.Polygon
export default class App extends React.Component{
  state = {
    img: 'http://www.pconline.com.cn/pcedu/photo/0604/pic/060429cg03.jpg',
    polygonData: [],
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({x:150,y:150})
      // this.setState({ img: 'https://i4.3conline.com/images/piclib/201211/21/batch/1/155069/1353489276201ambt3yjnlw_medium.jpg' })
      // this.setState({ img: 'http://www.pconline.com.cn/pcedu/photo/0604/pic/060429cg03.jpg'})
    }, 3000)
  }

  controlPaint = (context, { id, path}) => {
    // if(id === '10') {
    //   return
    // }
    context.strokeStyle = '#000000'
    context.fillStyle = '#ff0000'
    context.lineWidth = 1
    context.rect(path[0][0], path[0][1], path[3][0]-path[0][0], path[3][0]-path[0][0])
    return 1
  }

  dragControlPaint = (context, { id, path}) => {
    context.strokeStyle = '#000000'
    context.fillStyle = '#ff000050'
    context.lineWidth = 5
    context.rect(path[0][0], path[0][1], path[3][0]-path[0][0], path[3][0]-path[0][0])
    return 1
  }

  capturePosition = (positions) => {
    // const [[x1, y1], [x2, y2]] = positions
    // this.setState({polygonData: [[x1, y1], [x2, y2]]})
  }

  render() {
    return (
      [
        <Dragzoom
          key="1"
          img={this.state.img}
          polygonDragDisabled={false}
          controlPaint={this.controlPaint}
          dragControlPaint={this.dragControlPaint}
        >
          {/* <DragzoomPolygon key="2" capturePosition={this.capturePosition} capture={false}>
            {new Array(10).fill(null).map((item, index) =>
              <Polygon key={index+2} polygonDrag id={index+2} path={[[100,100],[100,300],[300,100],[300,300]]}/>
            )}
            
            <Polygon id='1' polygonDrag path={[[200,200],[200,400],[400,200],[400,400]]}/> */}
            {/* <Polygon id='10' polygonDrag path={this.state.polygonData} /> */}
          {/* </DragzoomPolygon> */}
          <DragzoomItems>
            <DragzoomItem key={this.state.x || 10} disabled position={{x: this.state.x || 0, y: this.state.y || 0}} offset={{top:10,left:10}} >
              <span style={{background:'#000',display:'inline-block',width:'20px',height:'20px'}}></span>
            </DragzoomItem>
            {/* <DragzoomItem key="4" position={{x:200, y:200}} offset={{top:10,left:10}} >
              <span style={{background:'#000',display:'inline-block',width:'20px',height:'20px'}}></span>
            </DragzoomItem> */}
          </DragzoomItems>
        </Dragzoom>
      ]
    )
  }
}