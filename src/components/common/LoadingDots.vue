<template>
  <span class="loading-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
</template>

<style scoped>
.loading-dots {
  display: inline-block;
  white-space: nowrap;
}

.loading-dots span {
  display: inline-block;
  min-width: 0.25em;
}

.loading-dots span:nth-child(1) {
  animation: first-dot 1s step-end infinite;
}

.loading-dots span:nth-child(2) {
  animation: second-dot 1s step-end infinite;
}

.loading-dots span:nth-child(3) {
  animation: third-dot 1s step-end infinite;
}

@keyframes first-dot {
  0% { opacity: 0; }
  25% { opacity: 1; }
}

@keyframes second-dot {
  0% { opacity: 0; }
  50% { opacity: 1; }
}

@keyframes third-dot {
  0% { opacity: 0; }
  75% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .loading-dots span {
    animation: none;
  }
}
</style>
