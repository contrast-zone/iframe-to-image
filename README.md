# render-html.js

This is a fork of [svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot) (SFS), wrapping it within calling interface to render images from HTML iframes, strings and files. SFS project is described as: *"Experimenting with using the SVG [\<foreignObject>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) element to render and generate images of HTML content."* SFS features lightweight and clean implementation with some neat design choices. Its benefit is HTML rendering exactly as browser would do (in fact, the very browser natively does it), while it operates using only client side scripting. Along the wrapper, we put some wage on SFS we find necessary, considering relative URL system, CSS media queries, and HTML body traversal function. Nevertheless, the elegance of SFS original implementation remains a valuable material, and we invite interested readers to visit the above link for more information.

## use instructions

We use *render-html.js* library by including Javascript code file `/src/render-html.js`. To convert HTML content to images, we use the following Javascript notation: 

- We concatenate the following fragments by `.`:
    - We start with the library object:
        - `renderHtml`
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

    renderHtml.inputFormat(...).outputFormat()
        .then((output) => {
            ... = output;
        });

In a specific example, if we want to render HTML file `test-file.html` to base64png and specify it as a `src` attribute of an `image` element, we write:

    renderHtml.fromFile('test-file.html').toBase64Png()
        .then((base64png) => {
            document.getElementById('image').src = base64png;
        });

Under the folder `/test/` we may find some live use example. We may play with `/test/index.html` and `/test/example1/index.html` in an editor and test it in a browser to see the result (we may need a HTTP server to do this because *render-html.js* employs AJAX calls).

## Test cases

The library still needs to be tested. At the time of writing, Safari had some allegedly "to-work-around-render-it-twice" struggles with it.
