# render-html

This is a fork of [svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot) dealing with iframes.

Experimenting with using the SVG [\<foreignObject>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) element to render and generate images of HTML content.

## usage

We use *render-html* library by including javascript code file `/src/render-html.js`. To convert HTML cntent to images, we concatenate the following fragments by `.`:

- We start with the library call:
    - `renderHtml()`

- Then we concatenate one of input formats:
    - `fromIframe(...)`
    - `fromString(...)`
    - `fromFile(...)`

- Then we concatenate one of output formats:
    - `toSvg()`
    - `toImage()`
    - `toCanvas()`
    - `toBase64Png()`

- Then we concatenate function `then` which inlines whatever we want to do with the output.
    - `then(...)`

We combine inputs and outputs in following general pattern:

    renderHtml().inputFormat(...).outputFormat()
        .then((output) => {
            imageElement.src = output;
        });

in a specific example, if we want to convert HTML file `test-file.html` to base64png and specify it as a `src` attribute of `image` element, we write:

    renderHtml().fromFile('test-file.html').toBase64Png()
        .then((base64png) => {
            document.getElementById('image').src = base64png;
        });

Under folder `/test` we may find a live usage example. Open `index.html` in editor and test it in browser to see the result.

## Test cases

The library is tested on the latest Firefox and Chrommium.
