# react-transition
参考vue transition实现的react版transition组件，

⚠️元素必须设置key，否则会导致动画无效

```tsx
import React, { useState } from 'react';
import { Transition, TransitionGroup } from "./index";

/** css部分
 
.fade-enter-active, .fade-leave-active {
  transition: opacity 1.5s;
}
.fade-enter, .fade-leave-to  {
  opacity: 0;
}
*/

const Demo = () => {
    const [show, setShow] = useState(false);
    return <div>
        <button onClick={() => setShow(!show)}>测试</button>
        <Transition name="fade" 
        >
            {show ? <div key={2} id='aa' style={{
                    width: 80,
                    height: 80,
                    background:'red'
                }}></div> : false}
        </Transition>
    </div>
}

```
## Props

  <code>name</code>- string，用于自动生成 CSS 过渡类名。例如：name: 'fade' 将自动拓展为 .fade-enter，.fade-enter-active 等。<br />
  <code>appear</code> - boolean，是否在初始渲染时使用过渡。默认为 false。<br />
  <code>type</code> - string，指定过渡事件类型，侦听过渡何时结束。有效值为 "transition" 和 "animation"。默将自动检测出持续时间长的为过渡事件类型。<br />
  <code>mode</code> - string，控制离开/进入过渡的时间序列。有效的模式有 "out-in" 和 "in-out"；默认同时进行。<br />
  <code>modeTime</code> - number，设置组件进程离场时机<br />
  <code>activeStyle</code> - css | () => css，动画过程中的样式，加载到执行元素上<br />
  <code>duration</code> - number | { enter: number, leave: number } 指定过渡的持续时间。默认情况下，会等待过渡所在根元素的第一个 transitionend 或 animationend 事件。<br />
  <code>absolute</code> - boolean，设置元素过渡过程中为绝对定位<br />
  <code>absoluteStyle</code> - css，绝对定位中加载的样式<br />
  <code>enter-to-class</code> - string<br />
  <code>leave-to-class</code> - string<br />
  <code>appear-to-class</code> - string<br />
  <code>enter-active-class</code> - string<br />
  <code>leave-active-class</code> - string<br />
  <code>appear-active-class</code> - string<br />
  
## 事件
  <code>onBeforeEnter</code><br />
  <code>onBeforeLeave</code><br />
  <code>onBeforeAppear</code><br />
  <code>onEnter</code><br />
  <code>onLeave</code><br />
  <code>onAppear</code><br />
  <code>onAfterEnter</code><br />
  <code>onAfterLeave</code><br />
  <code>onAfterAppear</code><br />
  <code>onTransitionEnd</code><br />
