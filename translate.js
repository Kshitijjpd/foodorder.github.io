(function() {
    var css = document.createElement('style');
    css.textContent =
        '.translate-wrap{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:100000;padding:0.3rem 0.8rem;background:rgba(0,0,0,0.85);border-radius:0 0 12px 12px;display:flex;align-items:center;gap:0.5rem;box-shadow:0 2px 12px rgba(0,0,0,0.2);}' +
        '.translate-wrap .globe-icon{color:#fff;font-size:0.85rem;cursor:pointer;}' +
        '.translate-wrap select{background:transparent;color:#fff;border:none;font-family:"Nunito",sans-serif;font-size:0.78rem;font-weight:600;cursor:pointer;outline:none;padding:0.2rem;appearance:none;-webkit-appearance:none;}' +
        '.translate-wrap select option{background:#222;color:#fff;}' +
        '.goog-te-banner-frame,.skiptranslate{display:none!important;}' +
        'body{top:0!important;}';
    document.head.appendChild(css);

    var wrap = document.createElement('div');
    wrap.className = 'translate-wrap';
    wrap.innerHTML =
        '<span class="globe-icon">🌐</span>' +
        '<select id="lang-select">' +
        '<option value="">English</option>' +
        '<option value="hi">हिन्दी</option>' +
        '<option value="zh-CN">中文</option>' +
        '<option value="es">Español</option>' +
        '<option value="fr">Français</option>' +
        '<option value="ar">العربية</option>' +
        '<option value="ja">日本語</option>' +
        '<option value="ko">한국어</option>' +
        '<option value="de">Deutsch</option>' +
        '<option value="pt">Português</option>' +
        '<option value="ru">Русский</option>' +
        '<option value="it">Italiano</option>' +
        '<option value="th">ไทย</option>' +
        '<option value="vi">Tiếng Việt</option>' +
        '<option value="bn">বাংলা</option>' +
        '<option value="ta">தமிழ்</option>' +
        '<option value="te">తెలుగు</option>' +
        '<option value="mr">मराठी</option>' +
        '<option value="gu">ગુજરાતી</option>' +
        '<option value="kn">ಕನ್ನಡ</option>' +
        '<option value="ml">മലയാളം</option>' +
        '<option value="pa">ਪੰਜਾਬੀ</option>' +
        '<option value="ur">اردو</option>' +
        '</select>';
    document.body.appendChild(wrap);

    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false
        }, 'google_translate_element');
    };

    var hidden = document.createElement('div');
    hidden.id = 'google_translate_element';
    hidden.style.display = 'none';
    document.body.appendChild(hidden);

    var gScript = document.createElement('script');
    gScript.src = '//translate.google.com/translate_element.js?cb=googleTranslateElementInit';
    document.body.appendChild(gScript);

    document.getElementById('lang-select').addEventListener('change', function() {
        var lang = this.value;
        var trySet = function(attempts) {
            var frame = document.querySelector('.goog-te-combo');
            if (frame) {
                frame.value = lang;
                frame.dispatchEvent(new Event('change'));
            } else if (attempts > 0) {
                setTimeout(function() { trySet(attempts - 1); }, 300);
            }
        };
        if (!lang) {
            var restore = document.querySelector('.goog-te-banner-frame');
            if (restore) {
                var doc = restore.contentDocument || restore.contentWindow.document;
                var btn = doc.querySelector('.goog-close-link');
                if (btn) btn.click();
            }
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + location.hostname;
            location.reload();
            return;
        }
        trySet(15);
    });
})();
