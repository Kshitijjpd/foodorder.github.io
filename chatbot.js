(function() {
    var menuItems = [
        { name: 'Samosa', price: 10, emoji: '🥟', category: 'snack', tags: ['spicy','crispy','vegetarian','indian'] },
        { name: 'Papri Chaat', price: 20, emoji: '🍽️', category: 'snack', tags: ['tangy','spicy','vegetarian','chaat'] },
        { name: 'Chaat', price: 30, emoji: '🍛', category: 'snack', tags: ['tangy','spicy','vegetarian','chaat'] },
        { name: 'Maggi', price: 40, emoji: '🍜', category: 'snack', tags: ['noodles','quick','comfort'] },
        { name: 'Cake', price: 60, emoji: '🎂', category: 'dessert', tags: ['sweet','dessert','bakery'] },
        { name: 'Ice Cream', price: 70, emoji: '🍦', category: 'dessert', tags: ['sweet','cold','dessert','refreshing'] },
        { name: 'Tasty Burger', price: 25, emoji: '🍔', category: 'main', tags: ['burger','filling','fast-food'] },
        { name: 'Tasty Cakes', price: 15, emoji: '🧁', category: 'dessert', tags: ['sweet','dessert','bakery','cupcake'] },
        { name: 'Tasty Sweets', price: 10, emoji: '🍬', category: 'dessert', tags: ['sweet','indian','mithai'] },
        { name: 'Tasty Cupcakes', price: 15, emoji: '🧁', category: 'dessert', tags: ['sweet','dessert','bakery'] },
        { name: 'Cold Drinks', price: 10, emoji: '🥤', category: 'beverage', tags: ['cold','drink','refreshing'] },
        { name: 'Cold Ice-Cream', price: 10, emoji: '🍦', category: 'dessert', tags: ['sweet','cold','dessert','refreshing'] }
    ];

    var pairings = {
        'Tasty Burger': ['Cold Drinks', 'Ice Cream', 'Cold Ice-Cream'],
        'Samosa': ['Chaat', 'Papri Chaat', 'Cold Drinks'],
        'Papri Chaat': ['Samosa', 'Chaat', 'Cold Drinks'],
        'Chaat': ['Samosa', 'Papri Chaat', 'Cold Drinks'],
        'Maggi': ['Cold Drinks', 'Tasty Burger', 'Samosa'],
        'Cake': ['Ice Cream', 'Cold Drinks', 'Tasty Cakes'],
        'Ice Cream': ['Cake', 'Cold Drinks', 'Tasty Cakes'],
        'Tasty Cakes': ['Ice Cream', 'Cold Drinks', 'Cake'],
        'Tasty Sweets': ['Cold Drinks', 'Chaat', 'Ice Cream'],
        'Tasty Cupcakes': ['Ice Cream', 'Cold Drinks', 'Cake'],
        'Cold Drinks': ['Samosa', 'Tasty Burger', 'Maggi'],
        'Cold Ice-Cream': ['Cake', 'Tasty Cakes', 'Cold Drinks']
    };

    var botName = 'FoodieBot';
    var botAvatar = '🤖';
    var isOpen = false;
    var conversationHistory = [];

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

    function findItem(name) {
        var lower = name.toLowerCase();
        for (var i = 0; i < menuItems.length; i++) {
            if (menuItems[i].name.toLowerCase() === lower || menuItems[i].name.toLowerCase().indexOf(lower) !== -1) {
                return menuItems[i];
            }
        }
        return null;
    }

    function getItemsByTag(tag) {
        var results = [];
        for (var i = 0; i < menuItems.length; i++) {
            for (var j = 0; j < menuItems[i].tags.length; j++) {
                if (menuItems[i].tags[j] === tag) { results.push(menuItems[i]); break; }
            }
        }
        return results;
    }

    function getItemsByCategory(cat) {
        var results = [];
        for (var i = 0; i < menuItems.length; i++) {
            if (menuItems[i].category === cat) results.push(menuItems[i]);
        }
        return results;
    }

    function formatItemCard(item) {
        return '<div class="cb-item-card" onclick="window._chatbotAddItem(\'' + item.name + '\',' + item.price + ')">' +
            '<span class="cb-item-emoji">' + item.emoji + '</span>' +
            '<span class="cb-item-name">' + item.name + '</span>' +
            '<span class="cb-item-price">₹' + item.price + '</span>' +
            '<span class="cb-item-add">+ Add</span>' +
            '</div>';
    }

    function formatItemList(items) {
        var html = '';
        for (var i = 0; i < items.length; i++) html += formatItemCard(items[i]);
        return '<div class="cb-items-grid">' + html + '</div>';
    }

    function detectIntent(msg) {
        var m = msg.toLowerCase().trim();

        if (/^(hi|hello|hey|hii+|helo|namaste|yo|sup|kya hal|kaise ho)/.test(m)) return 'greeting';
        if (/\b(bye|tata|alvida|thanks|thanku|thank you|dhanyawad|shukriya)\b/.test(m)) return 'bye';
        if (/\b(help|madad|how|kaise|kya kar|guide)\b/.test(m)) return 'help';

        if (/\b(menu|items|kya hai|kya milega|what do you have|list|sab dikhao|show all)\b/.test(m)) return 'menu';
        if (/\b(price|cost|kitna|rate|kimat|kya price|amount|paisa)\b/.test(m)) return 'price';

        if (/\b(spicy|teekha|tikha|masala|hot|mirch|chatpata)\b/.test(m)) return 'spicy';
        if (/\b(sweet|meetha|mithai|dessert|mitha|chocolate)\b/.test(m)) return 'sweet';
        if (/\b(cold|thanda|drink|beverage|pani|juice|refreshing)\b/.test(m)) return 'cold';
        if (/\b(snack|nasta|nashta|halka|light)\b/.test(m)) return 'snack';
        if (/\b(filling|bharwa|bhook|hunger|heavy|pet bhar|bahut bhook)\b/.test(m)) return 'filling';

        if (/\b(recommend|suggest|best|popular|konsa|kya lu|kya order|try|accha|sahi|top|trending)\b/.test(m)) return 'recommend';
        if (/\b(cheap|sasta|budget|kam price|low price|under)\b/.test(m)) return 'budget';
        if (/\b(combo|pair|sath|together|along|complement)\b/.test(m)) return 'combo';

        if (/\b(cart|add|order|daal|daalo|add kar|lga do|laga)\b/.test(m)) return 'cart_action';
        if (/\b(my cart|mera cart|kya hai cart|cart me kya|cart mein)\b/.test(m)) return 'cart_view';
        if (/\b(checkout|pay|payment|bill)\b/.test(m)) return 'checkout';

        if (/\b(offer|discount|coupon|deal|free|cashback|chhut)\b/.test(m)) return 'offer';

        if (/\b(burger)\b/.test(m)) return 'item_burger';
        if (/\b(samosa)\b/.test(m)) return 'item_samosa';
        if (/\b(maggi|noodle)\b/.test(m)) return 'item_maggi';
        if (/\b(cake)\b/.test(m)) return 'item_cake';
        if (/\b(ice.?cream)\b/.test(m)) return 'item_icecream';
        if (/\b(chaat|chat)\b/.test(m)) return 'item_chaat';
        if (/\b(cupcake)\b/.test(m)) return 'item_cupcake';
        if (/\b(sweets)\b/.test(m)) return 'item_sweets';
        if (/\b(cold drink|soft drink|coke|pepsi)\b/.test(m)) return 'item_colddrink';

        return 'unknown';
    }

    function generateResponse(msg) {
        var intent = detectIntent(msg);
        var cart = getCart();

        switch(intent) {
            case 'greeting':
                var greetings = [
                    'Hey! 👋 Main hoon ' + botName + ', aapka food assistant! Kya order karna hai? 🍔🍦',
                    'Hello! 😊 Welcome! Batao kya khana hai aaj? Main help karta hoon!',
                    'Hi there! 🎉 Hungry? Mujhe batao kya chahiye — spicy, sweet, ya kuch thanda? 🤤',
                    'Namaste! 🙏 Kya chahiye aaj — burger, chaat, ya meetha? Batao!'
                ];
                return greetings[Math.floor(Math.random() * greetings.length)];

            case 'bye':
                return 'Thank you! 😊🙏 Enjoy your meal! Jab bhi zarurat ho, main yahan hoon. Bye bye! 👋';

            case 'help':
                return '🤖 Main aapki help kar sakta hoon:\n\n' +
                    '🍽️ **"menu"** — sab items dekho\n' +
                    '🌶️ **"spicy"** — teekha items\n' +
                    '🍰 **"sweet"** — meetha items\n' +
                    '🥤 **"cold"** — thande items\n' +
                    '⭐ **"recommend"** — best suggestions\n' +
                    '💰 **"budget"** — saste items\n' +
                    '🛒 **"my cart"** — cart dekho\n' +
                    '🏷️ **"offers"** — current deals\n\n' +
                    'Ya bas batao kya khana hai! 😋';

            case 'menu':
                return '🍽️ Yeh hai hamara full menu:\n\n' + formatItemList(menuItems) + '\nKisi item pe click karo add karne ke liye! 😋';

            case 'price':
                var priceText = '💰 **Prices:**\n\n';
                for (var i = 0; i < menuItems.length; i++) {
                    priceText += menuItems[i].emoji + ' ' + menuItems[i].name + ' — **₹' + menuItems[i].price + '**\n';
                }
                return priceText;

            case 'spicy':
                var spicyItems = getItemsByTag('spicy');
                return '🌶️ Teekha chahiye? Ye lo spicy items:\n\n' + formatItemList(spicyItems) + '\nClick karo add karne ke liye! 🔥';

            case 'sweet':
                var sweetItems = getItemsByCategory('dessert');
                return '🍰 Meetha time! Ye hain sweet options:\n\n' + formatItemList(sweetItems) + '\nKaunsa try karoge? 😋';

            case 'cold':
                var coldItems = getItemsByTag('cold').concat(getItemsByTag('refreshing'));
                var seen = {};
                var unique = [];
                for (var c = 0; c < coldItems.length; c++) {
                    if (!seen[coldItems[c].name]) { seen[coldItems[c].name] = true; unique.push(coldItems[c]); }
                }
                return '🥤 Thanda thanda cool cool! Ye lo:\n\n' + formatItemList(unique) + '\nGarmi mein perfect hai! ❄️';

            case 'snack':
                var snackItems = getItemsByCategory('snack');
                return '🍿 Halka fulka snack chahiye? Ye dekho:\n\n' + formatItemList(snackItems) + '\nSnack time! 😊';

            case 'filling':
                var fillingItems = [findItem('Tasty Burger'), findItem('Maggi'), findItem('Cake')].filter(function(x) { return x; });
                return '🍔 Bhookh lagi hai? Ye bharwa items try karo:\n\n' + formatItemList(fillingItems) +
                    '\n💡 **Tip:** Burger + Cold Drinks = Perfect combo! 🤤';

            case 'recommend':
                if (cart.length > 0) {
                    var recs = getSmartRecommendations(cart);
                    if (recs.length > 0) {
                        return '⭐ Cart mein already ' + cart.length + ' item hai. Ye bhi try karo:\n\n' + formatItemList(recs) +
                            '\nYe sab aapke cart items ke saath perfect pair hain! 👌';
                    }
                }
                var topPicks = [findItem('Tasty Burger'), findItem('Samosa'), findItem('Ice Cream'), findItem('Cold Drinks')].filter(function(x) { return x; });
                return '⭐ Aaj ke top recommendations:\n\n' + formatItemList(topPicks) +
                    '\n🔥 **Bestseller:** Tasty Burger + Cold Drinks combo! 🍔🥤';

            case 'budget':
                var budgetItems = menuItems.filter(function(item) { return item.price <= 15; });
                return '💰 Budget-friendly items (₹15 tak):\n\n' + formatItemList(budgetItems) +
                    '\nSaste aur achhe! Kya chahiye? 😊';

            case 'combo':
                if (cart.length > 0) {
                    var comboRecs = getSmartRecommendations(cart);
                    if (comboRecs.length > 0) {
                        return '🎯 Aapke cart ke items ke saath ye perfect combo banega:\n\n' + formatItemList(comboRecs);
                    }
                }
                var comboSuggestions = '🍔 **Popular Combos:**\n\n' +
                    '1️⃣ Burger + Cold Drinks = ₹35\n' +
                    '2️⃣ Samosa + Chaat + Cold Drinks = ₹50\n' +
                    '3️⃣ Cake + Ice Cream = ₹130\n' +
                    '4️⃣ Maggi + Cold Drinks = ₹50\n\n' +
                    'Kaunsa combo chahiye? 😋';
                return comboSuggestions;

            case 'cart_view':
                if (cart.length === 0) return '🛒 Cart khali hai! Kuch add karo na. **"menu"** type karo sab items dekhne ke liye! 😊';
                var cartTotal = 0;
                var cartText = '🛒 **Aapka Cart:**\n\n';
                for (var cv = 0; cv < cart.length; cv++) {
                    var sub = cart[cv].price * cart[cv].qty;
                    cartTotal += sub;
                    var em = '🍴';
                    for (var mi = 0; mi < menuItems.length; mi++) { if (menuItems[mi].name === cart[cv].name) em = menuItems[mi].emoji; }
                    cartText += em + ' ' + cart[cv].name + ' x' + cart[cv].qty + ' = ₹' + sub + '\n';
                }
                cartText += '\n**Total: ₹' + cartTotal + '**';
                var cartRecs = getSmartRecommendations(cart);
                if (cartRecs.length > 0) {
                    cartText += '\n\n💡 Ye bhi add karo:\n' + formatItemList(cartRecs.slice(0, 2));
                }
                return cartText;

            case 'cart_action':
                return '🛒 Kaunsa item add karna hai? Neeche se choose karo:\n\n' + formatItemList(menuItems.slice(0, 6)) +
                    '\nYa item ka naam type karo, main add kar dunga! 😊';

            case 'checkout':
                if (cart.length === 0) return '🛒 Pehle kuch cart mein add karo! **"menu"** type karo items dekhne ke liye.';
                return '✅ Checkout ke liye right side mein payment form fill karo aur **"Pay"** button dabao! 💳\n\nAgar viewcart page pe nahi ho to yahan jao: [View Cart](viewcart.html)';

            case 'offer':
                return '🏷️ Active offers dekhne ke liye **viewcart page** pe jao! Wahan cart ke neeche "Available Offers" section mein sab active offers dikhenge.\n\n' +
                    '💡 Offer apply karne ke liye "Apply" button dabao. Discount total mein automatically adjust ho jayega! 🎉';

            case 'item_burger':
                var burger = findItem('Tasty Burger');
                return '🍔 **Tasty Burger** — sirf ₹' + burger.price + '!\n\nJuicy aur filling! Students ke beech sabse popular item.\n\n' +
                    formatItemCard(burger) + '\n💡 Cold Drinks ke saath try karo — perfect combo! 🥤';

            case 'item_samosa':
                var samosa = findItem('Samosa');
                return '🥟 **Samosa** — sirf ₹' + samosa.price + '!\n\nCrispy aur spicy! Classic Indian snack.\n\n' +
                    formatItemCard(samosa) + '\n💡 Chaat ke saath try karo! 🍛';

            case 'item_maggi':
                var maggi = findItem('Maggi');
                return '🍜 **Maggi** — sirf ₹' + maggi.price + '!\n\n2-minute comfort food! Hostel wali yaadein! 😄\n\n' +
                    formatItemCard(maggi);

            case 'item_cake':
                var cake = findItem('Cake');
                return '🎂 **Cake** — ₹' + cake.price + '\n\nFresh baked! Celebrations ya cravings ke liye perfect.\n\n' +
                    formatItemCard(cake) + '\n💡 Ice Cream ke saath — deadly combo! 🍦';

            case 'item_icecream':
                var ic = findItem('Ice Cream');
                var cic = findItem('Cold Ice-Cream');
                return '🍦 **Ice Cream Options:**\n\n' + formatItemCard(ic) + formatItemCard(cic) + '\nGarmi mein sabse best! ❄️';

            case 'item_chaat':
                var chaat = findItem('Chaat');
                var papri = findItem('Papri Chaat');
                return '🍛 **Chaat Options:**\n\n' + formatItemCard(chaat) + formatItemCard(papri) + '\nTangy + Spicy = 🤤';

            case 'item_cupcake':
                var cc = findItem('Tasty Cupcakes');
                return '🧁 **Tasty Cupcakes** — ₹' + cc.price + '\n\nCute aur tasty! Perfect sweet snack.\n\n' + formatItemCard(cc);

            case 'item_sweets':
                var sw = findItem('Tasty Sweets');
                return '🍬 **Tasty Sweets** — sirf ₹' + sw.price + '!\n\nDesi meetha! Festival special.\n\n' + formatItemCard(sw);

            case 'item_colddrink':
                var cd = findItem('Cold Drinks');
                return '🥤 **Cold Drinks** — sirf ₹' + cd.price + '!\n\nRefreshing! Har cheez ke saath jaata hai.\n\n' + formatItemCard(cd);

            default:
                var itemMatch = findItem(msg.trim());
                if (itemMatch) {
                    return itemMatch.emoji + ' **' + itemMatch.name + '** — ₹' + itemMatch.price + '\n\n' +
                        formatItemCard(itemMatch) + '\nClick karo add karne ke liye! 😊';
                }

                var defaults = [
                    '🤔 Samajh nahi aaya! Try karo: **"menu"**, **"recommend"**, **"spicy"**, **"sweet"**, ya koi item ka naam type karo!',
                    '😅 Ye toh mujhe nahi pata! Lekin food ke baare mein kuch bhi pucho — **"help"** type karo options dekhne ke liye!',
                    '🤖 Main food assistant hoon! Batao kya khana hai — **"menu"** se items dekho ya **"recommend"** se suggestions lo!'
                ];
                return defaults[Math.floor(Math.random() * defaults.length)];
        }
    }

    function getSmartRecommendations(cart) {
        var cartNames = {};
        for (var i = 0; i < cart.length; i++) cartNames[cart[i].name] = true;

        var recSet = {};
        for (var j = 0; j < cart.length; j++) {
            var pairs = pairings[cart[j].name];
            if (pairs) {
                for (var k = 0; k < pairs.length; k++) {
                    if (!cartNames[pairs[k]]) recSet[pairs[k]] = (recSet[pairs[k]] || 0) + 1;
                }
            }
        }

        var recArray = [];
        for (var name in recSet) {
            var item = findItem(name);
            if (item) recArray.push({ item: item, score: recSet[name] });
        }
        recArray.sort(function(a, b) { return b.score - a.score; });

        var results = [];
        for (var r = 0; r < Math.min(recArray.length, 4); r++) results.push(recArray[r].item);
        return results;
    }

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
            '@media(max-width:480px){#cb-window{width:calc(100vw - 1rem);right:0.5rem;bottom:5rem;height:calc(100vh - 7rem);border-radius:16px;}#cb-toggle{width:52px;height:52px;font-size:1.4rem;}#cb-toggle .pulse{width:52px;height:52px;}}';
        document.head.appendChild(css);
    }

    function injectHTML() {
        var widget = document.createElement('div');
        widget.id = 'cb-widget';
        widget.innerHTML =
            '<div id="cb-window">' +
            '<div id="cb-header">' +
            '<div class="avatar">' + botAvatar + '</div>' +
            '<div class="info"><div class="bot-name">' + botName + '</div><div class="bot-status">🟢 Online — Food Assistant</div></div>' +
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

    function addBotMessage(text) {
        var messagesDiv = document.getElementById('cb-messages');
        var formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        var msgDiv = document.createElement('div');
        msgDiv.className = 'cb-msg bot';
        msgDiv.innerHTML = formatted;
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
        var btnsDiv = document.createElement('div');
        btnsDiv.className = 'cb-quick-btns';
        btnsDiv.id = 'cb-quick-btns';
        var buttons = [
            { label: '📋 Menu', msg: 'menu' },
            { label: '⭐ Recommend', msg: 'recommend' },
            { label: '🌶️ Spicy', msg: 'spicy food' },
            { label: '🍰 Sweet', msg: 'sweet items' },
            { label: '💰 Budget', msg: 'budget items' },
            { label: '🛒 My Cart', msg: 'my cart' }
        ];
        for (var i = 0; i < buttons.length; i++) {
            var btn = document.createElement('button');
            btn.className = 'cb-quick-btn';
            btn.textContent = buttons[i].label;
            btn.setAttribute('data-msg', buttons[i].msg);
            btn.onclick = function() {
                var m = this.getAttribute('data-msg');
                handleUserInput(m);
            };
            btnsDiv.appendChild(btn);
        }
        messagesDiv.appendChild(btnsDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function handleUserInput(text) {
        if (!text.trim()) return;
        var oldBtns = document.getElementById('cb-quick-btns');
        if (oldBtns) oldBtns.remove();
        addUserMessage(text);
        showTyping();
        var delay = 400 + Math.random() * 800;
        setTimeout(function() {
            hideTyping();
            var response = generateResponse(text);
            addBotMessage(response);
            addQuickButtons();
        }, delay);
    }

    window._chatbotToggle = function() {
        var win = document.getElementById('cb-window');
        var toggle = document.getElementById('cb-toggle');
        isOpen = !isOpen;
        if (isOpen) {
            win.classList.add('active');
            toggle.classList.add('open');
            toggle.innerHTML = '✕';
            var pulseEl = toggle.querySelector('.pulse');
            if (pulseEl) pulseEl.style.display = 'none';
            if (conversationHistory.length === 0) {
                setTimeout(function() {
                    addBotMessage('Hey! 👋 Main hoon **' + botName + '**, aapka personal food assistant!\n\nBatao kya chahiye — ya neeche se koi option choose karo: 😋');
                    addQuickButtons();
                    conversationHistory.push(1);
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
        var item = findItem(name);
        var emoji = item ? item.emoji : '🍴';
        addBotMessage(emoji + ' **' + name + '** cart mein add ho gaya! ✅\n\n🛒 Aur kuch chahiye ya checkout karna hai?');
        addQuickButtons();
    };

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
