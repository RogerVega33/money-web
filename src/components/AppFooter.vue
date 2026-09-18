<template>
  <footer class="app-footer">
    <div class="footer-content md:container">
      <div>
        <p class="text-sm text-green-100">© {{ currentYear }} Money app</p>
      </div>
      <div class="footer-details">
        <nav class="social-links" aria-label="Enlaces del proyecto y redes sociales">
          <a
            v-for="link in socialLinks.filter(link => link.url)"
            :key="link.name"
            :href="link.url"
            :aria-label="link.name"
            :title="link.name"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
          >
            <fa :icon="['fab', link.icon]" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
const socialLinks = [
  { name: 'GitHub', icon: 'github', url: 'https://github.com/RogerVega33' },
  { name: 'Docker Hub', icon: 'docker', url: 'https://hub.docker.com/u/rogervega33' },
  { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/rogervega/' }
]
</script>

<style scoped>
.app-footer {
  flex-shrink: 0;
  background-color: #14532d;
  color: white;
  padding: 2.5rem 1.5rem;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 0 auto;
}

.footer-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 0.5rem;
  color: #dcfce7;
  font-size: 1.5rem;
}

.social-link:hover {
  color: #67e8f9;
  background-color: #166534;
}

.social-link:focus-visible {
  outline: 2px solid #67e8f9;
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .app-footer {
    padding: 1rem;
  }

  .footer-content {
    flex-wrap: nowrap;
    gap: 0.5rem;
  }

  .footer-content > :first-child {
    white-space: nowrap;
  }

  .footer-details {
    flex-shrink: 0;
  }

  .social-links {
    gap: 0;
  }
}

@media (min-width: 768px) {
  .app-footer {
    padding: 1rem 0.5rem;
  }

  .footer-content {
    padding-inline: 0.25rem;
  }

  .footer-details {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .footer-content {
    padding-inline: 1.25rem;
  }
}
</style>
