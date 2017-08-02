function sum(a,b){
  return a+b
}

test('add 1+2 to equal 3',()=>{
  expect(sum(1, 2)).toMatchSnapshot();
  // expect(sum(1, 2)).toBe(3);
})

function forEach(items, callback) {
  for (let index = 0; index < items.length; index++) {
    callback(items[index]);
  }
}

const mockCallback = jest.fn();
forEach([0, 1], mockCallback);

test('test',()=>{
  // 此模拟函数被调用了两次
  expect(mockCallback.mock.calls.length).toBe(2);

// 第一次调用函数时的第一个参数是 0
  expect(mockCallback.mock.calls[0][0]).toBe(0);

// 第二次调用函数时的第一个参数是 1
  expect(mockCallback.mock.calls[1][0]).toBe(1);
})

test('object assignment', () => {
  const data = {one: 1};
  data['two'] = 2;
  data['three'] = 3;
  expect(data).toEqual({one: 1, two: 2,three:3});
});

function fetchData(){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve(100)
    },100)
    setTimeout(()=>{
      reject(200)
    },5000)
  })

}

test('the fetch fails with an error', () => {
  // expect.assertions(1);
  return fetchData().catch(e =>
      expect(e).toMatch('error')
  );
});

import React, { Component } from 'react';
import DragZoom from '../index';
import renderer from 'react-test-renderer';

describe('react-dragzoom', () => {
  it('knows that 2 and 2 make 4', () => {
    expect(2 + 2).toBe(4);
  });

  it('normal dragzoom without img',()=>{
    const tree = renderer.create(
        <DragZoom></DragZoom>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  })

  it('normal has img',()=>{
    const  tree = renderer.create(
        <DragZoom img="http://img.huafans.cn/data/attachment/forum/201503/26/112349rwxyiovzjzjmiclw.jpg"/>
    ).toJSON();
    expect(tree).toMatchSnapshot()
  })

  it('points',()=>{
    const points=[
      {id:1,x:1,y:1},
      {id:2,x:1,y:1},
      {id:3,x:1,y:1},
    ]
    const  wrapper = renderer.create(
        <DragZoom img="http://img.huafans.cn/data/attachment/forum/201503/26/112349rwxyiovzjzjmiclw.jpg" points={points}/>
    ).toJSON();
    // expect(wrapper.find('.ant-menu-sub').at(0).hasClass('ant-menu-hidden')).not.toBe(true);
    // expect(tree).toMatchSnapshot()
  })

  it('ansy load img',()=>{
    const points=[
      {id:1,x:1,y:1},
      {id:2,x:1,y:1},
      {id:3,x:1,y:1},
    ]
    class Warper extends Component{
      state = {
        img:""
      }
      render(){
        setTimeout(()=>{
          this.setState({img:'http://img.huafans.cn/data/attachment/forum/201503/26/112349rwxyiovzjzjmiclw.jpg'})
        },2000)
        return(
            <DragZoom img={this.state.img} points={points}/>
        )
      }
    }
    const  tree = renderer.create(
        <Warper/>
    ).toJSON();
    expect(tree).toMatchSnapshot()
  })
});