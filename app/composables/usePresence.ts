import { useStorage, useIntervalFn } from '@vueuse/core'

export const usePresence = () => {
    const { $pb } = useNuxtApp()
    const onlineCount = ref(0)

    // 状态锁定，防止并发创建
    const isCreating = ref(false)

    // 持久化存储
    const presenceId = useStorage<string | null>('pb_presence_id', null)
    const clientId = useStorage<string>('pb_client_id', crypto.randomUUID())

    const heartbeat = async () => {
        if (import.meta.server || isCreating.value) return

        const now = new Date().toISOString()

        if (presenceId.value) {
            try {
                await $pb.collection('presence').update(presenceId.value, {
                    lastSeen: now,
                    clientId: clientId.value
                }, { requestKey: null })
            } catch (err: any) {
                if (err.status === 404 || err.status === 403) {
                    presenceId.value = null
                    await createRecord(now)
                }
            }
        } else {
            await createRecord(now)
        }
    }

    const createRecord = async (timestamp: string) => {
        if (isCreating.value) return
        isCreating.value = true

        try {
            const res = await $pb.collection('presence').create({
                clientId: clientId.value,
                lastSeen: timestamp
            }, { requestKey: null })

            presenceId.value = res.id
        } catch (err) {
            console.error('Create failed', err)
        } finally {
            isCreating.value = false
        }
    }

    const updateCount = async () => {
        const date = new Date(Date.now() - 20000);
        const threshold = date.toISOString().replace('T', ' ').split('.')[0];

        try {
            const records = await $pb.collection('presence').getList(1, 1, {
                filter: `lastSeen >= "${threshold}"`,
                requestKey: 'presence_count'
            })
            onlineCount.value = records.totalItems
        } catch (e) {
            console.error("更新计数失败:", e)
        }
    }

    const { pause, resume } = useIntervalFn(heartbeat, 5000, { immediate: false })

    const initPresence = () => {
        if (import.meta.server) return

        onUnmounted(() => {
            $pb.collection('presence').unsubscribe('*')
            pause()
        })

        const setup = async () => {
            $pb.collection('presence').subscribe('*', () => updateCount())
            await heartbeat()
            await updateCount()
            resume()
        }
        setup()
    }

    return { onlineCount, initPresence }
}