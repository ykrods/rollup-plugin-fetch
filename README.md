# rollup-plugin-fetch

fetch resources via https

# How to Use
```javascript
import fetch from "rollup-plugin-fetch";

plugins: [
  // ...

  fetch({
    targets: [
      {
        url: "https://example.org/foo.png",
        dest: "dist/resources/foo.png"
      },
    ],
  }),
]
```
