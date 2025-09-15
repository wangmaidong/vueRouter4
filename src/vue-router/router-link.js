import { inject } from "vue"
export const RouterLink = {
    props: {
        to: {
            type: String,
            required: true
        }
    },
    setup(props, context) {
        const { slots } = context
        const router = inject('router')
        function navigate() {
            router.push(props.to)
        }
        return () => {
            return <a onClick={navigate}>{slots.default()}</a>
        }
    }
}