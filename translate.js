(function() {
    var css = document.createElement('style');
    css.textContent =
        '#google_translate_element{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:100000;background:rgba(0,0,0,0.85);border-radius:0 0 12px 12px;padding:0.35rem 1rem;display:flex;align-items:center;gap:0.5rem;box-shadow:0 2px 12px rgba(0,0,0,0.2);}' +
        '#google_translate_element .globe-label{color:#fff;font-size:0.82rem;pointer-events:none;}' +
        '.goog-te-gadget{font-family:"Nunito",sans-serif!important;font-size:0!important;color:transparent!important;}' +
        '.goog-te-gadget span{display:none!important;}' +
        '.goog-te-gadget .goog-te-combo{background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:6px;padding:0.25rem 0.5rem;font-family:"Nunito",sans-serif;font-size:0.8rem;font-weight:600;cursor:pointer;outline:none;appearance:auto;}' +
        '.goog-te-gadget .goog-te-combo option{background:#222;color:#fff;}' +
        '.goog-te-banner-frame{display:none!important;}' +
        'body{top:0!important;}' +
        '.skiptranslate iframe{display:none!important;}';
    document.head.appendChild(css);

    var el = document.createElement('div');
    el.id = 'google_translate_element';
    el.innerHTML = '<span class="globe-label">🌐</span>';
    document.body.appendChild(el);

    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'hi,zh-CN,es,fr,ar,ja,ko,de,pt,ru,it,th,vi,bn,ta,te,mr,gu,kn,ml,pa,ur,en',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };

    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
})();
