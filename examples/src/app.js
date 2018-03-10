import React from 'react'
import Dragzoom, { DragzoomPolygon, DragzoomItems, DragzoomItem } from 'react-dragzoom'

const Polygon = DragzoomPolygon.Polygon
export default class App extends React.Component{
  state = {
    img: 'http://pic24.photophoto.cn/20120814/0005018348123206_b.jpg',
  }

  componentDidMount() {
    setTimeout(() => {
      // this.setState({ img: 'https://i4.3conline.com/images/piclib/201211/21/batch/1/155069/1353489276201ambt3yjnlw_medium.jpg' })
      // this.setState({ img: 'http://www.pconline.com.cn/pcedu/photo/0604/pic/060429cg03.jpg'})
    }, 3000)
  }

  render() {
    return (
      [
        <Dragzoom key="1" img={this.state.img} polygonDragDisabled={false}>
          <DragzoomPolygon capturePosition={console.log}>
            {new Array(1000).fill(null).map((item, index) =>
              <Polygon id={index+2} path={[[100,100],[100,300],[300,100],[300,300]]}/>
            )}
            
            <Polygon id='2' path={[[200,200],[200,400],[400,200],[400,400]]}/>
            {/* <Polygon /> */}
            {/* <Polygon /> */}
          </DragzoomPolygon>
          <DragzoomItems>
            <DragzoomItem key="1" position={{x:100, y:100}} offset={{top:10,left:10}} >
              <span style={{background:'#000',display:'inline-block',width:'20px',height:'20px'}}></span>
            </DragzoomItem>
            <DragzoomItem key="2" position={{x:200, y:200}} offset={{top:10,left:10}} >
              <span style={{background:'#000',display:'inline-block',width:'20px',height:'20px'}}></span>
            </DragzoomItem>
          </DragzoomItems>
        </Dragzoom>
      ]
    )
  }
}