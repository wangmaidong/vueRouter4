function createCurrentLocation(base) {
    // protoocal://username:password@host:port/pathname + search + hash
    const { pathname, search, hash } = window.location
    let pos = base.indexOf('#')
    if (pos > -1) {
        return hash.slice(1) || '/'
    }
    return pathname + search + hash
}
function buildState(back, current, forward, replace = false, computedScroll) {
    return {
        back,
        current,
        forward,
        replace,
        computedScroll: computedScroll ? { x: window.pageXOffset, y: window.pageYOffset } : {},
        position: window.history.length - 1
    }
}
// 构建当前的路径信息和状态
function useHistoryStateNavigation(base) {
    const { history, location } = window
    let currentLocation = {
        value: createCurrentLocation(base)
    }
    let historyState = {
        value: history.state
    }

    // 初始加载时history.state 是null
    if (!historyState.value) {
        // 根据页面构建出 初始状态，将状态同步到路由中去
        let state = buildState(null, currentLocation.value, null, true)
        changeLocation(currentLocation.value, state, true)
    }
    function changeLocation(to, state, replace = false) {
        let method = replace ? 'replaceState' : 'pushState'
        let pos = base.indexOf('#')
        to = pos > -1 ? base + to : to
        window.history[method](state, null, to)
        historyState.value = state
    }
    function push(to, state) {
        let currentState = Object.assign(
            {},
            historyState.value,
            {
                forward: to,
                computedScroll: {
                    x: window.pageXOffset,
                    y: window.pageYOffset
                }
            }
        )
        // 跳转前，先将state更新到historyState中
        changeLocation(currentState.current, currentState, true)

        // 跳转后
        const nextState = Object.assign(
            {},
            buildState(currentState.current, to, null),
            state
        )
        changeLocation(to, nextState, false)
        currentLocation.value = to
    }
    function replace(to, state) {
        let currentState = Object.assign(
            {},
            buildState(historyState.value.back, to, historyState.value.forward, true),
            state
        )
        changeLocation(to, currentState, true)
        currentLocation.value = to
    }
    return {
        location: currentLocation, // 当前路径状态
        state: historyState, // 浏览器历史的信息状态
        push,
        replace
    }
}
function useHistoryListeners({ location, state: historyState }, base) {
    const listeners = []
    const handler = (ctx) => {
        const { state } = ctx
        const to = createCurrentLocation(base)
        const from = location.value
        const fromState = historyState.value
        location.value = to
        historyState.value = state
        listeners.forEach(callback => callback(to, from, {}))
    }
    window.addEventListener('popstate', handler)
    // listen方法会被调用多次，将用户传入的回调进行一个保存
    function listen(callback) {
        listeners.push(callback)
    }
    return {
        listen
    }
}
export function createWebHistory(base = '') {
    const historyNavigation = useHistoryStateNavigation(base)
    const historyListeners = useHistoryListeners(historyNavigation, base)
    const routerHistory = Object.assign({}, historyNavigation, historyListeners)
    return routerHistory
}
export function createWebHashHistory() {
    return createWebHistory("#")
}