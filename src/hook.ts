import { useMemo, MutableRefObject, useRef } from 'react';
import { Transition, TransitionClassName, TransitionTupleFloat, TransitionEventName, TransitionEventNameType, listenerTransitionEnd } from './util'
import { isObject } from './util';

export const useGetTransitionClass = (props: Parameters<Transition>[0], init: MutableRefObject<boolean>) => {
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
    ])
    return getTransitionClass;
}

export const useGetTransitionEvent = (props: Parameters<Transition>[0], init: MutableRefObject<boolean>) => {
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
    return getTransitionEvent;
}

export const useDuration = (props: Parameters<Transition['Children']>[0]) => {
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
    return duration;
}

export const useClassNaames = (props: Parameters<Transition['Children']>[0], nameTransition?: string) => {
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
    return classNaames;
}

export const useClassNameHook = (props: Parameters<Transition['Children']>[0], classNaames?: any) => {
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
    return classNameHook;
}

export const useModeEvent = (
    props: Parameters<Transition['Children']>[0],
    classNaames: ReturnType<typeof useClassNaames>,
    classNameHook: ReturnType<typeof useClassNameHook>,
) => {

    const duration = useDuration(props);

    const emit = (name: string, $el: HTMLElement, done?: Function) => {
        return (props as any)[name] && (props as any)[name]($el, done);
    }

    return (name: any, $el: HTMLElement, done?: Function) => {
        if (props.css === false) {
            // 走用户自定义的进场离场模块事件
            return emit(name, $el, done);
        } else {
            // 默认的css模块
            if (name === 'onBeforeLeave' || name === 'onBeforeEnter') {
                $el.classList.remove(
                    classNaames.leaveActiveClass,
                    classNaames.enterActiveClass,
                    classNaames.enterToClass,
                    classNaames.leaveToClass,
                    classNaames.enterClass,
                    classNaames.leaveClass
                )
                $el.classList.add(classNameHook.active);
                emit(name, $el);
            } else if (name === 'onLeave' || name === 'onEnter') {
                $el.classList.add(classNameHook.to);
                emit(name, $el);
                if (duration) {
                    const tiemout = setTimeout(done as any, duration) as any
                    return () => {
                        clearTimeout(tiemout);
                    };
                } else {
                    const { stop } = listenerTransitionEnd($el, props.type || 'transition', done as any);
                    return stop as any;
                }
            } else {
                emit(name, $el);
            }
        }
    }

}