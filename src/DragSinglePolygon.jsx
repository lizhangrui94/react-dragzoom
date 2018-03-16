/**
 * @flow
 */
import React from 'react'
import type { Size, Position } from './Dragzoom'
import { addEvent, removeEvent } from './utils'

type Path = Array<[number, number]>

type Props = {
  id: string,
  path: Path,
  containerSize: Size,
  currentPosition: Position,
  controlPaint: (context:CanvasRenderingContext2D ,props:{id:string,path:Path}) => mixed,
  calculateAllPosition: (Path, a?:{x:number, y:number}) => Path,
  onPolygonSelect: Function,
  savePolygonPath: Function,
}

type State = {

}

export default class DragSinglePolygon extends React.Component<Props, State> {

  canvas: HTMLCanvasElement
  context2D: CanvasRenderingContext2D
  path: Array<[number, number]>
  position: [number, number] | null = null

  componentDidMount() {
    this.initCanvas()
    // addEvent(this.canvas, 'click', this.handleClick)
  }

  componentWillReceiveProps(nextProps: Props) {
    this.updataCanvas(nextProps)
  }
  
  componentWillUnMount() {
    // removeEvent(this.canvas, 'click', this.handleClick)
  }

  initCanvas = () => {
    const { containerSize } = this.props
    this.context2D = this.canvas.getContext("2d")
    this.canvas.width = containerSize.width
    this.canvas.height = containerSize.height
    this.updataCanvas(this.props)
  }

  renderPolygon = (id: string, path: Path) => {
    const context2D = this.context2D
    context2D.beginPath()
    const { controlPaint } = this.props
    const defaultPaint = !controlPaint || !controlPaint(context2D, {id, path})
    if (defaultPaint) {
      path.forEach((point, index) => {
        const [x, y] = point
        if(index ===0) context2D.moveTo(x,y)
        else context2D.lineTo(x, y)
        if(path.length === index+1) context2D.lineTo(path[0][0], path[0][1])
      })
    }
    context2D.stroke()
    context2D.closePath()
  }

  updataCanvas = (props: Props) => {
    const {
      id,
      containerSize,
      currentPosition,
    } = props
    const context2D = this.context2D
    context2D.clearRect(0, 0, containerSize.width, containerSize.height)
    const path = props.calculateAllPosition(props.path, currentPosition)
    this.renderPolygon(id, path)
    this.props.savePolygonPath(path)
    this.position = null
  }

  render() {
    return (
      <canvas
        ref={ (rn: any) => this.canvas = rn}
        style={{ position: 'absolute', top: '0px', left: '0px', bottom: '0px', right: '0px' }}>
      </canvas>
    )
  }
}
