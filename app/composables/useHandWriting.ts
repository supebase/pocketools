import type { PathInfo } from '~/types'

export function useHandWriting(
  canvasRef: Ref<HTMLCanvasElement | null>,
  props: { width: number, height: number, drawSpeed: number, pauseTime: number },
) {
  const colorMode = useColorMode()
  const dpr = ref(1)

  let animationId: number | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const getThemeColor = () => (colorMode.value === 'dark' ? '#ffffff' : '#18181b')
  let cachedColor = getThemeColor()

  const BASE_WIDTH = 210
  const BASE_HEIGHT = 150

  type AnimationState = 'drawing' | 'pause_end' | 'erasing' | 'pause_start'
  let state: AnimationState = 'drawing'

  const scaleValue = Math.min(props.width / BASE_WIDTH, props.height / BASE_HEIGHT)

  const rawPaths = [
    'M122.5 55L132.5 45C141.167 35.1667 152.5 13.7 128.5 6.5C104.5 -0.7 56.1667 33.5 35 51.5L24 62.5C19.8333 67.1667 10.6 78.5 7 86.5C3.4 94.5 5.5 102.833 7 106C11.3333 109.5 22.2266 114.709 31.5 115C40.7262 115.289 67.1353 117.248 76.5 115C85.8647 112.752 42.4251 151.249 46.5 151L108 115C102.435 126.661 100.057 132.774 97 143L108 124.5L119 111C115.766 118.129 115.189 121.365 122.5 122L134.5 120L142.5 115C139.33 118.548 137.549 120.471 134.5 127C132.858 131.386 132.487 133.788 132.5 138C136.269 139.189 138.695 138.984 144.5 134.5L160.5 120C166.167 114.435 169.209 112.177 174.5 109C159.91 122.34 156.776 128.508 157 138C159.803 140.203 161.71 140.861 166 140.5C177.053 132.518 182.604 126.877 191.5 115',
    'M146.5 96.5C144.905 99.4507 144.957 101.0915 146.5 104',
    'M197.5 133C196.193 135.929 196.074 137.571 197.5 140.5',
  ]

  watch(() => colorMode.value, () => {
    cachedColor = getThemeColor()
  })

  onMounted(() => {
    if (typeof window !== 'undefined') {
      dpr.value = window.devicePixelRatio || 1
    }

    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const paths: PathInfo[] = rawPaths.map((d) => {
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      tempPath.setAttribute('d', d)
      return {
        path2d: new Path2D(d),
        length: tempPath.getTotalLength(),
        strokeWidth: d.length > 50 ? 8.5 : 6.5,
      }
    })

    let progress = 0

    const animate = () => {
      if (!canvasRef.value || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()

      const finalScale = dpr.value * scaleValue
      ctx.scale(finalScale, finalScale)

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = cachedColor

      for (const [i, p] of paths.entries()) {
        ctx.lineWidth = p.strokeWidth
        ctx.setLineDash([p.length, p.length])

        let pathProgress = 0
        if (i === 0) {
          pathProgress = Math.min(1, progress / 0.8)
        }
        else if (i === 1) {
          pathProgress = Math.max(0, Math.min(1, (progress - 0.8) / 0.1))
        }
        else if (i === 2) {
          pathProgress = Math.max(0, Math.min(1, (progress - 0.9) / 0.1))
        }

        ctx.lineDashOffset = p.length * (1 - pathProgress)
        ctx.stroke(p.path2d)
      }

      ctx.restore()

      if (state === 'drawing') {
        progress += props.drawSpeed
        if (progress >= 1) {
          progress = 1
          state = 'pause_end'
          timeoutId = setTimeout(() => {
            if (canvasRef.value) state = 'erasing'
          }, props.pauseTime)
        }
      }
      else if (state === 'erasing') {
        progress -= props.drawSpeed * 2
        if (progress <= 0) {
          progress = 0
          state = 'pause_start'
          timeoutId = setTimeout(() => {
            if (canvasRef.value) state = 'drawing'
          }, 1000)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()
  })

  onUnmounted(() => {
    if (animationId) cancelAnimationFrame(animationId)
    if (timeoutId) clearTimeout(timeoutId)
  })

  return { dpr }
}
