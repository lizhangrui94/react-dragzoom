/**
 * @flow
 */

import React from 'react'
import Draggable from 'react-draggable'

type Props = {
  position: Object,
  children: any,
  id: string,
  isEdit: boolean,
  onControlledDragStop: Function,
  onControlledDrag: Function,
}

const DragzoomItem = (props: Props) => {
  const { position: { x, y }, id, isEdit } = props
  return (
    <Draggable
      position={{ x, y }}
      onStop={(e, position: Position) => props.onControlledDragStop(id, position)}
      onDrag={!isEdit ? (e, position: Position) => props.onControlledDrag(id, position) : () => false}
    >
      <div className="dragPoint" style={{ position: 'absolute', top: y, left: x }} data-id={id}>
        {props.children}
      </div>
    </Draggable>
  )
}

export default DragzoomItem
