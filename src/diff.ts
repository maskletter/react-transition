import { isNull } from "./util";

export const StatusDefault = Symbol('default');
export const StatusÇreate = Symbol('create');
export const StatusRemove = Symbol('remove');
export type Status = typeof StatusDefault | typeof StatusÇreate | typeof StatusRemove;


export interface DiffItem {
    status: Status,
    transition: boolean,
    item: any
    key: string | number
    destory: boolean
}

const arrayToObject = (array: any[], key: string) => {
    const data: any = {};
    let prev: any = null;
    array.forEach((item, index) => {
        if (item[key]) {
            prev = data[item[key]] = {
                index,
                item,
                prev
            };
        } else {
            prev = {
                index,
                item,
                prev
            };
        }
        
    })
    return data;
}

function transformDiffItem(jsx: any[]): Array<DiffItem> {
    return jsx.map(item => ({
        item,
        key: item.key,
        transition: false,
        status: StatusDefault,
        destory: false
    }))
}

function diff(latestJsx: any[], prevJsx?: DiffItem[]): Array<DiffItem> {
    if (!prevJsx) {
        return transformDiffItem(latestJsx)
    }
    const latestKeys = arrayToObject(latestJsx, 'key');
    // console.log(arrayToObject(latestJsx, 'key'))
    // console.log(prevJsx)
    let newLatset: DiffItem[] = [];
    for(const index in prevJsx) {
        const { key, item, status, transition, destory } = prevJsx[index];
        // 如果当前的元素为false直接过滤
        if (isNull(item)) continue
        // 来自上一个diff的被删除元素
        if (destory && status === StatusRemove) continue;
        if (latestKeys[key]) {
            // todo: 这里的index是否将旧id赋值给新的状态有待研究
            // latestKeys[key].index = Number(index);
            /**
             * 如果在旧diff里是删除状态(status === StatusRemove)，并且新的diff里依然存在，表示元素又被添加，标注为StatusÇreate
             * 如果在旧diff里动画仍在运行中，恢复上一个原有状态
             * 否则打标为StatusDefault
             */
            newLatset.push({ 
                status: status === StatusRemove ? StatusÇreate : transition ? status :  StatusDefault,
                key,
                transition: transition,
                item: latestKeys[key]?.item || false,
                destory
            })
            delete latestKeys[key]
        } else {
            newLatset.push({ 
                status: StatusRemove,
                key,
                transition: false,
                item,
                destory: false
            })
        }
    }
    // console.log(latestKeys)
    let prevIndex = 0;
    for(let key in latestKeys) {
        const { prev, item } = latestKeys[key]
        if (!prev) {
            newLatset.splice(prevIndex++, 0, {
                status: StatusÇreate,
                item,
                key,
                transition: false,
                destory: false
            })
        } else {
            newLatset.splice(prev.index+1, 0, {
                status: StatusÇreate,
                item,
                key,
                transition: false,
                destory: false
            })
        }
    }
    return newLatset
}


export {
    diff
}