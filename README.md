# render-html.js

This is a fork of [svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot) (SFS), wrapping it within calling interface to render images from HTML iframes, strings and files. SFS project is described as: *Experimenting with using the SVG [\<foreignObject>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) element to render and generate images of HTML content.* SFS features minimal and clean implementation coupled with some very smart design choices.

## use instructions

We use *render-html* library by including Javascript code file `/src/render-html.js`. To convert HTML content to images, we use the following Javascript notation: 

- We concatenate the following fragments by `.`:
    - We start with the library function call:
        - `renderHtml()`
    - Then we concatenate one of the input formats:
        - `fromIframe(...)`
        - `fromString(...)`
        - `fromFile(...)`
    - Then we concatenate one of the output formats:
        - `toBase64Svg()`
        - `toImage()`
        - `toCanvas()`
        - `toBase64Png()`
    - Then we concatenate function `then` which inlines whatever we want to do with the output.
        - `then(...)`

In a general example, we combine inputs and outputs as in the following pattern:

    renderHtml().inputFormat(...).outputFormat()
        .then((output) => {
            ... = output;
        });

In a specific example, if we want to convert HTML file `test-file.html` to base64png and specify it as a `src` attribute of `image` element, we write:

    renderHtml().fromFile('test-file.html').toBase64Png()
        .then((base64png) => {
            document.getElementById('image').src = base64png;
        });

Under folder `/test/` we may find a live use example. We may play with `index.html` in an editor and test it in a browser to see the result.

## Test cases

The library is tested on the latest the following platforms:

- Linux
    - Firefox
    - Chrommium
- Android
    - Chrome
    - Samsung Internet Browser
