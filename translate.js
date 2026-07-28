function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,zh-CN,es,fr,ar,ja,ko,de,pt,ru,it,th,vi,bn,ta,te,mr,gu,kn,ml,pa,ur',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'gt-box');
}

(function() {
    var wrap = document.createElement('div');
    wrap.id = 'gt-wrap';
    wrap.innerHTML = '<span id="gt-icon">🌐</span><div id="gt-box"></div>';
    document.body.appendChild(wrap);

    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(s);

    var css = document.createElement('style');
    css.textContent =
        '#gt-wrap{position:fixed;top:12px;right:12px;z-index:100000;display:flex;align-items:center;gap:4px;}' +
        '#gt-icon{font-size:1.2rem;cursor:pointer;background:rgba(0,0,0,0.6);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;line-height:1;}' +
        '#gt-box{overflow:hidden;max-width:0;opacity:0;transition:all .3s ease;}' +
        '#gt-wrap:hover #gt-box,#gt-wrap.open #gt-box{max-width:200px;opacity:1;}' +
        '#gt-box .goog-te-gadget{font-size:0!important;color:transparent!important;}' +
        '#gt-box .goog-te-gadget>span{display:none!important;}' +
        '#gt-box .goog-te-combo{background:#fff;border:1px solid #ddd;border-radius:6px;padding:4px 6px;font-size:12px;font-family:"Nunito",sans-serif;cursor:pointer;outline:none;color:#333;}' +
        '.goog-te-banner-frame,iframe.goog-te-banner-frame,.skiptranslate iframe{display:none!important;height:0!important;visibility:hidden!important;}' +
        'body{top:0!important;position:static!important;}' +
        '#goog-gt-tt,.goog-te-balloon-frame{display:none!important;}' +
        '.goog-text-highlight{background:none!important;box-shadow:none!important;}' +
        '.skiptranslate{display:none!important;}' +
        '#gt-box .skiptranslate{display:block!important;}' +
        '#gt-wrap,#gt-box{display:block!important;}' +
        '@media(max-width:480px){#gt-wrap{top:8px;right:8px;}#gt-icon{width:28px;height:28px;font-size:1rem;}}';
    document.head.appendChild(css);

    document.getElementById('gt-icon').addEventListener('click', function() {
        wrap.classList.toggle('open');
    });

    function killBanner() {
        var frames = document.querySelectorAll('.goog-te-banner-frame,iframe.skiptranslate');
        for (var i = 0; i < frames.length; i++) { frames[i].style.display = 'none'; frames[i].style.height = '0'; }
        document.body.style.top = '0px';
    }
    setInterval(killBanner, 500);
})();
