let preloader = select('#loading-screen');
if (preloader) {
    window.addEventListener('load', () => {
        preloader.remove()});}