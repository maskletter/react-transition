import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Transition, TransitionGroup } from '../index'
import './index.less'
// import { Transition } from '../../es/index'


const A = () => {
    const [show, _setShow] = useState([false, true, false, false, false, false])
    const [list, setList] = useState([1, 2, 3, 4, 5, 6, 7])
    const [list2, setList2] = useState([1,3,4])
    const setShow = (idx: number, res: boolean) => {
        show[idx] = res;
        _setShow([...show])
    }
    return <div style={{
        padding: 20
    }}>
        <h1>Transition</h1>
        <hr />
        <h3>基础使用</h3>
        <button onClick={() => setShow(0, true)}>展示</button>
        <button onClick={() => setShow(0, false)}>隐藏</button>
        <div className='block-content'>
            <Transition name='show1'>
                {
                    show[0] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : false
                }
            </Transition>
        </div>
        <br />
        <div className='block-content'>
            <Transition name='show2'>
                {
                    show[0] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : false
                }
            </Transition>
        </div>
        <hr />
        <h3>设置appear</h3>
        <button onClick={() => setShow(1, true)}>展示</button>
        <button onClick={() => setShow(1, false)}>隐藏</button>
        <div className='block-content'>
            <Transition name='show2' appear>
                {
                    show[1] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : false
                }
            </Transition>
        </div>
        <h3>设置absolute</h3>
        <blockquote>未设置</blockquote>
        <button onClick={() => setShow(2, !show[2])}>切换</button>
        <div className='block-content' style={{ height: 'auto' }}>
            <Transition name='show2'>
                {
                    show[2] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : <div className='block' key={'show2'} style={{ background: 'blue' }}></div>
                }
            </Transition>
        </div>
        <blockquote>已设置</blockquote>
        <button onClick={() => setShow(3, !show[3])}>切换</button>
        <div className='block-content'>
            <Transition name='show2' absolute>
                {
                    show[3] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : <div className='block' key={'show2'} style={{ background: 'blue' }}></div>
                }
            </Transition>
        </div>
        <h3>设置mode</h3>
        <button onClick={() => setShow(4, !show[4])}>切换</button>
        <blockquote>mode=out-in</blockquote>
        <div className='block-content'>
            <Transition name='show2' absolute mode='out-in'>
                {
                    show[4] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : <div className='block' key={'show2'} style={{ background: 'blue' }}></div>
                }
            </Transition>
        </div>
        <blockquote>mode=out-in,modeTime=500</blockquote>
        <div className='block-content'>
            <Transition name='show2' absolute mode='out-in' modeTime={200}>
                {
                    show[4] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : <div className='block' key={'show2'} style={{ background: 'blue' }}></div>
                }
            </Transition>
        </div>
        <blockquote>mode=in-out</blockquote>
        <div className='block-content'>
            <Transition name='show2' absolute mode='in-out'>
                {
                    show[4] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : <div className='block' key={'show2'} style={{ background: 'blue' }}></div>
                }
            </Transition>
        </div>
        <blockquote>mode=in-out,modeTime=500</blockquote>
        <div className='block-content'>
            <Transition name='show2' absolute mode='in-out' modeTime={200}>
                {
                    show[4] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : <div className='block' key={'show2'} style={{ background: 'blue' }}></div>
                }
            </Transition>
        </div>
        <blockquote>mode=time</blockquote>
        <div className='block-content'>
            <Transition name='show2' absolute mode='time' modeTime={500}>
                {
                    show[4] ? <div className='block' key={'show1'} style={{ background: 'red' }}></div> : <div className='block' key={'show2'} style={{ background: 'blue' }}></div>
                }
            </Transition>
        </div>
        <h1>Transition-Group</h1>
        <h3>基础使用</h3>
        <button onClick={() => {
            const _newList = [...list];
            _newList.splice(1, 0, Math.random())
            _newList.splice(4, 0, Math.random())
            console.log('addd', _newList)
            setList(_newList)
        }}>追加</button>
        <button onClick={() => {
            const _newList = [...list];
            _newList.splice(1, 1)
            _newList.splice(4, 1)
            console.log('remove', _newList)
            setList(_newList)
        }}>删减</button>
        <div className='block-scroll'>
            <TransitionGroup name='show2'>
                {
                    list.map((item) => <div key={item} className='block-list'>{item}</div>)
                }
            </TransitionGroup>
        </div>
        <h3>更平滑的过度</h3>
        <button onClick={() => {
            const _newList = [...list2];
            // _newList.splice(1, 0, Math.random())
            // _newList.splice(4, 0, Math.random())
            console.log('addd', _newList)
            _newList.push(Math.random())
            setList2(_newList)
        }}>追加</button>
        <button onClick={() => {
            const _newList = [...list2];
            _newList.splice(1, 1)
            _newList.splice(4, 1)
            console.log('remove', _newList)
            setList2(_newList)
        }}>删减</button>
        <div className='block-scroll'>
            <TransitionGroup name='show2'>
                {
                    list2.map((item) => <Transition.Children key={item}>
                        {
                            (status, active) => <TransitionGroup.Css status={status} active={active} initStyle={{
                                height: 0
                            }} defaultStyle={{height: 48}} transition='.8s'>
                                <div className='block-list'>{item}，{active?'激活':'禁止'}，{status}</div>
                            </TransitionGroup.Css>
                        }
                    </Transition.Children>)
                }
            </TransitionGroup>
        </div>
    </div>
}


export const run = () => {
    const root = createRoot(document.getElementById('root') as any);
    root.render(<A />);
}

run();