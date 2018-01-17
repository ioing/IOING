export const serviceWorker = (rst) => {
  if ('serviceWorker' in navigator) {
    let service = rst.getAttribute('service-worker')
    if (service && service.length) {

      // service workers

      navigator.serviceWorker.register(service, {
        scope: './'
      }).then(function(registration) {
        console.log('service workers success!')
      }).catch(function(error) {
        console.log(error)
      })
    }
  }
}
