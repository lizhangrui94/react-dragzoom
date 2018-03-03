/**
 * @flow
 */

import React from 'react'
import Draggable from 'react-draggable'

type Props = {

}

type State = {

}

export default class DragItem extends React.Component<Props, State>{
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
    <div style={{ position: 'absolute', top: '0px', left: '0px', height: '0px' }} ref={rn => this.dragPoints = rn}>
        {this.getDraggablePoints(points)}
      </div>
  }
}