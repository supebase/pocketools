import PocketBase from 'pocketbase'

export default defineNuxtPlugin(() => {
  const pb = new PocketBase('/v1')

  if (import.meta.client) {
    pb.autoCancellation(false)
  }

  const { init } = useAuth()
  init()

  return {
    provide: {
      pb,
    },
  }
})
