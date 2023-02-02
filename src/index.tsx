import React, { cloneElement, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { isArray, isFunction, isNull, isNumber, isObject, listenerTransitionEnd, TransitionType, useLatest } from './util';
import { diff, DiffItem, StatusDefault, StatusRemove, StatusCreate } from './diff'


const TransitionClassName = [
    'enterClass',
    'leaveClass',
    'appearClass',
    'enterToClass',
    'leaveToClass',
    'appearToClass',
    'enterActiveClass',
    'leaveActiveClass',
    'appearActiveClass',
] as const;
const TransitionEventName = [
    'onBeforeEnter',
    'onBeforeLeave',
    'onBeforeAppear',
    'onEnter',
    'onLeave',
    'onAppear',
    'onAfterEnter',
    'onAfterLeave',
    'onAfterAppear',
    'onTransitionEnd',
] as const;
type TransitionTuple<T extends ReadonlyArray<string | number>, J, K = null, Y = null> = {
    [a in T[number]]?: a extends K ? Y : J;
};
type Duration = number | { leave?: number, enter?: number }
type TransitionTupleFloat<T extends ReadonlyArray<string | number>> = T[number];
type TransitionMode = 'out-in' | 'in-out' | 'time';
type TransitionModeTime = number;
// eslint-disable-next-line no-redeclare
type TransitionClassName = TransitionTuple<typeof TransitionClassName, string>;
type TransitionEvent = TransitionTuple<typeof TransitionEventName, (el: HTMLElement) => void, 'onEnter' | 'onLeave', (el: HTMLElement, done: Function) => void>;
type TransitionEventNameType = TransitionTupleFloat<typeof TransitionEventName>;
interface Transition {
    (
        props: {
            children?: any;
            name?: string;
            css?: boolean;
            type?: TransitionType;
            appear?: boolean;
            mode?: TransitionMode;
            duration?: Duration;
            /**动画过程中的样式，加载到执行元素上 */
            activeStyle?: React.CSSProperties | ((status: 'default' | 'enter' | 'leave') => React.CSSProperties);
            /**
             * 如果设置了mode默认是根据上一个组件动画结束切换，可以通过设置此属性修改组件进程离场时机
             */
            modeTime?: TransitionModeTime;
            /**
             * 设置absolute之后，会在元素上层创建一个relative属性元素
             */
            absolute?: boolean;
            /**绝对定位情况下样式，加载到执行元素上一次创建带有relative的元素上 */
            absoluteStyle?: React.CSSProperties;
        } & TransitionClassName &
            TransitionEvent,
    ): JSX.Element;
    Children: (
        props: {
            children?: JSX.Element | never[] | ((status: 'default' | 'enter' | 'leave', active: boolean) => JSX.Element);
            status?: 'remove' | 'new' | 'old';
            css?: boolean;
            name?: string;
            type?: TransitionType;
            disabled?: boolean;
            /**动画过程中的样式 */
            activeStyle?: React.CSSProperties | ((status: 'default' | 'enter' | 'leave') => React.CSSProperties);
            duration?: Duration;
        } & TransitionClassName &
            TransitionEvent,
    ) => JSX.Element;
}
interface TransitionGroup {
    (props: { children?: any; name?: string; type?: TransitionType; css?: boolean; }): JSX.Element;
    /**
     * 用于拓展transition-group进场离场动画效果
     *
     * 配合Children标签使用
     * ```tsx
     * <Children render={(status, active) => {
     *    return <Css status={status} active={active}>内容</Css>
     * }} />
     * ```
     */
    Css: (props: {
        /**正常状态样式 */
        activeStyle?: React.CSSProperties;
        /**进场时样式 */
        initStyle?: React.CSSProperties;
        /**进场时样式 */
        style?: React.CSSProperties;
        children?: any;
        status: 'default' | 'enter' | 'leave';
        active: boolean;
        transition?: string | ((type: Parameters<TransitionGroup['Css']>[0]['status']) => string);
    }) => JSX.Element;
}

const hasChangeChildrenItem = (newchild: any, oldchild: any) => {
    if (newchild.type === oldchild?.type) {
        if (newchild.key === oldchild?.key) {
            return false;
        } else {
            return true;
        }
    }
    return true;
};
// 检查数组diff
const hasChangeChildren = (newchild: any[], oldchild: any[]) => {
    if (newchild.length != oldchild.length) return true;
    for (const key in newchild) {
        if (hasChangeChildrenItem(newchild[key], oldchild[key])) {
            return true;
        }
    }
    return false;
};

const Transition: Transition = function (props: Parameters<Transition>[0]) {
    const catchPrevChildren = useRef(false as any);
    const [currentChldren, setCurrentChldren] = useState(false);
    const [prevChldren, setPrevChldren] = useState(false);
    const [clear, setClear] = useState(true);
    const jici = useRef(0);
    const init = useRef(true)
    const modeTimeout = useRef(-1);
    useLayoutEffect(() => {
        if (init.current && !props.appear) {
            catchPrevChildren.current = props.children
            init.current = false
            return;
        }
        init.current = false;
        if (!hasChangeChildrenItem(props.children, catchPrevChildren.current)) {
            catchPrevChildren.current = props.children;
            return
        };
        clearTimeout(modeTimeout.current)
        jici.current = 0;
        renderMode()
        setClear(false);
    }, [props.children])

    const renderMode = () => {
        if (props.mode === 'in-out') {
            let _catchPrevChildren = catchPrevChildren.current;
            const end = () => {
                setPrevChldren(renderChildren('prev', _catchPrevChildren) as any)
            }
            setPrevChldren(catchPrevChildren.current);
            if (isNumber(props.modeTime)) {
                setCurrentChldren(renderChildren('current') as any);
                modeTimeout.current = window.setTimeout(end, Number(props.modeTime))
            } else {
                setCurrentChldren(renderChildren('current', end) as any)
            }
        } else if (props.mode === 'out-in') {
            const end = () => {
                setCurrentChldren(renderChildren('current') as any)
            }
            if (isNumber(props.modeTime)) {
                setPrevChldren(renderChildren('prev') as any)
                modeTimeout.current = window.setTimeout(end, Number(props.modeTime))
            } else {
                setPrevChldren(renderChildren('prev', end) as any)
            }
            setCurrentChldren(false)
            catchPrevChildren.current = props.children;
        } else if (props.mode === 'time' && isNumber(props.modeTime)) {
            setPrevChldren(renderChildren('prev') as any)
            setCurrentChldren(false)
            catchPrevChildren.current = props.children;
            modeTimeout.current = window.setTimeout(() => {
                setCurrentChldren(renderChildren('current') as any)
            }, Number(props.modeTime))
        } else {
            setPrevChldren(renderChildren('prev') as any)
            setCurrentChldren(renderChildren('current') as any)
        }
    }

    const getTransitionClass = useMemo(() => {
        return TransitionClassName.reduce((data: any, item: TransitionTupleFloat<typeof TransitionClassName>) => {
            if (item === 'enterActiveClass' && init.current && props.appearActiveClass) {
                data['enterActiveClass'] = props.appearActiveClass;
            } else if (item === 'enterToClass' && init.current && props.appearToClass) {
                data['enterToClass'] = props.appearToClass;
            } else {
                data[item] = (props as any)[item];
            }
            return data;
        }, {});
    }, [
        props.enterToClass,
        props.leaveToClass,
        props.appearToClass,
        props.enterActiveClass,
        props.leaveActiveClass,
        props.appearActiveClass,
        init.current
    ]);

    const getTransitionEvent = useMemo(() => {
        return TransitionEventName.reduce((data: any, item: TransitionEventNameType) => {
            if (item === 'onBeforeEnter' && init.current && props.onBeforeAppear) {
                data['onBeforeEnter'] = props.onBeforeAppear;
            } else if (item === 'onAfterEnter' && init.current && props.onAfterAppear) {
                data['onAfterEnter'] = props.onAfterAppear;
            } else if (item === 'onEnter' && init.current && props.onAppear) {
                data['onEnter'] = props.onAppear;
            } else {
                data[item] = (props as any)[item];
            }
            return data;
        }, {});
    }, [props]);

    const createChildren = (children: any, status: any, transitionEnd?: Function) => {
        return children ? <Children
            key={children.key}
            name={props.name}
            {...getTransitionClass}
            {...getTransitionEvent}
            status={status}
            css={props.css}
            duration={props.duration}
            activeStyle={props.activeStyle}
            type={props.type || 'transition'}
            onTransitionEnd={(e) => {
                jici.current++;
                if (jici.current === 2) {
                    setClear(true);
                    props.onTransitionEnd && props.onTransitionEnd(e)
                }
                transitionEnd && transitionEnd();
            }}>{children}</Children> : (jici.current++, false)
    }

    const renderChildren = (...argv:
        [type: 'prev' | 'current', transitionEnd?: Function,] |
        [type: 'prev' | 'current', children?: any, transitionEnd?: Function]
    ) => {
        let [type, children, transitionEnd] = argv;
        if (typeof children === 'function') {
            transitionEnd = children;
            children = undefined;
        }
        if (type === 'prev') {
            const _children = children ?? catchPrevChildren.current;
            return createChildren(_children, 'remove', transitionEnd)
        } else {
            catchPrevChildren.current = props.children
            return createChildren(children || props.children, 'new', transitionEnd)
        }
    }
    const renderLayout = (children: any, type: 'enter' | 'leave') => {
        return <div
            key={children.key}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
            }}
            className={`${type}-wrapper`}
        >
            {children}
        </div>;
    }
    if (clear) {
        return props.children;
    }
    if (!props.absolute) {
        return <>
            {prevChldren}
            {currentChldren}
        </>
    }
    return <div style={{ position: 'relative', ...(props.absoluteStyle || {}) }}>
        {renderLayout(prevChldren, 'leave')}
        {renderLayout(currentChldren, 'enter')}
    </div>
} as any

const Css = (props: Parameters<TransitionGroup['Css']>[0]) => {
    const {
        active,
        status,
        children,
        style = {},
        transition,
        initStyle = {},
        activeStyle = {},
    } = props;
    if (status === 'default') {
        return children;
    }
    // eslint-disable-next-line no-nested-ternary
    const css = active
        ? status === 'enter'
            ? activeStyle
            : initStyle
        : status === 'leave'
            ? activeStyle
            : initStyle;
    // eslint-disable-next-line no-void
    const isSize = css.height !== void 0 || css.width !== void 0;
    return (
        <div
            style={{
                position: 'relative',
                ...style,
            }}
        >
            <div
                style={{
                    position: isSize ? 'absolute' : 'relative',
                    width: '100%',
                    height: '100%'
                }}
            >
                {children}
            </div>
            {isSize ? (
                <div
                    style={{
                        ...css,
                        transition: typeof transition === 'function' ? transition(status) : transition,
                    }}
                />
            ) : (
                    false
                )}
        </div>
    );
};

const Children: Transition['Children'] = function (
    props: Parameters<Transition['Children']>[0],
) {
    const type = useRef<string>('old');
    const [run, setRun] = useState(false);
    const $el: React.MutableRefObject<HTMLDivElement> = useRef<HTMLDivElement>() as any;
    const stopTransitionEnd = useRef(() => { });
    const disabledTransition = props.disabled || false;
    const nameTransition = props.name || props.name;
    const isAnimationEnd = useRef(true);
    const [children, setChildren] = useState(null as any);
    const latestProps = useLatest<Parameters<Transition['Children']>[0]>(props)

    const hook = (name: TransitionEventNameType, done?: Function) => {
        latestProps.current[name] && (latestProps.current as any)[name]($el.current, done);
    };


    const classNaames = useMemo(() => {
        return {
            enterClass: props.enterClass || `${nameTransition}-enter`,
            leaveClass: props.leaveClass || `${nameTransition}-leave`,
            enterToClass: props.enterToClass || `${nameTransition}-enter-to`,
            leaveToClass: props.leaveToClass || `${nameTransition}-leave-to`,
            enterActiveClass: props.enterActiveClass || `${nameTransition}-enter-active`,
            leaveActiveClass: props.leaveActiveClass || `${nameTransition}-leave-active`,
        };
    }, props.css === false ? [] : [
        nameTransition,
        props.enterToClass,
        props.leaveToClass,
        props.enterActiveClass,
        props.leaveActiveClass,
        props.enterClass,
        props.leaveClass
    ]);

    const classNameHook = useMemo(() => {
        if (props.css === false) {
            return {
                before: '',
                active: '',
                to: ''
            }
        }
        return {
            before: props.status === 'remove' ? classNaames.leaveClass : classNaames.enterClass,
            active: props.status === 'remove' ? classNaames.leaveActiveClass : classNaames.enterActiveClass,
            to: props.status === 'new' ? classNaames.enterToClass : classNaames.leaveToClass,
        }
    }, props.css === false ? [] : [
        props.status,
        classNaames.leaveActiveClass,
        classNaames.enterActiveClass,
        classNaames.enterToClass,
        classNaames.leaveToClass,
        classNaames.leaveClass,
        classNaames.enterClass
    ])

    useLayoutEffect(() => {
        let _run = run;
        // status不存在，表示为用户直接调用<Children />
        if (!props.status) return;
        if (type.current !== props.status && props.status !== 'old' && !disabledTransition) {
            _run = true;
            isAnimationEnd.current = false;
            requestAnimationFrame(() => {
                hook(hookLifeCycle.before);
                if (props.css === false) {
                    requestAnimationFrame(enterHook);
                } else {
                    $el.current.classList.remove(
                        classNaames.leaveActiveClass,
                        classNaames.enterActiveClass,
                        classNaames.enterToClass,
                        classNaames.leaveToClass,
                        classNaames.enterClass,
                        classNaames.leaveClass
                    )
                    $el.current.classList.add(classNameHook.active);
                    requestAnimationFrame(() => {
                        // $el.current.classList.remove(classNaames.enterClass, classNaames.leaveClass);
                        enterHook();
                    })
                }
            })
            stopTransitionEnd.current();
        }
        setRun(_run);
        type.current = props.status as any;
        setChildren(renderChildren(_run, !_run));
    }, [props.status]);

    const renderChildren = (_run: boolean, active = false) => {
        const status = !_run ? 'default' : props.status === 'new' ? 'enter' : 'leave';
        return isFunction(props.children) ? (props as any).children(status, active) : props.children;
    };

    const duration = useMemo(() => {
        if (!props.duration) return 0;
        let enter = 0;
        let leave = 0;
        if (isObject(props.duration)) {
            const _duration = props.duration as any;
            enter = _duration.enter;
            leave = _duration.leave;
        } else {
            enter = leave = (props.duration as any) || 0;
        }
        return props.status === 'new' ? enter : leave;
    }, [props.duration, props.status])

    const hookLifeCycle = useMemo(() => {
        return {
            before: props.status === 'remove' ? 'onBeforeLeave' : 'onBeforeEnter' as any,
            run: props.status === 'remove' ? 'onLeave' : 'onEnter' as any,
            after: props.status === 'remove' ? 'onAfterLeave' : 'onAfterEnter' as any
        }
    }, [props.status])

    const enterHook = () => {
        
        (props.css !== false) && $el.current.classList.add(classNameHook.to);
        hook(hookLifeCycle.run, () => {
            end();
        });
        setChildren(renderChildren(true, true));
        const end = () => {
            if (!$el.current) return;
            hook(hookLifeCycle.after);
            setRun(false);
            setChildren(renderChildren(false, false));
            hook('onTransitionEnd');
        }
        if (duration) {
            const tiemout = setTimeout(end, duration) as any
            stopTransitionEnd.current = () => {
                clearTimeout(tiemout);
            };
        } else if (props.css !== false) {
            const { stop } = listenerTransitionEnd($el.current, props.type || 'transition', end);
            stopTransitionEnd.current = stop as any;
        }

    }

    const activeStyle = useMemo(() => {
        if (!props.activeStyle) return {};
        if (isFunction(props.activeStyle)) {
            return (props.activeStyle as Function)(props.status === 'new' ? 'enter' : 'leave')
        } else {
            return props.activeStyle;
        }
    }, [props.activeStyle, props.status])

    if (!props.status) {
        return renderChildren(false, false);
    }
    if (!run) {
        if (props.status === 'remove') {
            return false;
        }
        return children;
    }

    const clone = () => {
        if (children.type === Children || children.type === Css) {
            const _children = children.props.children;
            return cloneElement(children, {
                children: cloneElement(_children, {
                    ref: $el,
                    className: `${classNameHook.before} ${_children.props.className}`,
                    style: {
                        ..._children.props.style,
                        ...activeStyle
                    }
                })
            })
        } else {
            return cloneElement(children, {
                ref: $el,
                className: `${classNameHook.before} ${children.props.className}`,
                style: {
                    ...children.props.style,
                    ...activeStyle
                }
            })
        }
    }
    return clone()
} as any;

// eslint-disable-next-line no-redeclare
const TransitionGroup: TransitionGroup = function (props: Parameters<TransitionGroup>[0]) {
    const prevChildren = useRef();
    const catchPrevChildren = useRef([]);
    const children = useMemo(() => {
        const _children = isArray(props.children) ? props.children : isNull(props.children) ? [] : [props.children]
        if (!hasChangeChildren(catchPrevChildren.current, _children)) {
            // 如果prevChildren.current是undefined的话表示初始化时候没有子元素，需要将当前的元素赋值给prevChildren
            if (!prevChildren.current) prevChildren.current = _children;
            return _children;
        }
        catchPrevChildren.current = _children;
        const latest: DiffItem[] = diff(_children, prevChildren.current);
        prevChildren.current = latest as any;
        return latest.map((data) => {
            const { status, item } = data;
            if (status === StatusDefault) {
                return item
            }
            data.transition = true;
            const childrenProps = item.type === Children ? item.props : { children: item };
            return <Children
                name={props.name}
                type={props.type}
                {...childrenProps}
                status={status === StatusCreate ? 'new' : 'remove'}
                key={item.key}
                onTransitionEnd={() => {
                    data.transition = false;
                    if (status === StatusRemove) {
                        data.destory = true;
                    }
                }}></Children>
        })
    }, [props.children]);

    return children
} as any;

Transition.Children = Children;
TransitionGroup.Css = Css;

export { TransitionGroup, Transition };
