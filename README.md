init
v0.1.4


all the props
```
type Props={
  img: string,
  points: Array<any>,
  disabled?: boolean,
  onDragStop?: Function, //used with points
  onSingleDragStop?: Function, //used with points
  onDrag?: Function,
  onSizeChange?:Function,
  children:?ReactElement<any>,
};

```

example
```
import Dragzoom from 'react-dragzoom'
<Dragzoom img=''/>
<Dragzoom img='' points=[{id:1,x:200,y:200,content:<div>it's a point</div>}]/>
```