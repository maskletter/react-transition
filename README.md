# react-transition
参考vue transition实现的react版transition组件

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