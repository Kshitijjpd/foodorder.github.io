(function() {
    // ──── CONFIG ────
    // Get your FREE API key from: https://aistudio.google.com/apikey
    var GEMINI_API_KEY = atob('QVEuQWI4Uk42THh5c01INjJTYjV1ay1FeldDMnlpTzE0bzF4VzUzX3Z1X3pRd2FUa2ZTRUE=');
    var GEMINI_MODEL = 'gemini-flash-latest';
    var botName = 'FoodieBot';
    var botAvatar = '🤖';

    var menuItems = [
        { name: 'Samosa', price: 10, emoji: '🥟', desc: 'Crispy spicy snack' },
        { name: 'Papri Chaat', price: 20, emoji: '🍽️', desc: 'Tangy chaat' },
        { name: 'Chaat', price: 30, emoji: '🍛', desc: 'Spicy chaat platter' },
        { name: 'Maggi', price: 40, emoji: '🍜', desc: 'Comfort noodles' },
        { name: 'Cake', price: 60, emoji: '🎂', desc: 'Fresh baked cake' },
        { name: 'Ice Cream', price: 70, emoji: '🍦', desc: 'Creamy ice cream' },
        { name: 'Tasty Burger', price: 25, emoji: '🍔', desc: 'Juicy burger - Bestseller!' },
        { name: 'Tasty Cakes', price: 15, emoji: '🧁', desc: 'Mini cakes' },
        { name: 'Tasty Sweets', price: 10, emoji: '🍬', desc: 'Indian mithai' },
        { name: 'Tasty Cupcakes', price: 15, emoji: '🧁', desc: 'Cute cupcakes' },
        { name: 'Cold Drinks', price: 10, emoji: '🥤', desc: 'Refreshing cold drink' },
        { name: 'Cold Ice-Cream', price: 10, emoji: '🍦', desc: 'Budget ice cream' }
    ];

    var systemPrompt =
        'You are FoodieBot, a food ordering assistant for a college food stall.\n\n' +
        'MENU (ONLY these items exist, nothing else):\n' +
        menuItems.map(function(i) { return i.name + ' = ₹' + i.price; }).join(', ') + '\n\n' +
        'RULES:\n' +
        '1. ALWAYS reply in the SAME language the user writes in. If they write Chinese, reply in Chinese. French? Reply in French. Spanish, Japanese, Korean, Arabic, ANY language — reply in that language. Auto-detect and match.\n' +
        '2. Keep replies to 1-2 SHORT sentences max. Never write long paragraphs.\n' +
        '3. ONLY talk about items on the menu above. Never suggest items not on the menu.\n' +
        '4. If asked about non-food topics, playfully redirect to food ordering.\n' +
        '5. Be friendly and casual like a friend. Use emoji sparingly (1-2 max).\n' +
        '6. Use exact item names from the menu when recommending.\n' +
        '7. NEVER output your thinking, planning, reasoning, or instructions. ONLY output the final reply meant for the customer.\n' +
        '8. NEVER start with labels like "Response:", "Tone:", "Style:" etc. Just give the direct reply.\n' +
        '9. Use conversation history to understand context from previous messages.\n';

    var conversationMessages = [];
    var isOpen = false;
    var hasGreeted = false;

    // ──── Cart Functions ────
    function getCart() { return JSON.parse(localStorage.getItem('foodCart') || '[]'); }
    function saveCart(cart) {
        localStorage.setItem('foodCart', JSON.stringify(cart));
        if (typeof window.renderCart === 'function') window.renderCart();
        if (typeof window.updateCartCount === 'function') window.updateCartCount();
    }

    function addToCartFromChat(name, price) {
        var cart = getCart();
        var found = false;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].name === name) { cart[i].qty += 1; found = true; break; }
        }
        if (!found) cart.push({ name: name, price: price, qty: 1 });
        saveCart(cart);
    }

    function getCartContext() {
        var cart = getCart();
        if (cart.length === 0) return '\n[Cart: khali hai]';
        var items = cart.map(function(c) { return c.name + ' x' + c.qty; }).join(', ');
        var total = 0;
        for (var i = 0; i < cart.length; i++) total += cart[i].price * cart[i].qty;
        return '\n[Cart: ' + items + ' | Total: ₹' + total + ']';
    }

    // ──── Item Card UI ────
    function formatItemCard(item) {
        return '<div class="cb-item-card" onclick="window._chatbotAddItem(\'' + item.name + '\',' + item.price + ')">' +
            '<span class="cb-item-emoji">' + item.emoji + '</span>' +
            '<span class="cb-item-name">' + item.name + '</span>' +
            '<span class="cb-item-price">₹' + item.price + '</span>' +
            '<span class="cb-item-add">+ Add</span>' +
            '</div>';
    }

    function findMentionedItems(text) {
        var found = [];
        var seen = {};
        for (var i = 0; i < menuItems.length; i++) {
            var name = menuItems[i].name.toLowerCase();
            if (text.toLowerCase().indexOf(name) !== -1 && !seen[name]) {
                seen[name] = true;
                found.push(menuItems[i]);
            }
        }
        return found;
    }

    function cleanResponse(text) {
        var lines = text.split('\n');
        var cleaned = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (/^(Tone|Style|Response|Formulate|Plan|Thinking|Reasoning|Approach|Note|Context|Strategy|Language|Output|Reply|Format|Mode|Instruction)[\s]*[:]/i.test(line)) continue;
            if (/^\*\*(Tone|Style|Response|Formulate|Thinking|Plan)/i.test(line)) continue;
            if (/^(Okay,? (so|let|I)|Let me |I need to |I'll |I should |First,? I|Here'?s my|My approach)/i.test(line)) continue;
            cleaned.push(line);
        }
        text = cleaned.join('\n');
        text = text.replace(/\*\*Formulate Response\*\*[\s\S]*/gi, '');
        text = text.replace(/#{1,3}\s*/g, '');
        text = text.replace(/\[Cart:.*?\]/g, '');
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/^\s*[\*\-]\s+/gm, '');
        text = text.replace(/\*\*/g, '');
        text = text.trim();
        if (!text || text.length < 5) text = 'Hey! What would you like to order? Check out our Tasty Burger (₹25) or Samosa (₹10)! 😋';
        return text;
    }

    // ──── Gemini AI ────
    function callGeminiAI(userMsg, callback) {
        var cartContext = getCartContext();
        var fullUserMsg = userMsg + cartContext;

        conversationMessages.push({ role: 'user', parts: [{ text: fullUserMsg }] });

        if (conversationMessages.length > 16) {
            conversationMessages = conversationMessages.slice(-12);
        }

        var body = {
            contents: conversationMessages,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { maxOutputTokens: 250, temperature: 0.9 }
        };

        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY;

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var aiText = '';
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                aiText = data.candidates[0].content.parts[0].text;
                aiText = cleanResponse(aiText);
                conversationMessages.push({ role: 'model', parts: [{ text: aiText }] });
            } else {
                aiText = getFallbackResponse(userMsg);
            }
            callback(aiText);
        })
        .catch(function() {
            callback(getFallbackResponse(userMsg));
        });
    }

    // ──── Fallback (no API key / offline) ────
    function getFallbackResponse(msg) {
        var m = msg.toLowerCase().trim();
        var cart = getCart();

        if (/^(hi|hello|hey|hii|namaste|yo|bhai|bro)/.test(m))
            return 'Hey bhai! 👋 Kya khana hai aaj batao — spicy, sweet, ya kuch thanda? 😋';

        if (/\b(bye|thanks|thanku|shukriya)\b/.test(m))
            return 'Thank you bhai! 🙏 Enjoy karo! Jab bhook lage wapas aana! 👋';

        if (/\b(bhook|bhuk|hungry|khana|kha|khila|pet)\b/.test(m)) {
            return '🍔 Bhook lagi? Boss, Tasty Burger try kar sirf ₹25 ka — bestseller hai! Cold Drinks ke saath ₹35 mein full meal ban jayega! 🤤';
        }

        if (/(kuch bhi|jo bhi|anything|tum batao|batao|suggest|recommend|kya lu|kya khau)/.test(m)) {
            if (cart.length > 0) {
                return '⭐ Cart mein already items hain! Ek Cold Drinks (₹10) add kardo — perfect combo banega! 🥤';
            }
            return '🔥 Bhai aaj ke special: Tasty Burger (₹25) + Cold Drinks (₹10) = ₹35 mein full deal! Try kar, regret nahi hoga! 🍔🥤';
        }

        if (/\b(menu|item|kya hai|kya milega|dikhao)\b/.test(m))
            return '🍽️ Boss hamare paas sab hai — Samosa ₹10, Burger ₹25, Maggi ₹40, Cake ₹60, Ice Cream ₹70, aur bahut kuch! Kya chahiye? 😋';

        if (/\b(spicy|teekha|tikha|masala|chatpata|mirch)\b/.test(m))
            return '🌶️ Teekha chahiye? Samosa (₹10) ekdum crispy, Papri Chaat (₹20) tangy wali, ya Chaat (₹30) full chatpata! Kaunsa? 🔥';

        if (/\b(sweet|meetha|mithai|dessert|mitha)\b/.test(m))
            return '🍰 Meetha mood! Cake ₹60 fresh baked, Ice Cream ₹70 creamy, ya Tasty Sweets ₹10 mein desi meetha! Kya lagau? 😋';

        if (/\b(cold|thanda|drink|cool)\b/.test(m))
            return '🥤 Thanda chahiye? Cold Drinks sirf ₹10, Cold Ice-Cream bhi ₹10! Dono le lo ₹20 mein full refreshment! ❄️';

        if (/\b(cheap|sasta|budget|kam)\b/.test(m))
            return '💰 Bhai ₹10-15 mein bahut kuch hai — Samosa ₹10, Tasty Sweets ₹10, Cold Drinks ₹10, Cold Ice-Cream ₹10, Tasty Cakes ₹15! Sab sasta aur achha! 😊';

        if (/\b(burger)\b/.test(m))
            return '🍔 Tasty Burger — sirf ₹25! Juicy, filling, aur bestseller! Cold Drinks (₹10) saath mein le — ₹35 mein full meal! 🤤';

        if (/\b(samosa|samose)\b/.test(m))
            return '🥟 Samosa — sirf ₹10! Crispy, spicy, classic! Chaat (₹30) ke saath le full chaat party ho jayegi! 🔥';

        if (/\b(maggi|magi|noodle)\b/.test(m))
            return '🍜 Maggi — ₹40! Comfort food, hostel wali feel! Cold Drinks saath mein le — perfect combo! 😄';

        if (/\b(offer|discount|deal)\b/.test(m))
            return '🏷️ Offers dekhne ke liye viewcart page pe jao! Wahan "Available Offers" mein sab deals dikhenge. Apply karo aur save karo! 🎉';

        if (/\b(cart|my cart|mera cart)\b/.test(m)) {
            if (cart.length === 0) return '🛒 Cart khali hai bhai! Kuch add kar — menu bol to dikhata hoon! 😊';
            var total = 0;
            var names = [];
            for (var i = 0; i < cart.length; i++) { total += cart[i].price * cart[i].qty; names.push(cart[i].name + ' x' + cart[i].qty); }
            return '🛒 Cart mein: ' + names.join(', ') + '\nTotal: ₹' + total + '\n\nCheckout karna hai ya kuch aur add karna hai? 😊';
        }

        return '😋 Bhai batao kya chahiye — "spicy" bol teekhe ke liye, "sweet" meethe ke liye, ya directly item ka naam bol! Main hoon na yahan! 🍔';
    }

    // ──── Main Response Handler ────
    function getResponse(msg, callback) {
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
            callGeminiAI(msg, callback);
        } else {
            callback(getFallbackResponse(msg));
        }
    }

    // ──── UI Injection ────
    function injectStyles() {
        var css = document.createElement('style');
        css.textContent =
            '#cb-widget{position:fixed;bottom:1.5rem;right:1.5rem;z-index:99998;font-family:"Nunito",sans-serif;}' +
            '#cb-toggle{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#ff3838,#ff6b35);color:#fff;border:none;cursor:pointer;font-size:1.6rem;box-shadow:0 4px 20px rgba(255,56,56,0.4);transition:all .3s;display:flex;align-items:center;justify-content:center;}' +
            '#cb-toggle:hover{transform:scale(1.1);box-shadow:0 6px 25px rgba(255,56,56,0.5);}' +
            '#cb-toggle.open{background:linear-gradient(135deg,#333,#555);}' +
            '#cb-toggle .pulse{position:absolute;width:60px;height:60px;border-radius:50%;background:rgba(255,56,56,0.3);animation:cb-pulse 2s infinite;}' +
            '@keyframes cb-pulse{0%{transform:scale(1);opacity:1;}100%{transform:scale(1.6);opacity:0;}}' +
            '#cb-window{display:none;position:fixed;bottom:5.5rem;right:1.5rem;width:370px;max-width:calc(100vw - 2rem);height:520px;max-height:calc(100vh - 8rem);background:#fff;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.15);overflow:hidden;flex-direction:column;animation:cb-slideUp .3s ease;z-index:99999;}' +
            '#cb-window.active{display:flex;}' +
            '@keyframes cb-slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}' +
            '#cb-header{background:linear-gradient(135deg,#ff3838,#ff6b35);color:#fff;padding:1rem 1.2rem;display:flex;align-items:center;gap:0.7rem;}' +
            '#cb-header .avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.3rem;}' +
            '#cb-header .info{flex:1;}' +
            '#cb-header .bot-name{font-weight:800;font-size:1rem;}' +
            '#cb-header .bot-status{font-size:0.72rem;opacity:0.85;}' +
            '#cb-header .close-btn{background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;padding:0.3rem;opacity:0.8;}' +
            '#cb-header .close-btn:hover{opacity:1;}' +
            '#cb-messages{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.6rem;background:#f8f8f8;}' +
            '#cb-messages::-webkit-scrollbar{width:4px;}' +
            '#cb-messages::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px;}' +
            '.cb-msg{max-width:85%;padding:0.7rem 1rem;border-radius:14px;font-size:0.85rem;line-height:1.5;word-wrap:break-word;white-space:pre-line;}' +
            '.cb-msg.bot{background:#fff;color:#333;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 4px rgba(0,0,0,0.06);}' +
            '.cb-msg.user{background:linear-gradient(135deg,#ff3838,#ff6b35);color:#fff;border-bottom-right-radius:4px;align-self:flex-end;}' +
            '.cb-msg.bot strong,.cb-msg.bot b{color:#ff3838;}' +
            '.cb-typing{align-self:flex-start;background:#fff;padding:0.7rem 1rem;border-radius:14px;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}' +
            '.cb-typing span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#ccc;margin:0 2px;animation:cb-dot 1.4s infinite;}' +
            '.cb-typing span:nth-child(2){animation-delay:0.2s;}' +
            '.cb-typing span:nth-child(3){animation-delay:0.4s;}' +
            '@keyframes cb-dot{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}' +
            '#cb-input-area{padding:0.7rem;border-top:1px solid #f0f0f0;display:flex;gap:0.5rem;background:#fff;}' +
            '#cb-input{flex:1;padding:0.6rem 1rem;border:2px solid #eee;border-radius:25px;font-size:0.85rem;font-family:"Nunito",sans-serif;outline:none;color:#333;}' +
            '#cb-input:focus{border-color:#ff3838;}' +
            '#cb-input::placeholder{color:#bbb;}' +
            '#cb-send{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#ff3838,#ff6b35);color:#fff;border:none;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s;}' +
            '#cb-send:hover{transform:scale(1.1);}' +
            '.cb-items-grid{display:flex;flex-direction:column;gap:0.3rem;margin:0.4rem 0;}' +
            '.cb-item-card{display:flex;align-items:center;gap:0.5rem;padding:0.45rem 0.6rem;background:#f8f8f8;border:1.5px solid #eee;border-radius:8px;cursor:pointer;transition:all .15s;font-size:0.8rem;}' +
            '.cb-item-card:hover{border-color:#ff3838;background:#fff5f5;}' +
            '.cb-item-emoji{font-size:1.1rem;}' +
            '.cb-item-name{flex:1;font-weight:600;color:#333;}' +
            '.cb-item-price{color:#999;font-size:0.75rem;}' +
            '.cb-item-add{color:#ff3838;font-weight:700;font-size:0.72rem;}' +
            '.cb-quick-btns{display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.4rem;}' +
            '.cb-quick-btn{background:#fff;border:1.5px solid #eee;border-radius:20px;padding:0.3rem 0.7rem;font-size:0.72rem;cursor:pointer;font-family:"Nunito",sans-serif;color:#555;transition:all .15s;font-weight:600;}' +
            '.cb-quick-btn:hover{border-color:#ff3838;color:#ff3838;background:#fff5f5;}' +
            '.cb-ai-badge{font-size:0.6rem;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:0.15rem 0.5rem;border-radius:10px;font-weight:700;margin-left:0.3rem;letter-spacing:0.5px;}' +
            '@media(max-width:480px){#cb-window{width:calc(100vw - 1rem);right:0.5rem;bottom:5rem;height:calc(100vh - 7rem);border-radius:16px;}#cb-toggle{width:52px;height:52px;font-size:1.4rem;}#cb-toggle .pulse{width:52px;height:52px;}}';
        document.head.appendChild(css);
    }

    function injectHTML() {
        var aiLabel = (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') ? '<span class="cb-ai-badge">AI</span>' : '';
        var statusText = (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') ? '🟢 Powered by Gemini AI' : '🟢 Online — Food Assistant';
        var widget = document.createElement('div');
        widget.id = 'cb-widget';
        widget.innerHTML =
            '<div id="cb-window">' +
            '<div id="cb-header">' +
            '<div class="avatar">' + botAvatar + '</div>' +
            '<div class="info"><div class="bot-name">' + botName + ' ' + aiLabel + '</div><div class="bot-status">' + statusText + '</div></div>' +
            '<button class="close-btn" onclick="window._chatbotToggle()"><i class="fas fa-times"></i></button>' +
            '</div>' +
            '<div id="cb-messages"></div>' +
            '<div id="cb-input-area">' +
            '<input type="text" id="cb-input" placeholder="Kya khana hai batao... 😋" autocomplete="off">' +
            '<button id="cb-send" onclick="window._chatbotSend()"><i class="fas fa-paper-plane"></i></button>' +
            '</div>' +
            '</div>' +
            '<button id="cb-toggle" onclick="window._chatbotToggle()"><span class="pulse"></span>💬</button>';
        document.body.appendChild(widget);
    }

    // ──── Message Display ────
    function addBotMessage(text, showItems) {
        var messagesDiv = document.getElementById('cb-messages');
        var formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        var msgDiv = document.createElement('div');
        msgDiv.className = 'cb-msg bot';
        msgDiv.innerHTML = formatted;

        if (showItems !== false) {
            var mentioned = findMentionedItems(text);
            if (mentioned.length > 0) {
                var cardsHtml = '<div class="cb-items-grid">';
                for (var i = 0; i < Math.min(mentioned.length, 4); i++) {
                    cardsHtml += formatItemCard(mentioned[i]);
                }
                cardsHtml += '</div>';
                msgDiv.innerHTML += cardsHtml;
            }
        }

        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function addUserMessage(text) {
        var messagesDiv = document.getElementById('cb-messages');
        var msgDiv = document.createElement('div');
        msgDiv.className = 'cb-msg user';
        msgDiv.textContent = text;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function showTyping() {
        var messagesDiv = document.getElementById('cb-messages');
        var typingDiv = document.createElement('div');
        typingDiv.className = 'cb-typing';
        typingDiv.id = 'cb-typing';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function hideTyping() {
        var el = document.getElementById('cb-typing');
        if (el) el.remove();
    }

    function addQuickButtons() {
        var messagesDiv = document.getElementById('cb-messages');
        var old = document.getElementById('cb-quick-btns');
        if (old) old.remove();
        var btnsDiv = document.createElement('div');
        btnsDiv.className = 'cb-quick-btns';
        btnsDiv.id = 'cb-quick-btns';
        var buttons = [
            { label: '🍽️ Menu', msg: 'pura menu dikhao' },
            { label: '⭐ Suggest karo', msg: 'kuch suggest karo' },
            { label: '🌶️ Spicy', msg: 'kuch spicy do' },
            { label: '🍰 Meetha', msg: 'meetha chahiye' },
            { label: '💰 Sasta', msg: 'sasta wala do' },
            { label: '🛒 Cart', msg: 'mera cart dikhao' }
        ];
        for (var i = 0; i < buttons.length; i++) {
            var btn = document.createElement('button');
            btn.className = 'cb-quick-btn';
            btn.textContent = buttons[i].label;
            btn.setAttribute('data-msg', buttons[i].msg);
            btn.onclick = function() { handleUserInput(this.getAttribute('data-msg')); };
            btnsDiv.appendChild(btn);
        }
        messagesDiv.appendChild(btnsDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // ──── Input Handling ────
    function handleUserInput(text) {
        if (!text.trim()) return;
        var old = document.getElementById('cb-quick-btns');
        if (old) old.remove();
        addUserMessage(text);
        showTyping();

        getResponse(text, function(response) {
            hideTyping();
            addBotMessage(response);
            addQuickButtons();
        });
    }

    // ──── Public API ────
    window._chatbotToggle = function() {
        var win = document.getElementById('cb-window');
        var toggle = document.getElementById('cb-toggle');
        isOpen = !isOpen;
        if (isOpen) {
            win.classList.add('active');
            toggle.classList.add('open');
            toggle.innerHTML = '✕';
            if (!hasGreeted) {
                hasGreeted = true;
                setTimeout(function() {
                    addBotMessage('Hey bhai! 👋 Main hoon **FoodieBot** — tera apna food assistant!\n\nBata kya khana hai aaj? Ya neeche se koi option choose kar! 😋', false);
                    addQuickButtons();
                }, 300);
            }
            setTimeout(function() { document.getElementById('cb-input').focus(); }, 400);
        } else {
            win.classList.remove('active');
            toggle.classList.remove('open');
            toggle.innerHTML = '<span class="pulse"></span>💬';
        }
    };

    window._chatbotSend = function() {
        var input = document.getElementById('cb-input');
        var text = input.value.trim();
        if (!text) return;
        input.value = '';
        handleUserInput(text);
    };

    window._chatbotAddItem = function(name, price) {
        addToCartFromChat(name, price);
        var emoji = '🍴';
        for (var i = 0; i < menuItems.length; i++) { if (menuItems[i].name === name) emoji = menuItems[i].emoji; }
        addBotMessage(emoji + ' **' + name + '** cart mein add ho gaya! ✅ Aur kuch chahiye? 😊', false);
        addQuickButtons();
    };

    // ──── Init ────
    function init() {
        injectStyles();
        injectHTML();
        document.getElementById('cb-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') window._chatbotSend();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
