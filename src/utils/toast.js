import { toast } from 'react-toastify'

export const showToast = {
  success: (message) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  },

  error: (message) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  },

  info: (message) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  },

  warning: (message) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  },
}

// Helper function for handling API errors
export const handleApiError = (error) => {
  const errorMessage =
    error?.message ||
    error?.error?.message ||
    'Bir hata oluştu. Lütfen tekrar deneyin.'
  showToast.error(errorMessage)
}

// Helper function for handling success messages
export const handleApiSuccess = (message = 'İşlem başarıyla tamamlandı.') => {
  showToast.success(message)
}

