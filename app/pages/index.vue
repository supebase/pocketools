<template>
  <UContainer class="py-8 relative">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div
        v-if="pendingPosts.length > 0"
        class="fixed top-24 left-1/2 -translate-x-1/2 z-50"
      >
        <UButton
          icon="i-heroicons-arrow-up-circle"
          :label="`有 ${pendingPosts.length} 条新动态，点击查看`"
          class="rounded-full shadow-xl animate-bounce-subtle"
          @click="applyPendingPosts"
        />
      </div>
    </Transition>

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold">全部动态</h2>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        color="neutral"
        :loading="loading"
        @click="reset"
      />
    </div>

    <ClientOnly>
      <div class="space-y-4">
        <UCard
          v-for="post in posts"
          :key="post.id"
          class="hover:ring-1 hover:ring-primary-500 transition-all"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <UAvatar :alt="post.expand?.user?.name" size="xs" src="" />
                <span class="font-bold text-sm">{{
                  post.expand?.user?.name || "匿名"
                }}</span>
              </div>
              <span class="text-xs text-gray-400">
                {{ useRelativeTime(post.created) }}
              </span>
            </div>
          </template>
          <p
            class="text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-4"
          >
            {{ post.content }}
          </p>

          <CommentSection :post-id="post.id" />
        </UCard>

        <div class="pt-6">
          <UButton
            v-if="hasMore"
            block
            variant="soft"
            :loading="loading"
            @click="loadMore"
          >
            加载更多内容
          </UButton>
          <div v-else class="flex flex-col items-center gap-2 opacity-50 py-4">
            <USeparator label="End" />
            <span class="text-xs">你已经看完了所有动态</span>
          </div>
        </div>
      </div>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
const {
  posts,
  pendingPosts,
  hasMore,
  loading,
  loadMore,
  reset,
  applyPendingPosts,
} = usePosts();
</script>

<style>
@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}
</style>
