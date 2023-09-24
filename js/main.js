/* global SVGInjector, ga */

// Check that service workers are supported
if ("serviceWorker" in navigator) {
  // Use the window load event to keep the page load performant

  console.log("Registering service-worker");
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}

// Elements to inject
var mySVGsToInject = document.querySelectorAll("img.svg-inject");
// Do the injection
SVGInjector(mySVGsToInject);

(function(i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function() {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");

ga("create", "UA-72531610-1", "auto");
ga("send", "pageview");

let deferredPrompt;
window.addEventListener("beforeinstallprompt", event => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  event.preventDefault();

  // Stash the event so it can be triggered later.
  deferredPrompt = event;

  // Attach the install prompt to a user gesture
  document.querySelector("#installBtn").addEventListener("click", event => {
    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      deferredPrompt = null;
    });
  });

  // Update UI notify the user they can add to home screen
  const installBanner = document.querySelector("#installBanner");
  if (installBanner) 
    installBanner.style.display = "flex";
});
