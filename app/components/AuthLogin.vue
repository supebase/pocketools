<template>
  <UModal
    v-model:open="isOpen"
    title="身份验证"
    description="请输入您的账号信息以继续"
  >
    <UButton
      label="登录"
      color="neutral"
      variant="solid"
    />

    <template #body>
      <UForm
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          name="email"
        >
          <UInput
            v-model="state.email"
            placeholder="name@example.com"
            icon="i-heroicons-envelope"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="password"
        >
          <UInput
            v-model="state.password"
            type="password"
            icon="i-heroicons-lock-closed"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-3 mt-4">
          <UButton
            label="取消"
            variant="ghost"
            color="neutral"
            @click="isOpen = false"
          />
          <UButton
            type="submit"
            label="确认登录"
            color="neutral"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { $pb } = useNuxtApp()
const loading = ref(false)

const isOpen = ref(false)

const state = reactive({
  email: '',
  password: '',
})

async function onSubmit() {
  loading.value = true
  try {
    await $pb.collection('users').authWithPassword(state.email, state.password)
    isOpen.value = false
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (err: any) {
    console.error('登录失败:', err)
  }
  finally {
    loading.value = false
  }
}
</script>
