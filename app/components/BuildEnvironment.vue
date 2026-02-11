<template>
  <div
    v-if="buildInfo"
    class="flex items-center text-xs font-medium tracking-wide text-dimmed/80 pb-6 select-none"
  >
    <div class="flex items-center gap-2.5">
      <ClientOnly>
        <span>构建于 {{ useRelativeTime(buildInfo.time) }}</span>
        <template #fallback>
          <span>...</span>
        </template>
      </ClientOnly>

      <span class="opacity-70">·</span>

      <span class="tracking-wider font-bold">
        {{ buildInfo.env }}
      </span>

      <span class="opacity-70">·</span>

      <NuxtLink
        external
        :href="`${commitUrl.GITHUB_COMMIT_URL}/${buildInfo.commit}`"
        target="_blank"
        tabindex="-1"
      >
        {{ buildInfo.shortCommit }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const buildInfo = computed(() => appConfig.buildInfo)

const commitUrl = useRuntimeConfig().public
</script>
