# Library that Exports my simplified vanilla JS version of WaitForKeyElement
## which is a simple async function that returns a Promise that resolves to an element by a given selector, when that element is found
### Usage:
``WaitForKeyElement(querySelectorString, optionalTimeoutInMilliseconds)``

### Example 1:
```
WaitForKeyElement('#someElement', 10000).then((foundElement) => {
  //do things with foundElement
});
```

### Example 2:
```
//in async context*
const foundElement = await WaitForKeyElement('#someElement'));
//do things with foundElement
```
