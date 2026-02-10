import PocketBase from 'pocketbase'

export default defineNuxtPlugin(() => {
  const pb = new PocketBase('/v1')
  pb.autoCancellation(false)

  return {
    provide: {
      pb,
    },
  }
})
