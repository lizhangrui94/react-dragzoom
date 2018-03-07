/**
 * @flow
 */
import React from 'react'

type Props = {
  containerSize: { width: number, height: number },
}

type State = {

}

export default class DragzoomCanvas extends React.Component<Props, State> {
  static isDragCanvas = 1

  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D

  componentDidMount() {
    const context = this.context = this.canvas.getContext("2d")
    this.canvas.width = this.props.containerSize.width
    this.canvas.height = this.props.containerSize.height
    context.moveTo(100,100)
    context.lineTo(600,600)
    context.lineWidth = 5
    context.strokeStyle = "#AA394C";
    context.stroke()
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