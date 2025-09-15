import { RouterLink } from './router-link.js'
import { RouterView } from './router-view.js'
import { computed, reactive, shallowRef } from "vue"

function normalize(record) {
  return {
    path: record.path,
    name: record.name,
    meta: record.meta || {},
    components: {
      default: record.component
    },
    children: record.children || [],
    beforeEnter: record.beforeEnter
  }
}
function createMatch(record, parent) {
  const matcher = {
    path: record.path,
    record,
    parent,
    children: []
  }
  if (parent) {
    parent.children.push(matcher)
  }
  return matcher
}
function createRouterMatcher(routes) {
  const matchers = []
  function addRoute(record, parent) {
    // 格式化用户自己配置的路由表
    let normalizeRecord = normalize(record)
    // 拼接父子路径
    if (parent) {
      normalizeRecord.path = parent.path + '/' + normalizeRecord.path
    }
    // 创建匹配器，构建父子路由关系
    let matcher = createMatch(normalizeRecord, parent)
    matchers.push(matcher)
    let child = normalizeRecord.children
    // 递归处理孩子
    for (let i = 0; i < child.length; i++) {
      addRoute(child[i], matcher)
    }
  }
  function resolve(path) {
    let matched = []
    // 根据传入的路径匹配
    let matcher = matchers.find(matcher => matcher.path == path)
    // 如果存在
    while (matcher) {
      matched.unshift(matcher.record)
      matcher = matcher.parent
    }
    console.log('matched', matched)
    return {
      path,
      matched
    }
  }
  routes.forEach(route => addRoute(route))
  console.log(matchers)

  return {
    // 动态路由添加方法
    addRoute,
    // 根据地址解析匹配到的路由
    resolve
  }
}
const START_LOCATION = {
  path: '/',
  matched: []
}
export function createRouter({ history, routes }) {
  const matcher = createRouterMatcher(routes)
  const currentLocation = shallowRef(START_LOCATION)
  let ready
  function markReady() {
    if (ready) return
    ready = true
    history.listen((to, from) => {
      to = matcher.resolve(to)
      from = currentLocation.value
      finalNavigation(to, from)
    })
  }
  function finalNavigation(to, from) {
    if (from === START_LOCATION) {
      history.replace(to.path)
    } else {
      history.push(to.path)
    }
    currentLocation.value = to
    markReady()
  }
  function extractRecords(to, from) {
    const levavingRecords = []
    const updatingRecords = []
    const enteringRecords = []
    let len = Math.max(to.matched.length, form.matched.length)
    for (let i = 0; i < len; i++) {
      // 循环from的matched
      const formRecords = from.matched[i]
      const toRecords = to.matched[i]
      if (formRecords) {
        if (to.matched.find(record => record.path == formRecords.path)) {
          updatingRecords.push(formRecords)
        } else {
          levavingRecords.push(formRecords)
        }
      }
      if (toRecords) {
        if (!from.matched.find(record => record.path == toRecords.path)) {
          enteringRecords.push(toRecords)
        }
      }
    }
    return [
      levavingRecords, updatingRecords, enteringRecords
    ]
  }
  function guardToPromise(guard, to, from, record) {
    return () => new Promise((resolve, reject) => {
      const next = resolve
      const r = guard.call(record, to, from, next)
      Promise.resolve(r).then(next)
    })
  }
  function extractGuards(guardType, matched, to, from) {
    let guards = []
    for (let record of matched) {
      let comp = record.components.default
      const guard = comp[guardType]
      guard && guards.push(guardToPromise(guard, to, from, record))
    }
    return guards
  }
  function runGuardQueue(guards) {
    return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve())
  }
  function navigate(to, from) {
    const [levavingRecords, updatingRecords, enteringRecords] = extractRecords(to, from)
    // 按照官方文档的要求，抽离对应的组件的钩子
    extractGuards('beforeRouteLeave', levavingRecords, to, from)
    let guards = extractGuards('beforeRouteLeave', levavingRecords.reverse(), to, from)
    return runGuardQueue(guards).then(() => {
      guards = []
      for (let guard of beforeGuards.list()) {
        guards.push(guardToPromise(guard))
      }
      return runGuardQueue(guards)
    }).then(() => {
      let guards = extractGuards('beforeRouteUpdate', updatingRecords.reverse(), to, from)
      return runGuardQueue(guards)
    }).then(() => {
      guards = []
      for (let record of to.matched) {
        const enterGuard = record.beforeEnter
        if (enterGuard) {
          guards.push(guardToPromise(enterGuard))
        }
      }
      return runGuardQueue(guards)
    }).then(() => {
      guards = []
      for (let record of to.matched) {
        const enterGuard = record.beforeEnter
        if (enterGuard) {
          guards.push(guardToPromise(enterGuard))
        }
      }
      return runGuardQueue(guards)
    }).then(() => {
      guards = extractGuards('beforeRouteEnter', enteringRecords.reverse(), to, from)
      return runGuardQueue(guards)
    }).then(() => {
      guards = []
      for (let guard of beforeResolveGuards.list()) {
        guards.push(guardToPromise(guard))
      }
      return runGuardQueue(guards)
    })

  }
  function pushWithRedirect(to) {
    let from = currentLocation.value
    to = matcher.resolve(to)
    navigate(to, from).then(() => {
      return finalNavigation(to, from)
    }).then(() => {
      for (let guard of afterGuards.list()) {
        guard()
      }
    })
  }
  function push(to) {
    return pushWithRedirect(to.value || to)
  }
  function useCallbacks() {
    const handlers = []
    console.log(handlers)
    const add = (handler) => handlers.push(handler)
    return {
      add,
      list: () => handlers
    }
  }
  const beforeGuards = useCallbacks()
  const beforeResolveGuards = useCallbacks()
  const afterGuards = useCallbacks()
  if (currentLocation.value === START_LOCATION) {
    push(history.location)
  }
  const router = {
    push,
    install(app) {
      let reactiveObj = {}
      for (let key in START_LOCATION) {
        reactiveObj[key] = computed(() => currentLocation.value[key])
      }
      app.provide('location', reactive(reactiveObj))
      app.provide('router', router)
      // 注册两个组件
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView)
    },
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add
  };
  return router;
}
