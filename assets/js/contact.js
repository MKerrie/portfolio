// ========================================
// CONTACT.JS - Contact Form Handler
// EmailJS Integration met Email Verificatie
// ========================================

// Configuration
const EMAILJS_CONFIG = {
  publicKey: 'DLACg0Fp1Jby6SCdV',
  serviceID: 'service_zppr438',
  templateID: 'template_srt8ofi',
};

document.addEventListener('DOMContentLoaded', function() {
  initContactForm();
});

// ========================================
// EMAIL VERIFICATION - Basis Validatie
// ========================================
async function verifyEmail(email) {

  // Basis email validatie zonder externe API
  // Dit is gratis en altijd beschikbaar!

  // 1. Check email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      quality: 0,
      isDisposable: false,
      isFreeEmail: false,
      provider: 'Onbekend',
      riskStatus: 'high'
    };
  }

  // 2. Check voor wegwerp email providers
  const disposableDomains = [
    '10minutemail.com', 'tempmail.com', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'yopmail.com', 'fakeinbox.com', 'trashmail.com'
  ];

  const domain = email.split('@')[1].toLowerCase();
  const isDisposable = disposableDomains.includes(domain);

  if (isDisposable) {
    return {
      isValid: false,
      quality: 0,
      isDisposable: true,
      isFreeEmail: false,
      provider: 'Wegwerp email',
      riskStatus: 'high'
    };
  }

  // 3. Detecteer bekende providers
  const freeProviders = {
    'gmail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Hotmail',
    'yahoo.com': 'Yahoo',
    'icloud.com': 'iCloud',
    'live.com': 'Live',
    'msn.com': 'MSN',
    'protonmail.com': 'ProtonMail',
    'zoho.com': 'Zoho'
  };

  const provider = freeProviders[domain] || 'Zakelijk';
  const isFreeEmail = !!freeProviders[domain];

  return {
    isValid: true,
    quality: 0.8, // Goede kwaliteit voor basis check
    isDisposable: false,
    isFreeEmail: isFreeEmail,
    provider: provider,
    riskStatus: 'low'
  };
}

// ========================================
// CONTACT FORM INITIALIZATION
// ========================================
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const submitText = document.getElementById('submitText');
  const responseMessage = document.getElementById('responseMessage');

  // Rate limiting
  let lastSubmitTime = 0;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Honeypot check
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value) {
      showMessage('success', '✅ Bedankt! Je bericht is succesvol verzonden.');
      contactForm.reset();
      return;
    }

    // Rate limiting (minimum 10 seconds between submissions)
    const now = Date.now();
    if (now - lastSubmitTime < 10000) {
      showMessage('error', '❌ Wacht even voordat je opnieuw een bericht verstuurt.');
      return;
    }
    lastSubmitTime = now;

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Get email for verification
    const email = document.getElementById('email').value.trim();

    // Set loading state
    setButtonLoading(submitButton, submitText, true, 'Email verifiëren...');

    // Verify email
    const emailCheck = await verifyEmail(email);

    if (!emailCheck.isValid) {
      setButtonLoading(submitButton, submitText, false);

      let errorMsg = '❌ Dit emailadres lijkt niet geldig te zijn.';

      if (emailCheck.isDisposable) {
        errorMsg = '❌ Tijdelijke/wegwerp emailadressen zijn niet toegestaan.';
      } else if (emailCheck.quality < 0.5) {
        errorMsg = '❌ Dit emailadres heeft een lage kwaliteitsscore. Controleer de spelling.';
      } else if (emailCheck.riskStatus === 'high') {
        errorMsg = '❌ Dit emailadres wordt als risicovol beoordeeld.';
      }

      showMessage('error', errorMsg);
      return;
    }

    // Get form data - ALLEEN naam, email en bericht
    const formData = {
      from_name: document.getElementById('name').value.trim(),
      from_email: email,
      message: document.getElementById('message').value.trim(),
      to_name: 'Kerim Örgü',
      reply_to: email,
      timestamp: new Date().toLocaleString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      email_type: emailCheck.isFreeEmail
        ? `Gratis (${emailCheck.provider})`
        : `Zakelijk (${emailCheck.provider})`,
      email_quality: `${Math.round(emailCheck.quality * 100)}% - ${emailCheck.riskStatus} risico`
    };

    setButtonLoading(submitButton, submitText, true, 'Verzenden...');

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        formData,
        EMAILJS_CONFIG.publicKey
      );

      // Success feedback
      showMessage('success', '✅ Bedankt! Je bericht is succesvol verzonden. Ik neem zo snel mogelijk contact met je op.');

      // Reset form
      contactForm.reset();

      // Remove validation states
      const inputs = contactForm.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.classList.remove('border-primary-500', 'border-red-500');
        removeFieldError(input);
      });

    } catch (error) {
      let errorMessage = '❌ Er ging iets mis bij het versturen. ';

      if (error.status === 404) {
        errorMessage = '❌ EmailJS configuratie fout.';
      } else if (error.status === 401) {
        errorMessage = '❌ EmailJS authenticatie fout.';
      } else if (error.status === 400) {
        errorMessage = '❌ Ongeldige email data. Probeer opnieuw.';
      } else {
        errorMessage += 'Probeer het opnieuw of stuur een email naar mkorgu@gmail.com';
      }

      showMessage('error', errorMessage);
    } finally {
      setButtonLoading(submitButton, submitText, false);
    }
  });

  // Real-time validation
  const inputs = contactForm.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });

    input.addEventListener('input', function() {
      if (this.classList.contains('border-red-500')) {
        validateField(this);
      }
    });
  });
}

// ========================================
// FORM VALIDATION
// ========================================
function validateForm() {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');

  let isValid = true;

  if (!validateField(name)) isValid = false;
  if (!validateField(email)) isValid = false;
  if (!validateField(message)) isValid = false;

  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.getAttribute('name');
  let isValid = true;
  let errorMessage = '';

  field.classList.remove('border-red-500', 'border-primary-500');

  switch(fieldName) {
    case 'name':
      if (value.length < 2) {
        isValid = false;
        errorMessage = 'Naam moet minimaal 2 karakters bevatten';
      } else if (value.length > 100) {
        isValid = false;
        errorMessage = 'Naam mag maximaal 100 karakters bevatten';
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Voer een geldig emailadres in';
      }
      break;

    case 'message':
      if (value.length < 10) {
        isValid = false;
        errorMessage = 'Bericht moet minimaal 10 karakters bevatten';
      } else if (value.length > 1000) {
        isValid = false;
        errorMessage = 'Bericht mag maximaal 1000 karakters bevatten';
      }
      break;
  }

  if (!isValid) {
    field.classList.add('border-red-500');
    showFieldError(field, errorMessage);
  } else {
    field.classList.add('border-primary-500');
    removeFieldError(field);
  }

  return isValid;
}

function showFieldError(field, message) {
  removeFieldError(field);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

// ========================================
// UI FEEDBACK
// ========================================
function setButtonLoading(button, textElement, isLoading, customText = null) {
  if (isLoading) {
    button.disabled = true;
    button.classList.add('opacity-75', 'cursor-not-allowed');
    textElement.innerHTML = `
      <svg class="animate-spin inline-block w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      ${customText || 'Bezig met verzenden...'}
    `;
  } else {
    button.disabled = false;
    button.classList.remove('opacity-75', 'cursor-not-allowed');
    textElement.innerHTML = `
      <i class="bi bi-send-fill mr-2"></i>
      Verstuur Bericht
    `;
  }
}

function showMessage(type, message) {
  const responseMessage = document.getElementById('responseMessage');

  responseMessage.className = 'text-center font-semibold mt-4';

  if (type === 'success') {
    responseMessage.classList.add('text-green-600', 'bg-green-50', 'border-2', 'border-green-200', 'rounded-lg', 'p-4');
  } else {
    responseMessage.classList.add('text-red-600', 'bg-red-50', 'border-2', 'border-red-200', 'rounded-lg', 'p-4');
  }

  responseMessage.textContent = message;

  responseMessage.style.opacity = '0';
  responseMessage.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    responseMessage.style.transition = 'all 0.3s ease';
    responseMessage.style.opacity = '1';
    responseMessage.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    responseMessage.style.opacity = '0';
    setTimeout(() => {
      responseMessage.textContent = '';
      responseMessage.className = 'text-center font-semibold';
    }, 300);
  }, 8000);

  showToast(type, message);
}

function showToast(type, message) {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-8 right-8 max-w-md transform translate-x-0 transition-all duration-500 ease-out z-50`;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  toast.innerHTML = `
    <div class="${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-start space-x-3">
      <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} text-2xl flex-shrink-0"></i>
      <div class="flex-1">
        <p class="font-semibold mb-1">${type === 'success' ? 'Gelukt!' : 'Error'}</p>
        <p class="text-sm opacity-90">${message.substring(0, 100)}</p>
      </div>
      <button class="text-white hover:text-gray-200 transition-colors" onclick="this.closest('.fixed').remove()">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 5000);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateForm,
    validateField,
    showMessage,
    verifyEmail
  };
}
