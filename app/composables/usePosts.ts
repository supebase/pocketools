import type { Posts } from '~/types'

export const usePosts = () => {
    const { $pb } = useNuxtApp()
    const { user } = useAuth()

    const allPosts = useState<Posts[]>('posts_all_items', () => [])
    const hasMore = useState('posts_has_more', () => true)
    const page = useState('posts_page', () => 1)
    const perPage = 3

    const pendingPosts = useState<Posts[]>('posts_pending_items', () => [])

    const { status, execute } = useAsyncData(
        'posts_list',
        async () => {
            if (!import.meta.client || !$pb) return null

            return await $pb.collection('posts').getList<Posts>(page.value, perPage, {
                sort: '-created',
                expand: 'user',
            })
        },
        {
            server: false,
            immediate: false,
            watch: [page],
            transform: (result) => {
                if (!result) return

                if (page.value === 1) {
                    allPosts.value = result.items
                } else {
                    const existingIds = new Set(allPosts.value.map(p => p.id))
                    const newItems = result.items.filter(item => !existingIds.has(item.id))
                    allPosts.value.push(...newItems)
                }

                hasMore.value = result.page < result.totalPages
                return result
            }
        }
    )

    let unsubscribe: (() => void) | null = null

    onUnmounted(() => {
        unsubscribe?.()
    })

    onMounted(async () => {
        if (allPosts.value.length === 0) await execute()

        if ($pb && import.meta.client) {
            unsubscribe = await $pb.collection('posts').subscribe<Posts>('*', async ({ action, record }) => {
                if (action === 'create') {
                    const fullRecord = await $pb.collection('posts').getOne<Posts>(record.id, {
                        expand: 'user'
                    }).catch(() => record)

                    if (fullRecord.expand?.user.id === user.value?.id) {
                        allPosts.value.unshift(fullRecord)
                    } else {
                        pendingPosts.value.unshift(fullRecord)
                    }
                }
                if (action === 'delete') {
                    allPosts.value = allPosts.value.filter(p => p.id !== record.id)
                    pendingPosts.value = pendingPosts.value.filter(p => p.id !== record.id)
                }
                if (action === 'update') {
                    const i = allPosts.value.findIndex(p => p.id === record.id)
                    if (i > -1) allPosts.value[i] = record
                }
            })
        }
    })

    const applyPendingPosts = () => {
        allPosts.value = [...pendingPosts.value, ...allPosts.value]
        pendingPosts.value = []

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return {
        posts: allPosts,
        pendingPosts,
        hasMore,
        loading: computed(() => status.value === 'pending'),
        loadMore: () => {
            if (hasMore.value && status.value !== 'pending') {
                page.value++
            }
        },
        applyPendingPosts,
        reset: async () => {
            page.value = 1
            allPosts.value = []
            pendingPosts.value = []
            await execute()
        }
    }
}