<template>
  <UAvatar
    :src="avatarUrl"
    :alt="emailOrName"
    :size="size"
    :text="avatarText"
    class="uppercase font-bold"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  emailOrName: string
  size?: 'sm' | 'md' | 'lg'
}>()

const { getAvatarUrl } = useGravatar()
const avatarUrl = ref('')
const avatarText = ref('')

const updateAvatar = async (val: string) => {
  if (val.includes('@')) {
    // 是邮箱：获取 Gravatar，清空首字母文本
    avatarUrl.value = await getAvatarUrl(val)
    avatarText.value = ''
  }
  else {
    // 是名字：清空头像 URL，设置首字母文本
    avatarUrl.value = ''
    avatarText.value = val ? val.slice(0, 2) : '?'
  }
}

onMounted(() => updateAvatar(props.emailOrName))
watch(() => props.emailOrName, updateAvatar)
</script>
