/**
 * 
 * @returns {ForeignHtmlRenderer} 
 */
const renderHtml = function() {
    'use strict'
    
    /**
     * 
     * @param {String} contentHtml 
     * @param {StyleSheetList} styleSheets 
     * @param {BaseUrlObject} base 
     * @param {Number} width
     * @param {Number} height
     * 
     * @returns {Promise<String>}
     */
    const ForeignHtmlRenderer = function(contentBody, styleSheets, base, width, height) {
            
        const self = this;

        /**
         * 
         * @param {String} binStr 
         */
        const binaryStringToBase64 = function(binStr) {
            return new Promise(function(resolve) {
                const reader = new FileReader();
                reader.readAsDataURL(binStr); 
                reader.onloadend = function() {
                    resolve(reader.result);
                }  
            });     
        };

        /**
         * 
         * @param {String} url 
         * @returns {Promise}
         */
        const getResourceAsBase64 = function(url) {
            return new Promise(function(resolve, reject) {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = 'blob';

                xhr.onreadystatechange = async function() {
                    if(xhr.readyState === 4 && xhr.status === 200) {
                        const resBase64 = await binaryStringToBase64(xhr.response);
                        resolve(
                            {
                                "resourceUrl": url,
                                "resourceBase64": resBase64
                            }
                        );
                    }
                };

                xhr.send(null);
            });
        };

        /**
         * 
         * @param {String[]} urls 
         * @returns {Promise}
         */
        const getMultipleResourcesAsBase64 = function(urls) {
            const promises = [];
            for(let i=0; i<urls.length; i++) {
                promises.push( getResourceAsBase64(urls[i]) );
            }
            return Promise.all(promises);
        };

        /**
         * 
         * @param {String} str 
         * @param {Number} startIndex 
         * @param {String} prefixToken 
         * @param {String[]} suffixTokens
         * 
         * @returns {String|null} 
         */
        const parseValue = function(str, startIndex, prefixToken, suffixTokens) {
            const idx = str.indexOf(prefixToken, startIndex);
            if(idx === -1) {
                return null;
            }

            let val = '';
            for(let i=idx+prefixToken.length; i<str.length; i++) {
                if(suffixTokens.indexOf(str[i]) !== -1) {
                    break;
                }

                val += str[i];
            }

            return {
                "foundAtIndex": idx,
                "value": val
            }
        };

        /**
         * 
         * @param {String} cssRuleStr 
         * @returns {String[]}
         */
        const getUrlsFromCssString = function(cssRuleStr) {
            const urlsFound = [];
            let searchStartIndex = 0;

            while(true) {
                const url = parseValue(cssRuleStr, searchStartIndex, "url(", [')']);
                if(url === null) {
                    break;
                }

                searchStartIndex = url.foundAtIndex + url.value.length;
                urlsFound.push(removeQuotes(url.value));
            }

            return urlsFound;
        };    


        /**
         * 
         * @param {String} str
         * @returns {String}
         */
        const removeQuotes = function(str) {
            return str.replace(/["']/g, "");
        };

        const escapeRegExp = function(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        };

        /**
         * 
         * @param {StyleSheet} styleSheet
         * @returns {String|urlList}
         */
        const outlineStylesheet = async function(styleSheet) {
            return new Promise(async function(resolve, reject) {
                let cssStyles = "";
                for(let i=0; i<styleSheet.cssRules.length; i++) {
                    const rule = styleSheet.cssRules[i];
                    if (!rule.conditionText) {
                        const cssText = rule.cssText
                        cssStyles += cssText + "\n ";
                        const fetchedResourcesFromStylesheets = await getMultipleResourcesAsBase64(getUrlsFromCssString(cssText));
                        for(let i=0; i<fetchedResourcesFromStylesheets.length; i++) {
                            const r = fetchedResourcesFromStylesheets[i];
                            cssStyles = cssStyles.replace(new RegExp("url\\(\\s*[\"]?" + escapeRegExp(r.resourceUrl) + "[\"]?\\s*\\)","g"), "url('" + r.resourceBase64 + "')") + "\n ";
                        }
                        
                    } else if (window.matchMedia(rule.conditionText).matches) {
                        cssStyles += await outlineStylesheet(rule);
                    }
                    cssStyles=cssStyles;
                }

                resolve(cssStyles);
            });
        }

        /**
         * 
         * @param {HTMLElement} node
         */
        const inlineAttributes = async function(node) {
            var attrs = node.attributes;
            if (attrs) {
                var output = "";
                for(let i = attrs.length - 1; i >= 0; i--) {
                    if (attrs[i].name === "src") {
                        const fetchedResources = await getMultipleResourcesAsBase64([attrs[i].value]);
                        attrs[i].value = fetchedResources[0].resourceBase64;
                        
                    } else if (attrs[i].name === "style") {
                        let urlsFoundInStyle = getUrlsFromCssString(attrs[i].value);
                        const fetchedResources = await getMultipleResourcesAsBase64(urlsFoundInStyle);
                        for(let j=0; j<fetchedResources.length; j++) {
                            const r = fetchedResources[j];
                            let attr = attrs[i].value.replace(new RegExp("url\\(\\s*[\"]?" + escapeRegExp(r.resourceUrl) + "[\"]?\\s*\\)","g"), "url('" + r.resourceBase64 + "')");
                            attrs[i].value = attr;
                        }
                    }
                }
            }
        }

        /**
         * 
         * @returns {Promise<String>}
         */
        this.toSvg = async function() {

            return new Promise(async function(resolve, reject) {

                let head = document.getElementsByTagName('head')[0];
                head.insertBefore(base, head.childNodes[0]);
                
                // generate inlined css
                var cssStyles = "";
                for (let i=0; i<styleSheets.length; i++)
                    cssStyles += await outlineStylesheet(styleSheets[i]);

                // create DOM element string that encapsulates style
                const styleElem = document.createElement("style");
                styleElem.innerHTML = cssStyles;
                const styleElemString = new XMLSerializer().serializeToString(styleElem);


                let bodyElem = contentBody.cloneNode(true);

                // inline element attributes
                inlineAttributes(contentBody);
                let elements = bodyElem.getElementsByTagName("*");
                for(let i=0; i < elements.length; i++)
                    await inlineAttributes(elements[i]);

                const contentRootElemString = new XMLSerializer().serializeToString(bodyElem);

                base.remove();

                const svg = `
                    <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
                        <g transform='translate(0, 0) rotate(0)'>
                            <foreignObject x='0' y='0' width='${width}' height='${height}'>
                                <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
                                    <head>
                                        ${styleElemString}
                                    </head>
                                    ${contentRootElemString}
                                </html>
                            </foreignObject>
                        </g>
                    </svg>
                `;

                const unescapedSvg = unescape(encodeURIComponent(svg));
                const dataUri = `data:image/svg+xml;base64,${window.btoa(unescapedSvg)}`;

                resolve(dataUri);                    
            });
        };

        /**
         * 
         * @return {Promise<Image>}
         */
        this.toImage = async function() {
            return new Promise(async function(resolve, reject) {
                const img = new Image();
                img.src = await self.toSvg();
        
                img.onload = function() {
                    resolve(img);
                };
            });
        };

        /**
         * 
         * @return {Promise<Image>}
         */
        this.toCanvas = async function() {
            return new Promise(async function(resolve, reject) {
                const img = await self.toImage();

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const canvasCtx = canvas.getContext('2d');
                canvasCtx.drawImage(img, 0, 0, img.width, img.height);

                resolve(canvas);
            });
        };    

        /**
         * 
         * @return {Promise<String>}
         */
        this.toBase64Png = async function() {
            return new Promise(async function(resolve, reject) {
                const canvas = await self.toCanvas();
                resolve(canvas.toDataURL('image/png'));
            });
        };

    };

    let setSource = {
        fromIframe: function(iframe, removeIframe, base) {
            if (!base) {
                base = document.createElement('base');
                base.href = iframe.src;
            }
            
            let contentDocument = iframe.contentDocument;
            let styleSheets = contentDocument.styleSheets;
            let contentHtml = contentDocument.body.innerHTML;
            
            let contentBody = contentDocument.body;
            let width = contentBody.scrollLeft + contentBody.scrollWidth;
            let height = contentBody.scrollTop + contentBody.scrollHeight;
            
            if (removeIframe)
                iframe.remove();
            
            return new ForeignHtmlRenderer(contentBody, styleSheets, base, width, height);
        },
        
        fromString: function(strHtml, baseUrl) {
            return new Promise(async function(resolve, reject) {
                var base = undefined;
                if (baseUrl) {
                    base = document.createElement('base');
                    base.href = baseUrl;
                    let head = document.getElementsByTagName('head')[0];
                    head.insertBefore(base, head.childNodes[0]);
                }

                const iframe = document.createElement(`iframe`);
                iframe.style.visibility = "hidden";
                document.body.appendChild(iframe);
                
                iframe.onload = function () {
                    if (baseUrl) base.remove();
                    resolve(setSource["fromIframe"](iframe, true, base));
                }
                
                iframe.srcdoc = strHtml;
            });
        },
        
        fromFile: async function(urlHtml) {
            return new Promise(async function(resolve, reject) {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", urlHtml);

                xhr.onreadystatechange = async function() {
                    if(xhr.readyState === 4 && xhr.status === 200) {
                        resolve(setSource["fromString"](xhr.response, urlHtml))
                    }
                };

                xhr.send(null);
            });
        }
    };

    function getRenderer (constructor, param) {
        this.toBase64Svg = async function() {
            return new Promise(async function(resolve, reject) {
                let foreignHtmlRenderer = await setSource[constructor](param);
                resolve(foreignHtmlRenderer.toSvg());
            });
        };
        
        this.toImage = async function() {
            return new Promise(async function(resolve, reject) {
                let foreignHtmlRenderer = await setSource[constructor](param);
                resolve(foreignHtmlRenderer.toImage());
            });
        };
        
        this.toCanvas = async function() {
            return new Promise(async function(resolve, reject) {
                let foreignHtmlRenderer = await setSource[constructor](param);
                resolve(foreignHtmlRenderer.toCanvas());
            });
        };
        
        this.toBase64Png = async function() {
            return new Promise(async function(resolve, reject) {
                let foreignHtmlRenderer = await setSource[constructor](param);
                resolve(foreignHtmlRenderer.toBase64Png());
            });
        }
    }


    return {
        foreignHtmlRenderer: ForeignHtmlRenderer,
        fromIframe: function(iframe) {
            return new getRenderer("fromIframe", iframe);
        },
        fromString: function(strHtml) {
            return new getRenderer("fromString", strHtml);
        },
        fromFile: function(fileName) {
            return new getRenderer("fromFile", fileName);
        }
    };
};

