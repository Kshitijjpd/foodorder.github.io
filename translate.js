function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,zh-CN,es,fr,ar,ja,ko,de,pt,ru,it,th,vi,bn,ta,te,mr,gu,kn,ml,pa,ur',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

(function() {
    var el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.cssText = 'position:fixed;top:10px;right:10px;z-index:100000;background:#fff;padding:6px 12px;border-radius:10px;box-shadow:0 2px 15px rgba(0,0,0,0.15);';
    document.body.appendChild(el);

    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(s);

    var css = document.createElement('style');
    css.textContent =
        '.goog-te-banner-frame{display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important;}' +
        'body{top:0!important;position:static!important;}' +
        '#goog-gt-tt{display:none!important;}' +
        '.goog-te-balloon-frame{display:none!important;}' +
        '.goog-text-highlight{background:none!important;box-shadow:none!important;}' +
        'iframe.goog-te-banner-frame{display:none!important;}' +
        '.skiptranslate{display:none!important;}' +
        '#google_translate_element .skiptranslate{display:block!important;}' +
        '#google_translate_element{display:block!important;}';
    document.head.appendChild(css);

    function killBanner() {
        var frames = document.querySelectorAll('.goog-te-banner-frame, iframe.skiptranslate');
        for (var i = 0; i < frames.length; i++) {
            frames[i].style.display = 'none';
            frames[i].style.height = '0';
            frames[i].style.visibility = 'hidden';
        }
        document.body.style.top = '0px';
        document.body.style.position = 'static';
    }

    setInterval(killBanner, 500);
    setTimeout(killBanner, 1000);
    setTimeout(killBanner, 2000);
    setTimeout(killBanner, 3000);
})();
