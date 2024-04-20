if ("serviceWorker" in navigator) {
// declaring scope manually
  navigator.serviceWorker.register("./cachemanager.js", {
    scope: "./"
  }).then(ok => {
    console.log('SW', 'enabled cache control');
  }, error => {
    console.warn(error);
  });
}
