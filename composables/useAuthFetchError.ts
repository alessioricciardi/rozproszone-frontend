export const useFetchError = () => {
  const loggedIn = useState('loggedIn')
  loggedIn.value = false

  useToast().add({
    icon: 'material-symbols:error-outline-rounded',
    title: 'Error',
    description: 'Unathorized Acces. Please try to log in again.',
    color: 'error',
  })
}
