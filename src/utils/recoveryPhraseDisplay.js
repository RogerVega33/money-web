import Swal from 'sweetalert2'
import './recoveryPhraseDisplay.css'

export function showRecoveryPhrase(phrase, { recovering = false } = {}) {
  const words = phrase.trim().split(/[\s-]+/u).filter(Boolean)
  // Passing an element avoids SweetAlert turning HTML source newlines into <br>.
  const heading = document.createElement('span')
  heading.className = 'recovery-heading'
  heading.innerHTML = `
    <span class="recovery-result">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5" />
        <path d="m6.5 10 2.25 2.25 4.75-4.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      ${recovering ? 'Contraseña actualizada' : 'Cuenta creada'}
    </span>
    <span class="recovery-title">${recovering ? 'Nuevas palabras de recuperación' : 'Palabras de recuperación'}</span>
  `
  const content = document.createElement('div')
  content.innerHTML = `
    <p class="recovery-intro">Estas palabras te permiten restablecer tu contraseña si la olvidas. Cuando las uses, escríbelas en el orden indicado, sin incluir los números.</p>
    <div class="recovery-notice" role="note">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M12 3.75 21 19.5H3L12 3.75Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M12 9v4.5m0 2.5h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <div>
        <strong>Solo se muestran una vez</strong>
        <p>${recovering
          ? 'Estas palabras reemplazan las anteriores. Guarda las nuevas antes de continuar.'
          : 'Cópialas o anótalas en este orden antes de continuar.'}</p>
      </div>
    </div>
    <section class="recovery-phrase" aria-label="Tus palabras de recuperación">
      <div class="recovery-phrase-heading">
        <span class="recovery-word-count"></span>
        <button type="button" class="recovery-copy">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" stroke-width="1.8" />
            <path d="M16 5V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h1" stroke="currentColor" stroke-width="1.8" />
          </svg>
          <span class="recovery-copy-label">Copiar palabras</span>
        </button>
      </div>
      <ol class="recovery-words" aria-label="Palabras de recuperación en orden"></ol>
    </section>
    <p class="recovery-copy-status" role="status" aria-live="polite"></p>
    <label class="recovery-acknowledgement">
      <input type="checkbox" class="recovery-acknowledgement-checkbox">
      <span>Ya guardé mis palabras en un lugar seguro.</span>
    </label>
  `

  const list = content.querySelector('ol')
  content.querySelector('.recovery-word-count').textContent = `${words.length} palabras`
  words.forEach((word, index) => {
    const item = document.createElement('li')
    const number = document.createElement('span')
    number.className = 'recovery-word-number'
    number.textContent = String(index + 1).padStart(2, '0')
    number.setAttribute('aria-hidden', 'true')
    const label = document.createElement('span')
    label.textContent = word
    item.append(number, label)
    list.append(item)
  })

  const copyButton = content.querySelector('.recovery-copy')
  const copyLabel = content.querySelector('.recovery-copy-label')
  const copyStatus = content.querySelector('.recovery-copy-status')
  const acknowledgement = content.querySelector('.recovery-acknowledgement-checkbox')
  const continueHint = document.createElement('p')
  continueHint.className = 'recovery-confirm-hint'
  continueHint.textContent = 'Marca la casilla para continuar'

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(phrase)
      copyLabel.textContent = 'Palabras copiadas'
      copyButton.classList.add('is-copied')
      copyStatus.dataset.state = 'success'
      copyStatus.textContent = 'Palabras copiadas. Guárdalas antes de continuar.'
    } catch {
      copyLabel.textContent = 'Volver a copiar'
      copyButton.classList.remove('is-copied')
      copyStatus.dataset.state = 'error'
      copyStatus.textContent = 'No se pudo copiar. Selecciona las palabras y cópialas o anótalas a mano.'
    }
  })

  return Swal.fire({
    title: heading,
    html: content,
    customClass: { container: 'recovery-overlay', popup: 'recovery-popup' },
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'Continuar al inicio de sesión',
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton()
      const actions = Swal.getPopup()?.querySelector('.swal2-actions')

      confirmButton.disabled = !acknowledgement.checked
      actions?.after(continueHint)
      continueHint.id = 'recovery-confirm-hint'
      acknowledgement.setAttribute('aria-describedby', continueHint.id)
      acknowledgement.addEventListener('change', () => {
        confirmButton.disabled = !acknowledgement.checked
        continueHint.textContent = acknowledgement.checked
          ? 'Todo listo. Puedes continuar.'
          : 'Marca la casilla para continuar'
      })
      copyButton.focus()
    },
    preConfirm: () => {
      if (!acknowledgement.checked) return false
    },
  })
}
