var ua = parseUA();

function parseUA() {
    var ua = navigator.userAgent.toLowerCase(),
        match,
        browser = {},
        numberify = function(s) {
            var c = 0;
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 1) ? '' : '.';
            }));
        };

    match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
        [];
    if (match[1]) {
        browser[match[1]] = numberify(match[2] || '0');
    }
    // Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome) {
        match = /(webkit)[ \/]([\w.]+)/.exec(ua) || [];
        browser.webkit = numberify(match[2] || '0');
    } else if (browser.webkit) {
        browser.safari = browser.webkit;
    }

    return browser;
}

var Loader = {
    // 浏览器是否支持link标签的onload事件
    _cssLoad: ((!ua.webkit && !ua.mozilla) || ua.mozilla > 8 || ua.webkit >= 535.24) &&
        !(ua.chrome && ua.chrome < 19),
    _getAbsoluteUrl: function (url) {
        var link = document.createElement('a');
        link.href = url;
        return link.href;
    },
    loadCSS: function (url, callback) {
        url = this._getAbsoluteUrl(url);

        var node,
            timer,
            poll = function () {
                var sheets, i, len,
                    hasRules;
                if (ua.webkit) {
                    // 低版本webkit内核，遍历styleSheets判定
                    sheets = document.styleSheets;
                    for (i = 0, len  = sheets.length; i < len; ++i) {
                        if (sheets[i].href === url) {
                            clearTimeout(timer);
                            callback();
                            return;
                        }
                    }
                } else {
                    // 低版本firefox，使用sheet属性是否可访问判定
                    try {
                        hasRules = !!node.sheet.cssRules;
                        callback();
                        return;
                    } catch (ex) {}
                }
                timer = setTimeout(poll, 50);
            };

        if (!this._cssLoad && ua.mozilla) {
            node = document.createElement('style');
            node.innerHTML = '@import url(' + url + ')';
        } else {
            node = document.createElement('link');
            node.setAttribute('rel', 'stylesheet');
            node.setAttribute('href', url);
        }
        if (this._cssLoad) {
            node.onload = callback;
        } else {
            setTimeout(poll, 50);
        }

        document.getElementsByTagName('head')[0].appendChild(node);
    },
    loadJS: function (url, callback) {
        var node = document.createElement('script');
        node.setAttribute('type', 'text/javascript');
        node.setAttribute('src', url);
        if (node.readyState) { // for IE
            node.onreadystatechange = function () {
                if (node.readyState == "loaded" || node.readyState == "complete") {
                    node.onreadystatechange = null;
                    callback();
                }
            };
        } else { // for other browsers
            node.onload = callback;
        }
        document.getElementsByTagName('head')[0].appendChild(node);
    }
};
