<template>
    <UAlert color="neutral" title="How to use" description="/api/ip" />
    <pre v-text="locationData" />

    <AnimateNumber :value="onlineCount" /> 人在线
</template>

<script setup lang="ts">
const { onlineCount, initPresence } = usePresence();
const { locationData, fetchGeo } = useGeoLocation();

onMounted(() => {
    initPresence();
    fetchGeo();
})
</script>