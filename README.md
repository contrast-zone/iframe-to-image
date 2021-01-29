# iframe-to-image

This is a fork of [svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot) dealing with iframes.

Experimenting with using the SVG [\<foreignObject>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) element to render and generate images of HTML content.

## usage

    <!DOCTYPE html>
    <html>
        <meta charset="utf-8">
        <head>
            <script src="src/iframe-to-image.js" type="text/javascript"></script>
        </head>
        <body>
            <script type="text/javascript">
                const iframe = document.createElement ('iframe');
                iframe.style.visibility = "hidden";
                iframe.src = "test-file.html";
                iframe.onload = function () {
                    const renderer = new iframetoimage (iframe);
                    renderer.renderToSvg ().then(function(ret) {
                        imgage.src = ret;
                        iframe.remove();
                    });
                }
                document.body.appendChild (iframe);
            </script>
        </body>
    </html>
