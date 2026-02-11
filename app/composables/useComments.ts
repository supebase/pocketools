import type { Comments } from '~/types'

export const useComments = (postId: string) => {
    const { $pb } = useNuxtApp()

    const comments = useState<Comments[]>(`comments_${postId}`, () => [])
    const loading = ref(false)

    const fetchComments = async () => {
        if (!postId || loading.value) return

        loading.value = true
        try {
            const result = await $pb.collection('comments').getList<Comments>(1, 20, {
                filter: `post = "${postId}"`,
                sort: '-created',
            })

            comments.value = result.items
        } catch (err) {
            console.error('获取评论失败:', err)
        } finally {
            loading.value = false
        }
    }

    let unsubscribe: (() => void) | null = null

    onMounted(() => {
        fetchComments()

        if ($pb && import.meta.client) {
            $pb.collection('comments').subscribe<Comments>('*', ({ action, record }) => {
                if (record.post !== postId) return

                if (action === 'create') {
                    if (!comments.value.some(c => c.id === record.id)) {
                        comments.value.unshift(record)
                    }
                }
                if (action === 'delete') {
                    comments.value = comments.value.filter(c => c.id !== record.id)
                }
            })
                .then(unsub => unsubscribe = unsub)
        }
    })

    onUnmounted(() => {
        unsubscribe?.()
    })

    const submitComment = async (email: string, comment: string, locationData?: any) => {
        try {
            const data = {
                post: postId,
                email: email,
                comment: comment,
                ip: locationData?.ip,
                location: locationData?.location,
                isp: locationData?.isp,
                source: "ba62dbd514d499c4fcc726a21c2623c16d5eb69dc1a6b8c8c60442cb75c0ab5b"
            }
            await $pb.collection('comments').create(data)
            return { success: true }
        } catch (err) {
            const friendlyMessage = parsePocketbaseError(err)
            return { success: false, error: friendlyMessage }
        }
    }

    return {
        comments,
        loading,
        submitComment,
        refresh: fetchComments
    }
}