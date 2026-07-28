function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,zh-CN,es,fr,ar,ja,ko,de,pt,ru,it,th,vi,bn,ta,te,mr,gu,kn,ml,pa,ur',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
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
        '.goog-te-banner-frame{display:none!important;}' +
        'body{top:0!important;}' +
        '#goog-gt-tt{display:none!important;}' +
        '.goog-te-balloon-frame{display:none!important;}' +
        '.goog-text-highlight{background:none!important;box-shadow:none!important;}';
    document.head.appendChild(css);
})();
