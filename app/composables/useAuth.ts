import type { AuthRecord } from 'pocketbase'

export const useAuth = () => {
  const { $pb } = useNuxtApp()

  const user = useState<AuthRecord | null>('pb_user', () => null)
  const isReady = ref(false)

  onMounted(() => {
    if ($pb) {
      user.value = $pb.authStore.record as AuthRecord

      $pb.authStore.onChange((token, model) => {
        user.value = model as AuthRecord
      }, true)
    }
    isReady.value = true
  })

  const logout = () => {
    $pb?.authStore.clear()
    user.value = null
  }

  return {
    user,
    isLoggedIn: computed(() => isReady.value ? !!user.value : false),
    isReady,
    logout,
  }
}
