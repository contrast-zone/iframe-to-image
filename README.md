# iframe-to-image

This is a fork of [svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot) dealing with iframes.

Experimenting with using the SVG [\<foreignObject>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) element to render and generate images of HTML content.

## usage

    iframetoimage(iframe).renderToSvg().then((svg) => {
        image.src = svg;
    });

