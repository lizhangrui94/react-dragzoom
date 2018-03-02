/**
 * @flow
 */

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Draggable from 'react-draggable'
import { getinlinePosition, addEvent, removeEvent, throttle } from './utils'
import type { Position, Size, typeSize } from './dragContainer'


type Props = {
  scaleable: boolean,
  actualImageSize: Size, // 真实图片大小
  maxZoom:number, // 放大的最大值
  draggable: boolean,
  offsetParent?: HTMLElement | null,
  position?: Position, // 可以控制图片的位置
  changePosition: Function,
  onSizeChange: Function,
  initCalculatePoints: Function, // 初始化时计算点位
  setParentPosition: Function, // 向父组件传输图片位置
  setSize: (type: typeSize, Object)=>mixed, // 向父组件传输各类大小位置
  style?: Object,
  children: ReactElement<any>,
  dragPoints: ReactElement<any>,
}

export default class dragScale extends Component {
  drag: HTMLElement
  dragContainer: HTMLElement
  lastScale: {mouseX: number, mouseY: number}  // 存储上一次的鼠标位置
  refreshScale: {mouseX: number, mouseY: number}  // 存储上一次的鼠标位置
  totalScale: number // 总的缩放比例
  scaleNum: number // 缩放的比例,默认为1
  containerSize: Size // 父容器的大小
  containerPosition: {left: number, top: number} = { left: 0, top: 0 } // 容器在屏幕中的位置
  initPosition: Position // 在父元素中的初始位置
  throttle:Function

  static defaultProps = {
    offsetParent: null,
    maxZoom:2,
  }

  state: {
    bounds: {}, // 限制拖动的范围，暂时无效
    dragProps: {position: {x: number, y: number, onStart?: ()=>mixed, onDrag?: ()=>mixed}}, // 传入react-draggable的属性
    currentSize: Size, // 'currentSize 当前图片大小'
    initSize: Size, // 'initSize'图片在屏幕中的初始大小，不是图片的原大小,
    scaleNum: number, // 缩放的比例,默认为1
    canDraggable: boolean, // 图片是否已经可以拖动
    showScaleNum: boolean
  }
  constructor(props: Props) {
    super(props)
    this.state = {
      dragProps: { position: { x: 0, y: 0 }, onDrag: this.handleDrag, onStop:this.handleDragStop },
      bounds: { top: 0, right: 0, bottom: 0, left: 0 },
      initSize: { width: 0, height: 0 },
      currentSize: { width: 0, height: 0 },
      scaleNum: 1,
      canDraggable: false,
      showScaleNum: false,
    }
  }

  componentWillMount() {
    if (!this.props.draggable) {
      this.setState({
        dragProps:{ ...this.state.dragProps, onDrag: ()=>false }
      })
    }
  }

  componentDidMount() {
    const { scaleable, draggable } = this.props
    /* $FlowFixMe */
    document.ondragstart = function () { return false }
    if (draggable) { // 移动
      // addEvent(this.dragContainer,'mousedown',this.init)
      // 取消移动
    }

    if (scaleable) { // 缩放
      addEvent(this.drag, 'mouseover', this.addMoveEvent)
      addEvent(window, 'resize', this.onContaninerResize)
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { position, actualImageSize, initCalculatePoints, scaleable, draggable } = this.props
    const { position: nextPosition, actualImageSize: nextActualImageSize, scaleable:nextScaleable, draggable:nextDraggable } = nextProps
    if (position && nextPosition && (position.x !== nextPosition.x ||
      position.y !== nextPosition.y)
    ) {
      const { dragProps } = this.state
      const { x, y } = nextPosition
      dragProps.position = { x, y }
      this.setState({ dragProps })
    }
    const { width, height } = actualImageSize
    const { width: nextWidth, height: nextHeight } = nextActualImageSize
    if ((width === 0 || height === 0) && nextHeight !== 0 && nextWidth !== 0) {
      const { position: parentPosition } = this.initElementPosition(nextActualImageSize)
      this.props.setParentPosition(parentPosition)
      initCalculatePoints()
    }
    if(scaleable !== nextScaleable){
      scaleable ? this.addscale() : this.removeScale()
    }
    if(draggable !== nextDraggable){
      this.setState({
        dragProps:{ ...this.state.dragProps, onDrag: nextDraggable? this.handleDrag :()=>false }
      })
    }
  }

  componentWillUnmount() {
    removeEvent(window, 'resize', this.onContaninerResize)
    this.removeScale()
  }

  addscale = ()=>{
    addEvent(this.drag, 'mouseover', this.addMoveEvent)
    addEvent(window, 'resize', this.onContaninerResize)
  }

  removeScale = ()=>{
    removeEvent(this.drag, 'mouseover', this.addMoveEvent)
    removeEvent(this.drag, 'mousemove', this.bindResize)
    removeEvent(this.drag, 'wheel', this.resize)
  }

  /**
   * 重置图片跟点位位置
   * @param actualSize 图片真实大小
   * @return initSize newSize position --在父元素中的初始位置, 其中initSize = newSize
   */
  initElementPosition = (actualSize?: Size): {initSize: Size, newSize: Size, position: Position} => {
    const { actualImageSize, setSize } = this.props
    let { initSize, dragProps } = this.state

    const node = ReactDOM.findDOMNode(this.drag)
    if (!node || !(node instanceof HTMLElement)) {
      return ({ initSize, newSize: initSize, position: { x: 0, y: 0 } })
    }
    const offsetParent = this.props.offsetParent || node.offsetParent || node.ownerDocument.body
    this.containerSize = { width: offsetParent.clientWidth || 10, height: offsetParent.clientHeight || 10 }
    // 真实图片的大小
    actualSize = actualSize || actualImageSize
    const { width: actualWidth, height: actualHeight } = actualSize
    // 拖拽层的大小
    let size = { width: node.clientWidth, height: node.clientHeight }
    // 如果图片超出父容器
    if (actualWidth > this.containerSize.width || actualHeight > this.containerSize.height) {
      const scaleWidth = actualWidth / this.containerSize.width
      const scaleHeight = actualHeight / this.containerSize.height
      const scaleMax = Math.max(scaleWidth, scaleHeight)
      size.width = actualWidth / scaleMax
      size.height = actualHeight / scaleMax
      initSize = { ...size }
      const scaleNum = this.calculateScale(size.width, 2, actualWidth, initSize.width / actualWidth)
      // 重置初始大小，将当前大小变成初始大小
      setSize('initSize', initSize) // 在父组件中保存初始大小
      this.setState({ initSize, currentSize: { ...size }, scaleNum, canDraggable: false })
    } else {
      size = { ...actualSize }
      setSize('initSize', size)
      const scaleNum = 1
      this.setState({ initSize: size, currentSize: { ...size }, scaleNum, canDraggable: false })
    }

    // 元素的初始位置
    this.initPosition = {
      x: (this.containerSize.width - size.width) / 2,
      y: (this.containerSize.height - size.height) / 2,
    }
    // 获取图片在屏幕中的位置
    // this.containerPosition = getinlinePosition(this.drag)
    // changePosition && changePosition(this.initPosition)
    dragProps.position = { ...this.initPosition }
    this.setState({ dragProps })

    return ({ initSize, newSize: initSize, position: this.initPosition })
  }

  addMoveEvent = () => {
    removeEvent(this.drag, 'mouseover', this.addMoveEvent)
    addEvent(this.drag, 'mousemove', this.bindResize, false)
    addEvent(this.drag, 'wheel', this.resize)
  }

  bindResize = (e: MouseEvent) => {
    if (this.state.currentSize.width <= 0) {
      return
    }
    // 存储鼠标在元素内的位置
    const mouseX = e.pageX
    const mouseY = e.pageY
    this.lastScale = { mouseX, mouseY }
    this.refreshScale = { mouseX, mouseY }
  }

  resize = (e: WheelEvent) => {
    if (e instanceof WheelEvent) {
      e.preventDefault()
    }
    const { actualImageSize, setSize, onSizeChange, maxZoom } = this.props
    const { currentSize, initSize, scaleNum } = this.state
    const { dragProps } = this.state

    if (actualImageSize.width <= 0) {
      return
    }
    const scaling = e.deltaY < 0 ? 1.25 : 0.8

    // 当前元素大小
    const lastSize = { ...currentSize }
    // 真实图片大小

    // 鼠标在x,y轴中占得比例
    let { mouseX, mouseY } = this.lastScale // 鼠标移动后在图片中的位置
    const { mouseX: lastX, mouseY: lastY } = this.refreshScale  // 缩放后在图片中的位置
    if (mouseX === lastX && mouseY === lastY) { // 鼠标位置已经移动
      const { left, top } = getinlinePosition(this.drag)
      const { x, y } = dragProps.position  // 图片相对于容器的位置
      mouseX = mouseX - left - x
      mouseY = mouseY - top - y
      mouseX = mouseX > 0 ? mouseX : 0
      mouseY = mouseY > 0 ? mouseY : 0
    } else {
      mouseX = lastX
      mouseY = lastY
    }

    const scaleX = mouseX / lastSize.width
    const scaleY = mouseY / lastSize.height

    // 变化后的大小
    let newSize = {
      width: scaling * lastSize.width,
      height: scaling * lastSize.height,
    }

    const minScale = initSize.width / actualImageSize.width
    // 超出最大倍数则取消
    if ((scaleNum >= maxZoom && scaling > 1) || (scaleNum <= minScale && scaling < 1)) {
      return
    }
    const newScaleNum = this.calculateScale(newSize.width, maxZoom, actualImageSize.width)

    newSize = { width: actualImageSize.width * newScaleNum, height: actualImageSize.height * newScaleNum }

    // 计算减少或增加的高宽
    const scaleSize = {
      width: newSize.width - lastSize.width,
      height: newSize.height - lastSize.height,
    }

    let { position } = dragProps
    if (!position) {
      position = { x: 0, y: 0 }
    }
    const { x, y } = position

    // 计算每次改变大小后所需改变的位置
    position = {
      x: x - scaleSize.width * scaleX,
      y: y - scaleSize.height * scaleY,
    }

    const lastPosition = { ...position }

    // 容器的宽高
    const initWidth = this.containerSize.width
    const initHeight = this.containerSize.height

    // 如果宽高小于父容器的话  就居中
    // 如果宽高大于父容器  但是元素边界在父元素内，则将那边的边界移动到父元素边界
    // ``````
    if (newSize.width <= initWidth) {
      position.x = (initWidth - newSize.width) / 2
    } else if (position.x > 0) {
      position.x = 0
    } else if (position.x < -(newSize.width - initWidth)) {
      position.x = -(newSize.width - initWidth)
    }

    if (newSize.height <= initHeight) {
      position.y = (initHeight - newSize.height) / 2
    } else if (position.y > 0) {
      position.y = 0
    } else if (position.y < -(newSize.height - initHeight)) {
      position.y = -(newSize.height - initHeight)
    }

    const offsetX = lastPosition.x - position.x
    const offsetY = lastPosition.y - position.y

    let canDraggable = false
    if ((offsetX === 0 || offsetY === 0) && scaleNum !== minScale) {
      canDraggable = true
    }
    // 重新计算鼠标在元素内的位置
    this.refreshScale = { mouseX: newSize.width * scaleX + offsetX, mouseY: newSize.height * scaleY + offsetY }

    dragProps.position = position

    if (newSize.height <= 462 && newSize.width <= 842) {
        // dragProps={...dragProps,onStart:()=>false}
    } else if (dragProps.onStart) {
      delete dragProps.onStart
    }
    // ``````
    setSize('current', newSize)
    onSizeChange && onSizeChange(initSize, newSize, position)
    this.setState({ currentSize: { ...newSize }, dragProps, canDraggable, scaleNum: newScaleNum, showScaleNum: true })
    setTimeout(() => this.setState({ showScaleNum: false }), 500)
  }

  /**
   * 重置图片位置，重新获取大小
   */
  onContaninerResize = () => {
    const { initSize, newSize, position } = this.initElementPosition()
    // this.props.changePosition(position)
    this.props.onSizeChange(initSize, newSize, position)
  }

  // 开始图片的拖拽
  handleDrag = (e: Event, ui: Object) => {
    if (this.props.actualImageSize.width <= 0) {
      return
    }
    const { currentSize, initSize, dragProps } = this.state
    const { scaleX = 0.5, scaleY = 0.5 } = this.resize
    const { x, y, deltaX, deltaY } = ui

    let left = x,
      top = y
    let position

    const { changePosition } = this.props
    changePosition && changePosition({x,y})

    const initWidth = this.containerSize.width
    const initHeight = this.containerSize.height

    // 拖动块的宽高跟parent宽高的差值
    const width = currentSize.width - initWidth
    const height = currentSize.height - initHeight
    let showUpdate = true
    if (currentSize.width > initWidth) { // x超出父元素
      if (x >= 0) {
        left = 0
        showUpdate = false
      }
      if (x < -width) {
        left = -width
        showUpdate = false
      }
    } else {
      left = (initWidth - currentSize.width) / 2
      showUpdate = false
    }
    if (currentSize.height > initHeight) { // y超出父元素
      if (y >= 0) {
        top = 0
        showUpdate = false
      }
      if (y < -height) {
        top = -height
        showUpdate = false
      }
    } else {
      top = (initHeight - currentSize.height) / 2
      showUpdate = false
    }
    if (!showUpdate) {
      // return showUpdate
    }
    position = { x: left, y: top }
    
    dragProps.position = position
    this.setState({ dragProps })
  }

  handleDragStop = () =>{
    const { changePosition } = this.props
    const { dragProps } = this.state
    const { position } = dragProps
    changePosition && changePosition(position)
  }

  // 计算图片的缩放值
  calculateScale = (width: number, max: number, actualWidth: number, min: number = 0, init: number = 0.33) => {
    const value = Number((width / actualWidth).toFixed(2))
    if (Math.abs(value - max) * 100 < 10 || value > max) { // 最大值
      return max
    }
    // if(Math.abs(value-init)*100<2){ // 进页面压缩后的值
    //   return init
    // }
    if (Math.abs(value - 1) * 100 < 10) { // 图片为100%时候的值
      return 1
    }
    if (min === 0) {
      const { initSize } = this.state
      min = initSize.width / actualWidth
    }
    return value < min ? min : value
  }

  render() {
    const { currentSize, dragProps, scaleNum, showScaleNum, canDraggable } = this.state
    const { dragPoints } = this.props
    const { height, width } = currentSize
    const newStyle = {
      width: `${width}px`,
      height: `${height}px`,
      cursor: canDraggable ? 'move' : 'auto',
    }
    const showScale = (scaleNum * 100).toFixed(0)
    return (
      <div className="dragScale" id="dragScale" ref={rn => this.dragContainer = rn} style={{ position: 'relative', ...this.props.style }}>
        {/* <div className='drag-mask'></div> */}
        <div className="drag-wrap" ref={ rn => this.drag = rn} style={{ height: '100%', width: '100%', position: 'relative' }}>
          <Draggable {...dragProps}>
            {
              React.cloneElement(React.Children.only(this.props.children), {
                style: { ...newStyle },
              })
            }
          </Draggable>
          {dragPoints}
          {showScaleNum ? <span className="scaleNum">{`${showScale}%`}</span> : null}
        </div>

        {/* <div className='drag-wrap' ref={rn=>this.drag = rn} style={{...newStyle}}>
          {
            React.cloneElement(React.Children.only(this.props.children),{
            })
          }
        </div> */}
      </div>
    )
  }
}
