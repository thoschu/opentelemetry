# Information about the project and hints - Observability with OpenTelemetry

All of OpenTelemetry core concepts have been recorded in the attached feature branches.

[README.md](README.md)

---
---

Unfortunately, there are no sufficiently good dependencies or libarays available for recording browser metrics (Web Vitals),
so you can alternatively record them yourself with corresponding browser API´s and then send them to an observability backend using the fecht api.

https://www.w3schools.com/js/js_api_intro.asp

https://web.dev/articles/vitals?hl=de

## JS Browser BOM and JS Web APIs

Various JavaScript APIs are available to read metrics in the browser.
These metrics can provide information about performance, usage, network communications,
and other aspects of the application. Here are some common APIs and methods with examples:

①. **Performance API**

```javascript
console.log(window.performance.timing);
console.log(performance.now());
console.log(performance.memory);
console.log(performance.getEntriesByType('navigation'));
```

②. **Navigator API**

```javascript
console.log(window.navigator.userAgent);
console.log(navigator.platform);
console.log(navigator.language);
```

③. **Screen API**

```javascript
console.log(window.screen.width);
console.log(screen.height);
```

④. **Network Information API**

```javascript
if (window.navigator.connection) {
  console.log(navigator.connection.effectiveType);
  console.log(navigator.connection.downlink);
}
```

⑤. **Geolocation API**

```javascript
if (window.navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  });
}
```

⑥. **Example with Fetch API**

```javascript
var userAgent = window.navigator.userAgent;
var navigation = performance.getEntriesByType('navigation');

fetch('http://collector:4318/v1/logs', {
    method: 'POST',
    body: JSON.stringify({
        title: 'metrics',
        body: {
            userAgent,
            navigation,
            // [...]
        }
    }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    }
}).then((response) => response.json())
  .then((data) => {
    console.log(data);
}).catch(console.error);
```

---

https://www.w3schools.com/js/js_window.asp

https://www.w3schools.com/js/js_window_screen.asp

https://www.w3schools.com/js/js_window_location.asp

https://www.w3schools.com/js/js_window_navigator.asp

https://www.w3schools.com/js/js_api_geolocation.asp
