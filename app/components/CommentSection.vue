<template>
  <div class="mt-6 border-t pt-4 dark:border-gray-800">
    <h3 class="text-sm font-bold mb-4 flex items-center gap-2">
      <UIcon name="i-heroicons-chat-bubble-left-right" />
      评论 ({{ comments.length }})
    </h3>

    <div
      class="space-y-3 mb-8 bg-gray-50/30 dark:bg-gray-900/20 p-4 rounded-xl relative"
    >
      <div
        class="absolute opacity-0 -z-50 pointer-events-none"
        aria-hidden="true"
      >
        <input
          id="url"
          v-model="honeypot"
          type="text"
          name="url"
          tabindex="-1"
          autocomplete="off"
        />
      </div>

      <div class="flex gap-3">
        <UAvatar
          :src="currentAvatarUrl"
          :text="currentAvatarText"
          :alt="form.identity"
          size="md"
          class="uppercase font-bold"
        />
        <UInput
          v-model="form.identity"
          placeholder="邮箱 (头像) 或 昵称 (首字母)"
          class="flex-1"
          variant="subtle"
        />
      </div>

      <UTextarea
        v-model="form.commnet"
        placeholder="文明发言，共建和谐社区..."
        autoresize
        :rows="2"
        variant="subtle"
      />

      <div class="flex justify-end items-center gap-3">
        <span
          v-if="!isReady"
          class="text-[10px] text-gray-400 italic animate-pulse"
        >
          需等待 {{ remainingSeconds }}s 后再次发言
        </span>

        <UButton
          :label="isReady ? '发送' : '冷却中'"
          size="sm"
          color="neutral"
          :loading="submitting"
          @click="handleSend"
          :disabled="!form.commnet.trim() || !form.identity.trim() || !isReady"
          class="rounded-full px-4"
        />
      </div>
    </div>

    <div class="space-y-6 mb-6">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="group flex gap-3 items-start"
      >
        <CommentAvatar :email-or-name="comment.email" size="sm" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] text-gray-400">{{
              useRelativeTime(comment.created)
            }}</span>
            <span v-if="comment.location" class="text-[10px] text-gray-400"
              >来自 {{ comment.location }}</span
            >
            <span
              class="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {{
                comment.email.includes("@") ? "Verified Avatar" : comment.email
              }}
            </span>
          </div>
          <p
            class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed wrap-break-word"
          >
            {{ comment.comment }}
          </p>
        </div>
      </div>

      <div
        v-if="comments.length === 0"
        class="text-center py-8 opacity-40 text-xs"
      >
        暂时没有评论，快来占个位吧~
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getAvatarUrl } = useGravatar();
const { locationData } = useGeoLocation();
const props = defineProps<{ postId: string }>();

// 1. 引入冷却逻辑，每个 post 独立计时
const { remainingSeconds, startCooldown, isReady } = useCooldown(
  `post_${props.postId}`,
  30
);

const { comments, submitComment } = useComments(props.postId);

const submitting = ref(false);
const form = reactive({ identity: "", commnet: "" });

const currentAvatarUrl = ref("");
const currentAvatarText = ref("");

watch(
  () => form.identity,
  async (val) => {
    if (val.includes("@")) {
      currentAvatarUrl.value = await getAvatarUrl(val);
      currentAvatarText.value = "";
    } else {
      currentAvatarUrl.value = "";
      currentAvatarText.value = val ? val.trim().slice(0, 2) : "";
    }
  },
  { immediate: true }
);

const honeypot = ref("");

async function handleSend() {
  // 2. 拦截：如果不在 ready 状态或蜜罐触发，则退出
  if (!isReady.value) return;
  if (honeypot.value) {
    console.error("Bot detected!");
    form.commnet = "";
    return;
  }

  submitting.value = true;
  const res = await submitComment(
    form.identity,
    form.commnet,
    locationData.value
  );
  if (res.success) {
    form.commnet = "";
    // 3. 成功后开启 30s 冷却
    startCooldown();
  }
  submitting.value = false;
}
</script>
