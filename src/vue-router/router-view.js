import { provide, inject, h, computed } from 'vue'
export const RouterView = {
    props: {},
    setup(props, context) {
        let { slots } = context
        let currentLocation = inject('location')
        let depth = inject('++', 0)
        provide('++', depth + 1)
        console.log('currentLocation-->', currentLocation)
        const matchedComputed = computed(() => currentLocation.matched[depth])
        console.log('matchedComputed-->', matchedComputed)
        return () => {
            const record = matchedComputed.value
            const componentView = record?.components?.default
            if (componentView) {
                return h(componentView)
            } else {
                return slots.default && slots.default()
            }
        }
    }
}