<template>
  <div class="flex flex-col h-full">
    <div class="px-2 z-10 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-medium uppercase tracking-widest text-neutral-500">
          <AnimateNumber :value="comments.length" /> 条评论
        </h3>
      </div>
    </div>

    <div class="px-2 py-4">
      <div class="group relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 transition-all duration-200 focus-within:border-neutral-400 dark:focus-within:border-neutral-600 focus-within:ring-0">
        <input
          v-model="honeypot"
          type="text"
          class="hidden"
          tabindex="-1"
        >

        <div class="p-4 space-y-4">
          <div class="flex items-center gap-3">
            <UAvatar
              :src="currentAvatarUrl"
              :text="currentAvatarText"
              size="sm"
              class="ring-1 ring-neutral-200 dark:ring-neutral-800 rounded-md text-[10px] font-medium"
            />
            <UInput
              v-model="form.identity"
              placeholder="Email or Username"
              class="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:text-neutral-200"
            />
          </div>

          <UTextarea
            v-model="form.commnet"
            :rows="3"
            :disabled="!isReady"
            :placeholder="isReady ? 'What\'s on your mind?' : '休息一下，稍后再发...'"
            class="w-full bg-transparent text-sm outline-none resize-none placeholder:text-neutral-400 dark:text-neutral-200"
          />
        </div>

        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2">

          </div>

          <UButton
            size="xs"
            color="neutral"
            :loading="submitting"
            :disabled="!isReady || !form.commnet.trim() || !form.identity.trim()"
            @click="handleSend"
            class="tabular-nums"
          >
          {{ isReady ? '发表评论' : `冷却中 ${remainingSeconds} 秒` }}
          </UButton>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-2 py-4 space-y-8 custom-scrollbar">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="relative flex gap-4 group"
      >
        <div class="flex flex-col items-center">
          <CommentAvatar
            :email-or-name="comment.email"
            size="sm"
            class="rounded-md ring-1 ring-neutral-100 dark:ring-neutral-900"
          />
          <div class="w-px h-full bg-neutral-100 dark:bg-neutral-900 mt-2 group-last:hidden" />
        </div>

        <div class="flex-1 min-w-0 pb-2">
          <div class="flex items-baseline justify-between mb-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {{ comment.email.split('@')[0] }}
              </span>
              <span
                v-if="comment.location"
                class="text-[10px] text-neutral-400 font-mono"
              >
                @{{ comment.location }}
              </span>
            </div>
            <span class="text-[10px] font-mono text-neutral-400">
              {{ useRelativeTime(comment.created) }}
            </span>
          </div>

          <p class="text-[13px] text-neutral-600 dark:text-neutral-400 leading-6 wrap-break-word">
            {{ comment.comment }}
          </p>
        </div>
      </div>

      <div
        v-if="comments.length === 0"
        class="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg"
      >
        <UIcon
          name="i-heroicons-chat-bubble-bottom-center-text"
          class="w-5 h-5 text-neutral-300 mb-2"
        />
        <p class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium">
          No comments yet
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getAvatarUrl } = useGravatar()
const { locationData } = useGeoLocation()
const props = defineProps<{
  postId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any[]
}>()

const { remainingSeconds, startCooldown, isReady } = useCooldown(
  `post_${props.postId}`,
  30,
)

const { comments, submitComment, subscribeToComments } = useComments(props.postId, props.initialData)
subscribeToComments()

const submitting = ref(false)
const form = reactive({ identity: '', commnet: '' })

const currentAvatarUrl = ref('')
const currentAvatarText = ref('')

watch(
  () => form.identity,
  async (val) => {
    if (val.includes('@')) {
      currentAvatarUrl.value = await getAvatarUrl(val)
      currentAvatarText.value = ''
    }
    else {
      currentAvatarUrl.value = ''
      currentAvatarText.value = val ? val.trim().slice(0, 2) : ''
    }
  },
  { immediate: true },
)

const honeypot = ref('')

async function handleSend() {
  if (!isReady.value) return

  if (honeypot.value) {
    console.error('Bot detected!')
    form.commnet = ''
    return
  }

  submitting.value = true
  const res = await submitComment(
    form.identity,
    form.commnet,
    locationData.value,
  )
  if (res.success) {
    form.commnet = ''
    startCooldown()
  }
  submitting.value = false
}
</script>
