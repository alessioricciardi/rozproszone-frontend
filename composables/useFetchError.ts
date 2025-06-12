export const useFetchError = () => {
  useToast().add({
    icon: 'material-symbols:error-outline-rounded',
    title: 'Error',
    description: 'Something went wrong. Please try again later.',
    color: 'error',
  })
}
