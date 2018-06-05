/**
 * @flow
 */
import React from 'react'
import type { Size, Position, Path } from './Dragzoom'
import { addEvent, removeEvent } from './utils'

const compareParentProps = ['containerSize', 'currentPosition', 'currentSize']
const compareProps = ['path', 'id']

function isEqual(a = {}, b = {}, property = {}): boolean {
  // $FlowFixMe
  const newa = property.map(key => a[key])
  // $FlowFixMe
  const newb = property.map(key => b[key])
  return JSON.stringify(newa) === JSON.stringify(newb)
}

function isParentPropsEqual(a, b): boolean %checks {
  return isEqual(a, b, compareParentProps)
}

function isPropsEqual(a, b): boolean %checks {
  return isEqual(a, b, compareProps)
}

type Props = {
  capture?: boolean,
  controlPaint: (context:CanvasRenderingContext2D ,props:{id:string,path:Path}) => mixed,
  capturePosition: Function,
  drawPolygon: Function,
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
    capturePosition: (a:[number,number]) => null,
    drawPolygon: () => null
  }

  canvas: HTMLCanvasElement
  context2D: CanvasRenderingContext2D
  childPath: {[string]:Path} = {} // 保存变化之后的位置
  lastPropsPath: {[string]:Path} = {} // 保存变化之后的位置
  dragPolygon: Object = {} // 保存拖动状态的图形
  position: [number, number] | void
  event: MouseEvent | void
  update: boolean = true // 是否更新
  coreData: Object | void

  componentDidMount() {
    this.initCanvas()
    addEvent(this.canvas, 'mousedown', this.dragStart)
    addEvent(this.canvas, 'mouseup', this.cancelMove)
    
  }

  componentWillReceiveProps(nextProps: Props) {
    if(this.update || !isParentPropsEqual(this.props, nextProps)) { // TODO: 判断有误 会多次更新
      this.updataCanvas(nextProps)
    }
  }
  
  componentWillMount() {
    removeEvent(this.canvas, 'mousedown', this.dragStart)
    removeEvent(this.canvas, 'mouseup', this.cancelMove)
    removeEvent(this.canvas, 'mousemove', this.dragMoveStart)
  }

  createCoreData = (x: number, y: number) => {
    if (!this.coreData) {
      this.coreData = {
        start: {x, y},
      }
    }
    this.coreData = {
      ...this.coreData,
      current: {x, y},
      deltaX: this.coreData.start.x - x,
      deltaY: this.coreData.start.y - y,
    }
  }

  setShouldUpdate = (bool: boolean) => {
    this.update = bool
  }

  /** 拖动状态取消后会触发此函数 */
  setPolygon = ({id, path}: { id:string, path: Path }) => {
    this.childPath[id] = path
    delete this.dragPolygon[id]
  }

  /** 准备开始拖动出图形 */
  dragStart = (e: MouseEvent) => {
    this.event = e
    this.redraw([e.offsetX, e.offsetY])
    if(this.props.capture) {
      const position = this.props.getAllActualPosition([[e.offsetX, e.offsetY]])
      this.props.capturePosition(position[0])
      addEvent(this.canvas, 'mousemove', this.dragMoveStart)
    }
  }

  /** 拖动鼠标变成图形 */
  dragMoveStart = (e: MouseEvent) => {
    this.createCoreData(e.offsetX, e.offsetY)
    if(!this.coreData) return
    const { start: { x: x1, y: y1 }, current: { x: x2, y: y2 } } = this.coreData
    const position = this.props.getAllActualPosition([[x1, y1], [x2, y2]])
    this.props.drawPolygon(position)
  }

  /** 取消图形变化 */
  cancelMove = () => {
    this.coreData = void 0
    removeEvent(this.canvas, 'mousemove', this.dragMoveStart)
  }

  redraw = (position: [number, number] | void) => {
    this.position = position
    this.updataCanvas(this.props)
  }

  initCanvas = () => {
    this.context2D = this.canvas.getContext("2d")
    this.updataCanvas(this.props)
  }

  renderPolygon = (path: Path, childProps: Object) => {
    const { capture, id, polygonDrag, path: childPath } = childProps
    const context2D = this.context2D
    context2D.save()
    context2D.beginPath()
    const { controlPaint } = this.props
    const defaultPaint = !controlPaint || !controlPaint(context2D, {id: id, path})
    if(defaultPaint) {
      context2D.strokeStyle = 'rgba(0,0,0,1)'
      context2D.fillStyle = 'rgba(255,255,255,0)'
      context2D.lineWidth = 1
      path.forEach((point, index) => {
        const [x, y] = point
        if(index === 0) context2D.moveTo(x,y)
        else context2D.lineTo(x, y)
        context2D.arc(x,y,5,0,2*Math.PI)
        // if(path.length === index+1) context2D.lineTo(path[0][0], path[0][1])
      })
    }
    // 选择要拖动的图形
    if(this.position && !capture && polygonDrag) {
      const [x, y] = this.position
      if(context2D.isPointInPath(x, y)){
        this.position = void 0
        this.dragPolygon[id] = true
        // path 为真实路径
        this.props.onPolygonDragStart(id, childPath, this.event)
        this.event = void 0
        context2D.strokeStyle = 'rgba(255,255,255,0)'
        context2D.fillStyle = 'rgba(255,255,255,0)'
      }
    }
    context2D.fill()
    context2D.stroke()
    context2D.closePath()
  }

  updataCanvas = (props: Props) => {
    const {
      containerSize: {width, height},
      currentSize,
      actualImageSize,
      currentPosition,
      capture,
    } = props
    this.canvas.width = width
    this.canvas.height = height
    const context2D = this.context2D
    context2D.clearRect(0, 0, width, height)
    React.Children.forEach(props.children, child => {
      let { id, path, polygonDrag } = child.props
      if (this.dragPolygon[id]) return  // 当前是否有处于拖动状态的图形
      const propsEqual = isPropsEqual({path:this.lastPropsPath[id]}, { path })
      // 如果props的值已经变化，则赋值给childPath, 并存为上一次的值，也适用于初始化
      if(!propsEqual) {
        this.lastPropsPath[id] = path
        this.childPath[id] = path
      }
      path = this.childPath[id] // 从childPath里取出对应的路径
      this.renderPolygon(props.calculateAllPosition(path), { capture, id, path, polygonDrag })
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
