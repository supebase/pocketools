<template>
  <UApp>
    <UHeader
      :toggle="false"
    >
      <template #title>
        <CommonLogo
          :width="32"
          :height="32"
        />
      </template>
      <template #right>
        <UColorModeButton />

        <ClientOnly>
          <div
            v-if="isLoggedIn"
            class="flex items-center gap-3"
          >
            <span class="text-sm font-medium">{{ user?.email }}</span>
            <UButton
              icon="i-heroicons-arrow-left-on-rectangle"
              variant="ghost"
              color="neutral"
              @click="logout"
            />
          </div>

          <AuthLogin v-else />

          <template #fallback>
            <div class="w-17.5 h-8 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
          </template>
        </ClientOnly>
      </template>
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter>
      <LazyBuildEnvironment />
    </UFooter>
  </UApp>
</template>

<script setup lang="ts">
const { user, isLoggedIn, logout } = useAuth()
</script>
