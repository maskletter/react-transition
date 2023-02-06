import { useLayoutEffect, useRef } from "react";

export const TransitionClassName = [
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
export const TransitionEventName = [
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
export type TransitionTuple<T extends ReadonlyArray<string | number>, J, K = null, Y = null> = {
  [a in T[number]]?: a extends K ? Y : J;
};
export type Duration = number | { leave?: number, enter?: number }
export type TransitionTupleFloat<T extends ReadonlyArray<string | number>> = T[number];
export type TransitionMode = 'out-in' | 'in-out' | 'time';
export type TransitionModeTime = number;
// eslint-disable-next-line no-redeclare
export type TransitionClassName = TransitionTuple<typeof TransitionClassName, string>;
export type TransitionEvent = TransitionTuple<typeof TransitionEventName, (el: HTMLElement) => void, 'onEnter' | 'onLeave', (el: HTMLElement, done: Function) => void>;
export type TransitionEventNameType = TransitionTupleFloat<typeof TransitionEventName>;
export interface Transition {
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
export interface TransitionGroup {
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


const TRANSITION = 'transition';
const ANIMATION = 'animation';
function getTimeout(delays: string[], durations: string[]): number {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s: string): number {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}

export const isObject = (data: any) => typeof data === 'object';
export const isNumber = (item: any) => typeof item === 'number';
export const isFunction = (item: any) => typeof item === 'function';
export const isNull = (item: any) => item === null || item === false || item === '';
export const isArray = (item: any) => item instanceof Array;

export type TransitionType = typeof ANIMATION | typeof TRANSITION;

export const getTransitionInfo = (el: HTMLElement, type: TransitionType) => {
  const styles: any = window.getComputedStyle(el);
  const getStyleProperties = (key: string) => (styles[key] || '').split(', ');
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let timeout = 0;
  let propCount = 0;
  if (type === 'transition' && transitionTimeout > 0) {
    timeout = transitionTimeout;
    propCount = transitionDurations.length;
  } else if (type === 'animation' && animationTimeout > 0) {
    timeout = animationTimeout;
    propCount = animationDurations.length;
  }

  const hasTransform =
    type === TRANSITION && /\b(transform|all)(,|$)/.test(styles[`${TRANSITION}Property`]);
  return {
    type,
    timeout,
    propCount,
    hasTransform,
  };
};

export const listenerTransitionEnd = (
  el: HTMLElement,
  type: TransitionType,
  callback: Function,
) => {
  const { timeout, propCount } = getTransitionInfo(el, type);
  // const endEvent = `${type}end`;
  let ended = 0;
  let stop = false;
  const end = () => {
    // el.removeEventListener(endEvent, onEnd);
    !stop && callback && callback();
  };
  if (propCount === 0) {
    !stop && callback && callback();
    return { timer: -1, timeout, propCount, type };
  }
  // const onEnd = (e: Event) => {
  //   if (!stop && e.target === el && ++ended >= propCount) {
  //     end('transitioned');
  //   }
  // };
  const timer = setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  // el.addEventListener(endEvent, onEnd);
  return {
    timer,
    timeout,
    propCount,
    type,
    stop() {
      stop = true;
    }
  };
};

export const useLatest = <T>(props: any): React.MutableRefObject<T> => {
  const latest = useRef(props);
  useLayoutEffect(() => {
    latest.current = props;
  })
  return latest
}