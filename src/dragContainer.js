/**
 * @flow
 */

import React, { Component } from 'react'
import Draggable from 'react-draggable'
import _ from 'lodash'
import { isArrayEqual } from './utils'
import DragScale from './dragScale'

export type Position={ x: number, y: number, }
export type Size = { width: number, height: number }

/**
 * @param current  当前图片大小
 * @param lastSize 上一次图片大小
 * @param initSize 图片经过计算后的初始大小
 * @param actual   图片的实际大小
 */
export type typeSize = 'current' | 'lastSize' | 'initSize' | 'actual'

type Point = {
  id: string, x: number, y: number, offset: {left: number, top: number}
}

type Props={
  img: string,
  points: Array<any>,
  disabled: boolean,
  scaleable:boolean,
  draggable:boolean,
  maxZoom:number, //最大的放大值
  onDragStop?: Function,
  onSingleDragStop?: Function,
  onDrag?: Function,
  onSizeChange?:Function,
  children:?ReactElement<any>,
}

type State={
    // controlledPosition:Position,
    controlledPositions: {[string]: Point},
    size: {[typeSize]: Size}
}

export default class dragContainer extends Component<any, Props, State> {
  state: State

  dragPoints: HTMLElement
  parentPosition: Position = { x: 0, y: 0 } // 图片的位置
  willComplete:boolean = false
  isComplete: boolean = false// 点位跟图片是否初始化完成

  static defaultProps = {
    scaleable:true,
    disabled:false,
    draggable:true,
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      size: {
        current: { width: 0, height: 0 },
        initSize: { width: 0, height: 0 },
        actual: { width: 0, height: 0 },
      },
      controlledPositions: {},
      // controlledPosition:{x:0,y:0},
    }
  }

  componentWillMount() {
    const { points } = this.props
    const { controlledPositions } = this.state
    if (points && points.length > 0) {
      points.map((item) => {
        controlledPositions[item.id] = { offset: { left: 0, top: 0 }, ...item }
      })
      this.state.controlledPositions = controlledPositions
    }
  }

  componentDidMount() {

  }

  /**
   * @param {*} nextProps
   * props 只需要判断 {x,y,id}这三种属性，最好变成对象进行比较，需要优化
   */
  componentWillReceiveProps(nextProps: Props) {
    const { points, img } = this.props
    const nextPoints = nextProps.points
    const { controlledPositions, size } = this.state
    // 传入的点位不相等，并且图片已经加载完成
    let newPoints = [],
      newNextPoints = []
    if (points && points.length > 0) {
      newPoints = points.map(item => ({ x: item.x, y: item.y, id: item.id }))
    }
    if (nextPoints && nextPoints.length > 0) {
      newNextPoints = nextPoints.map(item => ({ x: item.x, y: item.y, id: item.id }))
    }
    //切换图片
    if (img !== nextProps.img) {
      size.actual = { width: 0, height: 0 }
      size.current = { width: 0, height: 0 }
      size.lastSize = null
      this.setState({ size, controlledPositions:{} })
      // this.willComplete = false
      return
    }
    if (!isArrayEqual(newPoints, newNextPoints) && size.current.width > 0) {
      nextPoints.map((item) => {
        controlledPositions[item.id] = this.calculatePosition(item)
      })
      this.setState({ controlledPositions })
      // this.willComplete = true
    }
  }

  /**
   * 还有问题
   * @param {*} nextProps
   * @param {*} nextState
   */
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // return !(_.isEqualWith(this.props,nextProps) && _.isEqualWith(this.state,nextState)) || !this.isComplete || !this.willComplete
    return true
  }

  imageOnLoad = (e: Event) => {
    const { size } = this.state
    const { target } = e
    if (target instanceof HTMLImageElement) {
      const { naturalWidth, naturalHeight } = target
      size.actual = { width: naturalWidth, height: naturalHeight }
      this.setState({ size })
    }
  }

  /**
   * 初始化操作，图片加载计算完成后只会执行一次
   * this.complete 代表有points属性时，是否已经成功初始化，初始值为false
   * 参数有points点位跟图片，如果图片先加载，则在willreceiveProps里接受props参数，进行点位的初始化计算，如果图片属于后加载，则在onLoad事件中获得图片大小后
   * 进行点位的初始化计算。图片加载完成后，如果图片有变动，也在willreceiveProps里面进行重新初始化
   */
  initCalculatePoints = () => {
    const { controlledPositions } = this.state
    if (!this.isComplete && this.props.points && this.props.points.length > 0) {
      const { points } = this.props
      points.map((item) => {
        controlledPositions[item.id] = this.calculatePosition(item)
      })
      // this.willComplete = true
      // this.isComplete = false
    }
    // const positionKeys = Object.keys(controlledPositions)
    // positionKeys.map(item=>{
    //   return controlledPositions[item] = this.calculatePosition(controlledPositions[item])
    // })
    this.setState({ controlledPositions })
  }

  /** 
   * 初始化图片位置跟改变图片位置,父容器大小变化的时候调用
   * @param position 图片的最新位置
   * sclakX,sclaKY 为 图片距离上次移动的距离
   * @tooltip 图片位置为发生更改时也会执行，需要修改
   */
  changePosition = (position: {x: number, y: number}) => {
    const { parentPosition } = this
    const { controlledPositions } = this.state
    // console.log(parentPosition)
    const positions = Object.keys(controlledPositions)
    const sclakX = position.x - parentPosition.x
    const sclakY = position.y - parentPosition.y
    positions.map((item) => {
      const { x, y, id } = controlledPositions[item]
      controlledPositions[item] = { ...controlledPositions[item], x: x + sclakX, y: y + sclakY, id }
    })
    this.parentPosition = position
    this.setState({ controlledPositions })
  }

  /**
   * 大小变化，所有对应的点位 位置都要改变
   * @param position 图片的位置
   * parentPosition 为上一次图片的位置
   */
  onSizeChange = (initSize: Size, newSize: Size, position: Position) => {
    const { parentPosition } = this
    const { controlledPositions, size } = this.state
    const { width, height } = newSize
    let { lastSize } = size
    if (!lastSize) {
      lastSize = { ...initSize }
    }
    const positions = Object.keys(controlledPositions)
    const parentX = parentPosition.x
    const parentY = parentPosition.y
    if (positions.length > 0) {
      positions.map((item) => {
        // 重新进行偏移，将偏移量加回
        let { x, y, id, offset } = controlledPositions[item]
        const { left = 0, top = 0 } = offset
        x += left
        y += top
        const scaleX = (x - parentX) / lastSize.width
        const scaleY = (y - parentY) / lastSize.height
        const newX = width * scaleX + position.x
        const newY = height * scaleY + position.y
        const newPosition = { x: newX - left, y: newY - top }
        controlledPositions[item] = { ...newPosition, id, offset }
      })
    }
    size.lastSize = { width, height }
    size.current = { width, height }
    this.parentPosition = position
    const { onSizeChange } = this.props
    onSizeChange && onSizeChange(newSize)
    this.setState({ controlledPositions, size })
  }

  /**
   * 获取边界值，未完成
   */
  getboundPosition = (id:string) => {
    let outBound = false
    const { parentPosition } = this
    const { size, controlledPositions } = this.state
    // const { x, y } = position
    const { width, height } = size.current
    const { x: parentX, y: parentY } = parentPosition
    let { x, y, offset: { top, left } } = controlledPositions[id]
    const bounds = { top: parentY - top, left: parentX - left, right: parentX + width - left, bottom: parentY + height - top }
    if(x> bounds.right || x <bounds.left){
      x = x> bounds.right? bounds.right : bounds.left
      outBound = true
    }
    if(y> bounds.bottom || y <bounds.top){
      y = y> bounds.bottom? bounds.bottom : bounds.top
      outBound = true
    }
    if(outBound){
      controlledPositions[id] = { ...controlledPositions[id], x, y }
      this.setState(controlledPositions)
    }
    // if (!size.lastSize) {
    //   size.lastSize = { ...size.initSize }
    // }
    // if (x < parentPosition.x || y < parentPosition.y || x > (parentPosition.x + width) || y > (parentPosition.y + height)) {
    //   // return false
    // }
    // return { x, y }
  }

  /**
   * 控制点位的拖动
   * @param id 点位的id(唯一标识符)
   * @param postition 点位的位置
   */
  onControlledDrag = (id: string, position: Position) => {
    const { controlledPositions } = this.state
    controlledPositions[id] = { ...controlledPositions[id], ...position, id }
    // this.getboundPosition(id)
    this.setState({ controlledPositions })
  }

  /**
   * 控制单个点位移动结束后执行
   * @param {*} position 点位的位置
   */
  onSingleControlledDragStop = (id: string) => {
    const { onSingleDragStop } = this.props
    this.getboundPosition(id)
    if (!onSingleDragStop) {
      return
    }
    const { controlledPositions } = this.state
    const newPoint = this.getActualPosition(controlledPositions[id])
    onSingleDragStop(newPoint)
  }

  /**
   * 控制点位移动结束后执行
   * @param {*} position 点位的位置
   */
  onControlledDragStop = (id: string, position: Position) => {
    const { onDragStop, disabled } = this.props
    if (disabled) { return }
    this.onSingleControlledDragStop(id)
    if (!onDragStop) {
      return
    }
    // this.onControlledDrag(e, position)
    const { controlledPositions } = this.state
    const positionsKey = Object.keys(controlledPositions)
    const positions = positionsKey.map(item =>
      this.getActualPosition(controlledPositions[item]),
    )
    onDragStop(positions)
  }

  /**
   * 传入未经计算过的点位信息，返回相对于拖动层的图片位置,带偏移量的点需要进行偏移校正
   * @param point 点位信息
   */
  calculatePosition = (point: Point): Point => {
    const { parentPosition } = this
    const { size } = this.state
    const { x, y, offset } = this.shiftPoint(point)
    // 当前点位距离图片的长宽（位置）
    const width = point.x
    const height = point.y
    const { current, actual } = size
    // 图片压缩或者放大后的比例
    const scale = current.width / actual.width
    const newWidth = width * scale
    const newHeight = height * scale

    const newX = newWidth + parentPosition.x - offset.left
    const newY = newHeight + parentPosition.y - offset.top


    return ({ ...point, x: newX, y: newY, offset })
  }

  /**
   * 进行点位的坐标偏移，点位初始化时需要进行偏移操作，往后操作的都是偏移后的点，
   * 进行缩放时，减去的偏移量需要重新加回后进行计算
   */
  shiftPoint = (point: Point): Point => {
    const { offset = { left: 0, top: 0 } } = point
    const x = point.x - offset.left
    const y = point.y - offset.top
    return { ...point, x, y, offset }
  }

  /**
   * 获取到点位的真实坐标
   * @param point 点位信息
   */
  getActualPosition = (point: Point) => {
    const { parentPosition } = this
    const { size } = this.state
    const { x, y, id, offset } = point
    const width = x - parentPosition.x + offset.left
    const height = y - parentPosition.y + offset.top
    const { current, actual } = size
    const scale = actual.width / current.width
    const newWidth = width * scale
    const newHeight = height * scale
    // newWidth += offset.left
    // newHeight += offset.top
    return ({ x: Number(newWidth.toFixed(2)), y: Number(newHeight.toFixed(2)), id })
  }

  // 重置边界的位置
  getMaxMinPosition = (position: Position) => {

  }

  // 如果类型为initSize时，把currentSize 重置为initSize  说明初始化了
  setSize = (type: typeSize, newsize: Size) => {
    const { size } = this.state
    if (type === 'initSize') {
      size.current = { ...newsize }
    }
    size[type] = { ...newsize }
    this.setState({ size })
  }

  setParentPosition = (position: Position) => {
    this.parentPosition = { ...position }
    const { onSizeChange } = this.props
    onSizeChange && onSizeChange(this.state.size.initSize)
  }

  /**
   * 生成可拖动的点位
   */
  getDraggablePoints = (points: Array<any>) => {
    // const { parentPosition } = this
    const { controlledPositions, size } = this.state
    const { disabled } = this.props
    const isEdit = !disabled
    const { width, height } = size.current
    if (!points || points.length === 0 || width === 0 || height === 0) {
      return
    }
    // const { x: parentX, y: parentY } = parentPosition

    try {
      const newPoints = points.map((items) => {
        const { x, y, offset: { top, left } } = controlledPositions[items.id]
        // const bounds = { top: parentY - top, left: parentX - left, right: parentX + width - left, bottom: parentY + height - top }
        
        return (
          <Draggable
            key={items.id}
            /* bounds={bounds} */
            position={{ x, y }}
            onStop={(e, position: Position) => this.onControlledDragStop(items.id, position)}
            onDrag={isEdit ? (e, position: Position) => this.onControlledDrag(items.id, position) : () => false}
          >
            <div className="dragPoint" style={{ position: 'absolute', top: y, left: x }} data-id={items.id}>
              {items.content}
            </div>
          </Draggable>
        )
      })
      return newPoints
    } catch (error) {
      return null
    }
  }

  render() {
    const { size } = this.state
    const { img, points, children, maxZoom, scaleable, draggable } = this.props
    const dragPoints = (
      <div style={{ position: 'absolute', top: '0px', left: '0px', height: '0px' }} ref={rn => this.dragPoints = rn}>
        {this.getDraggablePoints(points)}
      </div>
    )

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <DragScale
          draggable={draggable}
          scaleable={scaleable}
          maxZoom={maxZoom}
          changePosition={this.changePosition}
          onSizeChange={this.onSizeChange}
          setSize={this.setSize}
          initCalculatePoints={this.initCalculatePoints}
          setParentPosition={this.setParentPosition}
          dragPoints={dragPoints}
          actualImageSize={size.actual}
        >
          <div>
            {img ?<img style={{ width: '100%', height: '100%' }} onLoad={this.imageOnLoad} src={img} />:null}
            {children}
          </div>
        </DragScale>
      </div>
    )
  }
}
