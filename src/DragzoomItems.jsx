/**
 * @flow
 */
import React from 'react'

type Props = {
  getChildPosition: Function,
  childProps: {
    onControlledDrag: Function,
    onControlledDragStop: Function,
  },
  children: any,
}

type State = {

}

export default class DragzoomItems extends React.Component<Props, State> {

  static isDragItems = 1

  componentWillReceiveProps(nextProps: Props) {
  }

  renderItem = (child: any) => {
    const { key, props } = child
    const controlledPosition = this.props.getChildPosition(key, props)
    return React.cloneElement(child, { position: controlledPosition, ...this.props.childProps, id:key })
  }

  render() {
    return (
      <div style={{ position: 'absolute', top: '0px', left: '0px', height: '0px' }}>
        {React.Children.map(this.props.children, this.renderItem)}
      </div>
    )
  }
}