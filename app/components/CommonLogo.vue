<template>
  <div
    class="mt-2.5 inline-block"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <canvas
      ref="canvasRef"
      :width="width * dpr"
      :height="height * dpr"
      :style="canvasStyle"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  drawSpeed?: number
  pauseTime?: number
}>(), {
  width: 210,
  height: 150,
  drawSpeed: 0.008,
  pauseTime: 15000,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { dpr } = useHandWriting(canvasRef, props)

const canvasStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  color: 'inherit',
}))
</script>
