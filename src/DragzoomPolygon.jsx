/**
 * @flow
 */
import React from 'react'
import type { Size, Position } from './Dragzoom'
import { addEvent, removeEvent } from './utils'

const compareProps = ['containerSize', 'currentPosition', 'currentSize']

function isEqual(a, b): boolean {
  const newa = compareProps.map(key => a[key])
  const newb = compareProps.map(key => b[key])
  return JSON.stringify(newa) === JSON.stringify(newb)
}

type Path = Array<[number, number]>

type Props = {
  path: Path,
  capture?: boolean,
  capturePosition: Function,
  currentSize: Size,
  actualImageSize: Size,
  containerSize: Size,
  currentPosition: Position,
  calculateAllPosition: (Path) => Path,
  getAllActualPosition: (Path) => Path,
  onPolygonDragStart: Function,

  children: any,
}

type State = {

}

export default class DragzoomPolygon extends React.Component<Props, State> {
  static isDragCanvasPolygon = 1
  static Polygon = () => null

  static defaultProps = {
    capturePosition: (a:[number,number]) => null
  }

  canvas: HTMLCanvasElement
  context2D: CanvasRenderingContext2D
  childPath: {[string]:Array<[number, number]>} = {} // 保存变化之后的位置
  dragPolygon: Object = {} // 保存拖动状态的图形
  currentPolygon: Object = {}
  position: [number, number] | void
  event: MouseEvent | void
  update: boolean = true // 是否更新

  componentDidMount() {
    this.initCanvas()
    addEvent(this.canvas, 'mousedown', this.dragStart)
  }

  componentWillReceiveProps(nextProps: Props) {
    if(this.update || !isEqual(this.props, nextProps)) { // TODO: 判断有误 会多次更新
      this.updataCanvas(nextProps)
    }
  }
  
  componentWillMount() {
    removeEvent(this.canvas, 'mousedown', this.dragStart)
  }

  setShouldUpdate = (bool: boolean) => {
    this.update = bool
  }

  /** 拖动状态取消后会触发此函数 */
  setPolygon = ({id, path}: { id:string, path: Array<[number, number]> }) => {
    this.currentPolygon = {id, path}
    this.childPath[id] = path
    delete this.dragPolygon[id]
  }

  dragStart = (e: MouseEvent) => {
    this.event = e
    this.redraw([e.offsetX, e.offsetY])
    if(this.props.capture) {
      const position = this.props.getAllActualPosition([[e.offsetX, e.offsetY]])
      this.props.capturePosition(position[0])
    }
  }

  redraw = (position: [number, number] | void) => {
    this.position = position
    this.updataCanvas(this.props)
  }

  initCanvas = () => {
    const { containerSize } = this.props
    this.context2D = this.canvas.getContext("2d")
    this.canvas.width = containerSize.width
    this.canvas.height = containerSize.height
    this.updataCanvas(this.props)
  }

  renderPolygon = (path: Path, props: { id: string, path: Path }) => {
    const context2D = this.context2D
    context2D.save()
    context2D.beginPath()
    context2D.strokeStyle = 'rgba(0,0,0,1)'
    context2D.lineWidth = 5
    path.forEach((point, index) => {
      const [x, y] = point
      if(index ===0) context2D.moveTo(x,y)
      else context2D.lineTo(x, y)
      if(path.length === index+1) context2D.lineTo(path[0][0], path[0][1])
    })
    if(this.position && !props.capture) {
      const [x, y] = this.position
      if(context2D.isPointInPath(x, y)){
        this.position = void 0
        this.dragPolygon[props.id] = true
        // path 为真实路径
        this.props.onPolygonDragStart(props.id, props.path, this.event)
        this.event = void 0
        context2D.strokeStyle = 'rgba(255,255,255,0)'
      }
    }
    context2D.stroke()
    context2D.closePath()
  }

  updataCanvas = (props: Props) => {
    const {
      containerSize,
      currentSize,
      actualImageSize,
      currentPosition,
      capture,
    } = props
    const context2D = this.context2D
    const {id: currentId, path: currentPath} = this.currentPolygon
    context2D.clearRect(0, 0, containerSize.width, containerSize.height)
    React.Children.forEach(props.children, child => {
      let { id, path } = child.props
      path = this.childPath[id] || path // 如果本地保存着path,则使用本地值
      if( currentId == id ) {
        this.renderPolygon(props.calculateAllPosition(currentPath), this.currentPolygon)
      }
      else {
        if (this.dragPolygon[id]) return  // 当前是否有处于拖动状态的图形
        this.renderPolygon(props.calculateAllPosition(path), { capture, id, path })
      }
      
    })
    this.position = void 0
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
