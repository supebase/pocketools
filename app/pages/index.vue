<template>
  <div>
    <UAlert
      color="neutral"
      title="How to use"
      description="/api/ip"
      :ui="{ root: 'rounded-b-none' }"
    />
    <pre
      class="border rounded-b-xl p-3"
      v-text="locationData"
    />
  </div>
</template>

<script setup lang="ts">
const { locationData, fetchGeo } = useGeoLocation()

onMounted(() => {
  fetchGeo()
})
</script>
