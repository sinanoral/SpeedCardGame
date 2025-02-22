export const register = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function (registration) {
                // Registration was successful``
                console.log('ServiceWorker registration successful with scope: ', registration.scope)
                registration.update()
            })
            .catch(function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err)
            })
    }
}
