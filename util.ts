import { useLayoutEffect, useRef } from "react";

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