<template>
  <div ref="wrapperRef" class="wheel-wrapper">
    <div class="wheel-pointer"></div>
    <canvas
      ref="canvasRef"
      class="wheel-canvas"
      :width="canvasPixelSize"
      :height="canvasPixelSize"
      :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { wheelStore } from '../stores/wheelStore.js'
import { playTick, playWin } from '../composables/useSound.js'

const canvasRef = ref(null)
const wrapperRef = ref(null)
const canvasSize = ref(400)
const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
const canvasPixelSize = ref(400)

function getItems() {
  return wheelStore.currentWheel?.items || []
}

const segmentColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
  '#F1948A', '#85929E', '#73C6B6', '#E59866',
  '#A3E4D7', '#AED6F1', '#FAD7A0', '#D5F5E3'
]

function getColor(index) {
  return segmentColors[index % segmentColors.length]
}

let currentRotation = 0
let spinning = false
let spinResolve = null

function getCssVar(name, fallback = '') {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  } catch {
    return fallback
  }
}

function drawWheel(rotation = 0) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2
  const radius = Math.min(cx, cy) - 8 * dpr
  const itemList = getItems()

  ctx.clearRect(0, 0, w, h)

  if (itemList.length === 0) {
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = getCssVar('--text-muted', '#555577')
    ctx.font = `${16 * dpr}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('请添加奖项', cx, cy)
    return
  }

  const arcSize = (Math.PI * 2) / itemList.length

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 4 * dpr, 0, Math.PI * 2)
  ctx.shadowColor = 'rgba(0,0,0,0.15)'
  ctx.shadowBlur = 15 * dpr
  ctx.fillStyle = 'transparent'
  ctx.fill()
  ctx.restore()

  for (let i = 0; i < itemList.length; i++) {
    const startAngle = rotation + i * arcSize
    const endAngle = startAngle + arcSize
    const color = getColor(i)

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1.5 * dpr
    ctx.stroke()

    const textAngle = startAngle + arcSize / 2
    const textRadius = radius * 0.62
    const fontSize = Math.min(18, 150 / itemList.length) * dpr
    ctx.save()
    ctx.translate(
      cx + Math.cos(textAngle) * textRadius,
      cy + Math.sin(textAngle) * textRadius
    )
    const flip = textAngle > Math.PI / 2 && textAngle < 3 * Math.PI / 2
    ctx.rotate(flip ? textAngle - Math.PI : textAngle)
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = flip ? 'right' : 'left'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 3 * dpr

    const text = itemList[i].text
    const maxWidth = radius * 0.4
    const offset = (flip ? -6 : 6) * dpr
    if (ctx.measureText(text).width > maxWidth) {
      let t = text
      while (ctx.measureText(t + '…').width > maxWidth && t.length > 1) {
        t = t.slice(0, -1)
      }
      ctx.fillText(t + '…', offset, 0)
    } else {
      ctx.fillText(text, offset, 0)
    }
    ctx.restore()
  }

  ctx.beginPath()
  ctx.arc(cx, cy, 20 * dpr, 0, Math.PI * 2)
  ctx.fillStyle = getCssVar('--bg-card', '#12122a')
  ctx.fill()
  ctx.strokeStyle = getCssVar('--wheel-border', '#00f5ff')
  ctx.lineWidth = 3 * dpr
  ctx.stroke()
}

function spin() {
  return new Promise((resolve) => {
    if (spinning || getItems().length < 2) {
      resolve(null)
      return
    }

    spinning = true
    spinResolve = resolve

    const totalRotation = 8 * Math.PI + Math.random() * Math.PI * 6
    const duration = 3500 + Math.random() * 2000
    const startTime = performance.now()
    const startRotation = currentRotation
    const arcSize = (Math.PI * 2) / getItems().length
    let lastTickIndex = -1

    function animate(time) {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      currentRotation = startRotation + totalRotation * eased
      drawWheel(currentRotation)

      const effectiveRotation = ((currentRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2)
      const offset = ((-Math.PI / 2 - effectiveRotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
      const currentIndex = Math.floor(offset / arcSize) % getItems().length
      if (currentIndex !== lastTickIndex && progress < 0.95) {
        playTick()
        lastTickIndex = currentIndex
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        spinning = false
        const itemList = getItems()
        const arcSize = (Math.PI * 2) / itemList.length
        const pointerAngle = -Math.PI / 2
        const effectiveRotation = ((currentRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2)
        let offset = (pointerAngle - effectiveRotation) % (Math.PI * 2)
        if (offset < 0) offset += Math.PI * 2
        let winningIndex = Math.floor(offset / arcSize) % itemList.length
        if (winningIndex < 0) winningIndex += itemList.length

        playWin()

        if (spinResolve) {
          spinResolve(itemList[winningIndex])
          spinResolve = null
        }
      }
    }

    requestAnimationFrame(animate)
  })
}

function updateSize() {
  if (wrapperRef.value) {
    const size = Math.min(wrapperRef.value.clientWidth, 600)
    canvasSize.value = Math.max(size, 200)
    canvasPixelSize.value = Math.round(canvasSize.value * dpr)
  }
}

function scheduleDraw() {
  nextTick(() => {
    drawWheel(currentRotation)
  })
}

let resizeObserver = null

onMounted(() => {
  updateSize()
  scheduleDraw()

  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateSize()
    })
    resizeObserver.observe(wrapperRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(canvasPixelSize, () => {
  scheduleDraw()
})

watch(() => wheelStore.currentWheel, () => {
  scheduleDraw()
}, { deep: true })

defineExpose({ spin, drawWheel })
</script>
