a drag and scale component for react


## Dragzoom

| props     | Description                              | Type       | Default |
|-----------|------------------------------------------|------------|---------|
| img | 背景图url | string | '' |
| style | dragzoom第一层div的样式 | HTMLStyleElement | {} |
| maxZoom | 最大缩放层级 | number | 2 |
| scaleable | 是否可以缩放 | boolean | true |
| draggable | 图层是否可以拖动 | boolean | true |
| onSizeChange | Called when value changed. | (props, changed, all): void | NOOP |
| onDrag | 图层拖动时的回调 | (props): Object | props => props |
| onDragStop | Convert value from props to fields. Used for read fields from redux store. | (props): Object | NOOP |
| polygonDragDisabled | Convert value from props to fields. Used for read fields from redux store. | (props): Object | NOOP |
| onPolygonDragStop | Where to store the `name` argument of `getFieldProps`. | String | - |
| controlPaint | Where to store the meta data of `getFieldProps`. | String | - |
| dragControlPaint | Where to store the field data | String | - |
| option.withRef(deprecated) | Maintain an ref for wrapped component instance, use `refs.wrappedComponent` to access. | boolean | false |