import Swal from 'sweetalert2'
import './recoveryPhraseDisplay.css'

export function showRecoveryPhrase(phrase) {
  const content = document.createElement('div')
  content.innerHTML = `
    <p class="recovery-intro">Guarda estas palabras en orden. Las necesitarás si olvidas tu contraseña.</p>
    <p class="recovery-notice">Esto solo se mostrará una vez</p>
    <ol class="recovery-words" aria-label="Palabras de recuperación en orden" tabindex="0"></ol>
    <p class="recovery-scroll-hint">Desliza para ver todas las palabras →</p>
  `
  const list = content.querySelector('ol')
  phrase.split(/[\s-]+/u).forEach((word, index) => {
    const item = document.createElement('li')
    const number = document.createElement('span')
    number.className = 'recovery-word-number'
    number.textContent = `${index + 1}.`
    number.setAttribute('aria-hidden', 'true')
    const label = document.createElement('span')
    label.textContent = word
    item.append(number, label)
    list.append(item)
  })
  return Swal.fire({
    title: '¡Usuario creado!',
    html: content,
    icon: 'success',
    customClass: { popup: 'recovery-popup' },
    confirmButtonText: 'Ya guardé mis palabras',
    allowOutsideClick: false,
    allowEscapeKey: false,
  })
}
