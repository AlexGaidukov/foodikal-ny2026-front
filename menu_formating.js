// API Integration Class
class FoodikalAPI {
    constructor() {
        this.baseURL = 'https://foodikal-ny-cors-wrapper.x-gs-x.workers.dev';
    }

    async getMenu() {
        try {
            const response = await fetch(`${this.baseURL}/api/menu`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                return result.data;
            } else {
                throw new Error(result.error || 'Invalid menu data');
            }
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
            const response = await fetch(`${this.baseURL}/api/create_order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                return {
                    orderId: result.order_id,
                    totalPrice: result.total_price,
                    message: result.message
                };
            } else {
                // Create a structured error with details
                const error = new Error(result.error || 'Failed to create order');
                error.details = result.details || null;
                error.statusCode = response.status;
                throw error;
            }
        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    }

    async validatePromoCode(promoCode, orderItems) {
        try {
            const response = await fetch(`${this.baseURL}/api/validate_promo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    promo_code: promoCode,
                    order_items: orderItems
                })
            });

            const result = await response.json();

            if (result.success) {
                return {
                    valid: result.valid,
                    subtotal: result.subtotal,
                    discountAmount: result.discount_amount,
                    finalTotal: result.final_total,
                    error: result.error || null
                };
            } else {
                return {
                    valid: false,
                    error: result.error || 'Failed to validate promo code'
                };
            }
        } catch (error) {
            console.error('Failed to validate promo code:', error);
            return {
                valid: false,
                error: 'Network error: Could not validate promo code'
            };
        }
    }
}

// Initialize API
const api = new FoodikalAPI();

// Static fallback data - update manually when menu changes
// Last updated: 2025-12-04
const FALLBACK_DATA = {
    menu: {"Брускетты":[{"id":9,"name":"Брускетта с вяленой свининой (шт)","category":"Брускетты","description":"Багет, Вяленая свинина, Огурец соленый, Томат, Майонез, Горчица столовая, Оливки зеленые без косточек","price":300,"image":""},{"id":10,"name":"Брускетта с гравлаксом (шт)","category":"Брускетты","description":"Багет, Гравлакс (филе лосося, лимон, апельсин, соль, сахар, свекла), Творожный сыр (соленый), Лимон","price":220,"image":""},{"id":11,"name":"Брускетта с грибной икрой (шт)","category":"Брускетты","description":"Багет, Грибная икра (Шампиньоны свежие, Лук репчатый, Морковь, Соль поваренная пищевая, Перец черный молотый, Томат), Петрушка свежая","price":120,"image":""},{"id":12,"name":"Брускетта с грушей и горгонзоллой (шт)","category":"Брускетты","description":"Багет, Груша вильямовка, Сыр горгонзолла, Орех грецкий, Масло сливочное 82%, Мед цветочный","price":350,"image":""},{"id":13,"name":"Брускетта с гуакамоле (шт)","category":"Брускетты","description":"Багет, Авокадо, Соль поваренная пищевая, Перец черный молотый, Лимонный сок, Перец красный сладкий","price":200,"image":""},{"id":14,"name":"Брускетта с паштетом из куриной печени (шт)","category":"Брускетты","description":"Багет, Паштет из куриной печени (Куриная печень и сердце, Масло растительное подсолнечное, Лук репчатый, Соль поваренная пищевая, Перец черный молотый), Петрушка свежая","price":90,"image":""},{"id":15,"name":"Брускетта с пршутом и персиком (шт)","category":"Брускетты","description":"Багет, Пршут свиной, Творожный сыр (соленый), Укроп сушеный, Персик","price":270,"image":""},{"id":16,"name":"Брускетта с рикоттой (шт)","category":"Брускетты","description":"Багет, Рикотта соленая, Перец красный сладкий, Петрушка свежая","price":90,"image":""},{"id":17,"name":"Брускетта с творожным сыром и сладким перцем (шт)","category":"Брускетты","description":"Багет, Творожный сыр (соленый), Перец красный сладкий","price":120,"image":""},{"id":18,"name":"Брускетта с хумусом и свежими овощами (шт)","category":"Брускетты","description":"Багет, Хумус нейтральный, Томат, Огурец, Лимонный сок, Петрушка свежая","price":100,"image":""},{"id":19,"name":"Брускетта с шампиньонами (шт)","category":"Брускетты","description":"Багет, Шампиньоны свежие, Томат черри, Петрушка свежая, Чеснок свежий","price":140,"image":""}],"Горячее":[{"id":20,"name":"Баранья нога","category":"Горячее","description":"Баранина, Кориандр целый, Перец душистый горошек, Кумин цельный, Соль поваренная пищевая, Масло растительное подсолнечное","price":15500,"image":""},{"id":21,"name":"Куриный шашлычок с картофелем фри","category":"Горячее","description":"Курица, Соевый соус светлый, Кабачок, Лук репчатый, Перец красный сладкий, Перец черный молотый, Соль поваренная пищевая, Тимьян сушеный, Картофель фри, Масло растительное подсолнечное","price":550,"image":""},{"id":22,"name":"Овощи гриль","category":"Горячее","description":"Баклажан, Кабачок, Перец красный сладкий, Шампиньоны свежие, Соль поваренная пищевая, Перец черный молотый, Чеснок свежий, Масло растительное подсолнечное, Паприка сладкая молотая","price":650,"image":""},{"id":24,"name":"Свиная рулька","category":"Горячее","description":"Свинина (рулька), Морковь, Сельдерей корень, Чеснок свежий, Лук репчатый, Лавровый лист, Гвоздика целая, Перец душистый горошек, Тмин, Соль поваренная пищевая, Горчица Дижонская, Масло растительное подсолнечное","price":3100,"image":""},{"id":25,"name":"Свиной шашлычок","category":"Горячее","description":"Свинина, Розмарин сушеный, Перец черный молотый, Соль поваренная пищевая, Масло растительное подсолнечное, Соевый соус светлый, Кабачок","price":310,"image":""},{"id":26,"name":"Тушеная капуста","category":"Горячее","description":"Капуста белокочанная, Лавровый лист, Кориандр целый, Паприка сладкая молотая, Лук репчатый, Соль поваренная пищевая, Вегета, Чеснок свежий, Масло растительное подсолнечное, Сахар-песок, Томат, Огурец","price":870,"image":""}],"Закуски":[{"id":27,"name":"Ассорти сыров и мясных деликатесов","category":"Закуски","description":"Пармезан, Сыр горгонзолла, Сыр Гауда, Сыр Моцарелла, Вяленая свинина, Хамон, Кулен/салями, Каперсы, Маслины без косточки, Вяленый томат","price":2000,"image":""},{"id":23,"name":"Рулетики из ветчины с сыром (2 шт)","category":"Закуски","description":"Ветчина из индейки, Сыр Гауда, Майонез, Паприка сладкая молотая, Чеснок свежий","price":450,"image":""},{"id":28,"name":"Хумус с баклажаном","category":"Закуски","description":"Баклажан, Хумус с запеченным перцем (Перец красный сладкий, Чеснок свежий, Нут консервированный, Тахини (паста), Масло растительное оливковое, Лимонный сок, Соль поваренная пищевая), Огурец, Перец красный сладкий","price":120,"image":""}],"Канапе":[{"id":29,"name":"Канапе овощное","category":"Канапе","description":"Томат черри, Огурец, Перец красный сладкий, Баклажан","price":75,"image":""},{"id":30,"name":"Канапе с ветчиной","category":"Канапе","description":"Ветчина из индейки, Бородинский хлеб, Огурец соленый, Томат черри","price":90,"image":""},{"id":31,"name":"Канапе с грушей и пршутом","category":"Канапе","description":"Груша вильямовка, Пршут","price":140,"image":""},{"id":32,"name":"Канапе с креветкой и авокадо","category":"Канапе","description":"Авокадо, Креветка тигровая","price":240,"image":""},{"id":33,"name":"Канапе с салями и вяленым томатом","category":"Канапе","description":"Кулен, Бородинский хлеб, Томат черри, Салат зелёный листовой, Вяленый томат","price":180,"image":""},{"id":34,"name":"Канапе с салями и черным хлебом","category":"Канапе","description":"Салями, Бородинский хлеб, Огурец","price":90,"image":""},{"id":35,"name":"Канапе с сыром и виноградом","category":"Канапе","description":"Сыр Чеддер, Виноград белый, Сыр Гауда","price":130,"image":""},{"id":36,"name":"Канапе фруктовое","category":"Канапе","description":"Груша вильямовка, Виноград белый, Киви, Бананы","price":115,"image":""}],"Салаты":[{"id":37,"name":"Винегрет (120 г)","category":"Салаты","description":"Картофель, Свекла, Морковь, Огурец соленый, Горошек зелёный консервированный., Лук репчатый, Масло растительное подсолнечное","price":175,"image":""},{"id":38,"name":"Крабовый салат (1 кг)","category":"Салаты","description":"Крабовые палочки (сурими), Яйцо куриное, Кукуруза консервированная, Рис пропаренный, Майонез","price":1800,"image":""},{"id":40,"name":"Крабовый салат (120 г)","category":"Салаты","description":"Крабовые палочки (сурими), Яйцо куриное, Кукуруза консервированная, Рис пропаренный, Майонез","price":450,"image":""},{"id":41,"name":"Оливье с говядиной (1 кг)","category":"Салаты","description":"Картофель, Огурец соленый, Морковь, Горошек зелёный консервированный., Говядина, Яйцо куриное, Майонез","price":2200,"image":"images/photos/olivie.jpg"},{"id":42,"name":"Оливье с говядиной (120 г)","category":"Салаты","description":"Картофель, Огурец соленый, Морковь, Горошек зелёный консервированный., Говядина, Яйцо куриное, Майонез","price":250,"image":"images/photos/olivie.jpg"},{"id":39,"name":"Селёдка под Шубой (1 кг)","category":"Салаты","description":"Свекла, Морковь, Картофель, Майонез, Сельдь","price":2100,"image":"images/photos/furherring.jpg"}],"Тарталетки":[{"id":43,"name":"Тарталетка с икрой (шт)","category":"Тарталетки","description":"Тарталетки-профитроли (молоко, вода, маргарин, мука, соль, сахар, яйцо куриное), Творожный сыр (соленый), Икра имитированная красная, Икра имитированная черная, Огурец","price":150,"image":""},{"id":44,"name":"Тарталетка с крабовым салатом (шт)","category":"Тарталетки","description":"Тарталетки-профитроли (молоко, вода, маргарин, мука, соль, сахар, яйцо куриное), Крабовый салат (Крабовые палочки (сурими), Кукуруза консервированная, Огурец, Рис пропаренный, Яйцо куриное, Майонез), Кукуруза консервированная, Икра имитированная красная, Икра имитированная черная","price":150,"image":""},{"id":45,"name":"Тарталетка с креветкой (шт)","category":"Тарталетки","description":"Тарталетки-профитроли (молоко, вода, маргарин, мука, соль, сахар, яйцо куриное), Творожный сыр (соленый), Креветка тигровая","price":180,"image":""},{"id":46,"name":"Тарталетка со свекольным муссом и сельдью (шт)","category":"Тарталетки","description":"Тарталетки-профитроли (молоко, вода, маргарин, мука, соль, сахар, яйцо куриное), Свекла, Майонез, Сельдь в масле","price":170,"image":""},{"id":47,"name":"Тарталетка со слабосоленым лососем (шт)","category":"Тарталетки","description":"Тарталетки-профитроли (молоко, вода, маргарин, мука, соль, сахар, яйцо куриное), Лосось слабосоленый (1кг) (филе лосося, лимон, апельсин, соль, сахар), Творожный сыр (соленый), Огурец","price":160,"image":""}]},
    banners: [{"id":2,"name":"Тарталетки-профитроли","item_link":"https://ny2026.foodikal.rs/#Тарталетки","image_url":"https://ny2026.foodikal.rs/images/photos/Foodikal-1.jpg","display_order":1},{"id":3,"name":"Брускетты","item_link":"https://ny2026.foodikal.rs/#Брускетты","image_url":"https://ny2026.foodikal.rs/images/photos/Foodikal-4.jpg","display_order":2},{"id":1,"name":"Селёдка под шубой","item_link":"https://ny2026.foodikal.rs/#39","image_url":"https://ny2026.foodikal.rs/images/photos/Foodikal-7.jpg","display_order":3},{"id":4,"name":"Оливье с говядиной","item_link":"https://ny2026.foodikal.rs/#42","image_url":"https://ny2026.foodikal.rs/images/photos/Foodikal-9.jpg","display_order":4},{"id":5,"name":"Винегрет","item_link":"https://ny2026.foodikal.rs/#37","image_url":"https://ny2026.foodikal.rs/images/photos/Foodikal-120.jpg","display_order":5},{"id":6,"name":"Крабовый салат","item_link":"https://ny2026.foodikal.rs/#40","image_url":"https://ny2026.foodikal.rs/images/photos/Foodikal-130.jpg","display_order":6},{"id":7,"name":"Ассорти сыров и мясных деликатесов","item_link":"https://ny2026.foodikal.rs/#27","image_url":"https://ny2026.foodikal.rs/images/photos/Foodikal-110.jpg","display_order":7}],
    lastUpdated: "2025-12-04"
};

// Menu data - will be populated from API
let data = {};

// Cart state
let cart = [];
let appliedPromoCode = null;
let promoDiscount = 0;

// Promo validation cache
let promoValidationCache = null; // Stores last validation result from server
let promoDebounceTimer = null; // Timer for debouncing API calls
let isValidatingPromo = false; // Flag to prevent concurrent validations


const orderButton = document.querySelectorAll('.order');
const cartModal = document.getElementById('cartModal');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartButton = document.querySelector('.close-cart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const tabContentsContainer = document.getElementById('tabContentsContainer');

// Carousel DOM elements
const carouselWrapper = document.querySelector('.carousel-wrapper');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');
const carouselPrevBtn = document.getElementById('carouselPrev');
const carouselNextBtn = document.getElementById('carouselNext');

// Function to create a product card
function createProductCard(element) {
    let card = document.createElement("article");
    card.className = "cardMenuItem";
    card.dataset.id = element.id;
    card.setAttribute('itemscope', '');
    card.setAttribute('itemtype', 'https://schema.org/MenuItem');

    card.innerHTML = `
        <div class="card-top-row">
            <h2 class="itemTitle" itemprop="name">${element.name}</h2>
            <div class="itemPrice" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                <meta itemprop="price" content="${element.price}">
                <meta itemprop="priceCurrency" content="RSD">
                ${element.price} RSD
            </div>
        </div>
        <div class="card-bottom-row">
            <div class="description-wrapper">
                <div class="itemDescription truncated" itemprop="description">${element.description}</div>
            </div>
            <div class="quantity-controls">
                <button class="addItem" aria-label="Добавить ${element.name} в корзину">+</button>
            </div>
        </div>
    `;

    return card;
}

// Function to add truncation toggle buttons to descriptions
function addDescriptionToggles() {
    const allDescriptions = document.querySelectorAll('.itemDescription');

    allDescriptions.forEach((descElement, index) => {
        const wrapper = descElement.parentElement;

        // Remove existing toggle button if present
        const existingToggle = wrapper.querySelector('.description-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        // Make sure description starts as truncated
        if (!descElement.classList.contains('truncated')) {
            descElement.classList.add('truncated');
        }

        // Temporarily remove truncation to get natural height
        descElement.classList.remove('truncated');
        const naturalHeight = descElement.scrollHeight;

        // Add truncation back
        descElement.classList.add('truncated');
        const truncatedHeight = descElement.clientHeight;

        // Check if text is overflowing (natural height > truncated height)
        const isOverflowing = naturalHeight > truncatedHeight;

        if (isOverflowing) {
            // Add "ещё" toggle button after description
            const toggleBtn = document.createElement('span');
            toggleBtn.className = 'description-toggle';
            toggleBtn.textContent = 'ещё';

            wrapper.appendChild(toggleBtn);

            // Add click handler
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (descElement.classList.contains('truncated')) {
                    descElement.classList.remove('truncated');
                    toggleBtn.textContent = 'скрыть';
                } else {
                    descElement.classList.add('truncated');
                    toggleBtn.textContent = 'ещё';
                }
            });
        }
    });
}

// ===== CACHE-FIRST LOADING FUNCTIONS =====

// Initialize page with menu data (instant render)
function initializeWithData(menuData) {
    if (!menuData || typeof menuData !== 'object') {
        console.error('Invalid menu data, using fallback');
        menuData = FALLBACK_DATA.menu;
    }

    data = menuData;

    createTabContents();
    renderProducts();
    setupCategorySwitching();
    handleHashNavigation();
}

// Initialize carousel with banner data
function initializeCarouselWithData(bannerData) {
    if (!bannerData || !Array.isArray(bannerData) || bannerData.length === 0) {
        if (carouselWrapper) carouselWrapper.classList.add('hidden');
        return;
    }

    banners = bannerData;
    renderCarousel();
    setupCarouselNavigation();
    startAutoPlay();
}

// Handle URL hash navigation (product ID or category name)
function handleHashNavigation() {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const productId = parseInt(hash, 10);

        if (!isNaN(productId) && productId > 0) {
            setTimeout(() => navigateToProduct(productId), 200);
        } else if (hash) {
            navigateToCategory(decodeURIComponent(hash));
        }
    }
}

// Fetch fresh data from API and update silently if changed
async function fetchAndUpdateInBackground() {
    // Fetch menu
    try {
        const freshMenuData = await api.getMenu();

        if (freshMenuData && hasMenuDataChanged(data, freshMenuData)) {
            updateMenuSilently(freshMenuData);
        }
    } catch (error) {
        // Silent failure - page continues to work with fallback data
    }

    // Fetch banners
    try {
        const response = await fetch('https://foodikal-ny-cors-wrapper.x-gs-x.workers.dev/api/banners');
        const responseData = await response.json();

        if (responseData.success && responseData.banners) {
            if (hasBannerDataChanged(banners, responseData.banners)) {
                updateBannersSilently(responseData.banners);
            }
        }
    } catch (error) {
        // Silent failure - carousel continues with fallback banners
    }
}

// Deep comparison to detect menu data changes
function hasMenuDataChanged(oldData, newData) {
    const oldKeys = Object.keys(oldData).sort();
    const newKeys = Object.keys(newData).sort();

    if (oldKeys.length !== newKeys.length) return true;
    if (oldKeys.join(',') !== newKeys.join(',')) return true;

    for (const category of oldKeys) {
        const oldProducts = oldData[category];
        const newProducts = newData[category];

        if (oldProducts.length !== newProducts.length) return true;

        for (let i = 0; i < oldProducts.length; i++) {
            const oldP = oldProducts[i];
            const newP = newProducts[i];

            if (oldP.id !== newP.id ||
                oldP.name !== newP.name ||
                oldP.price !== newP.price ||
                oldP.description !== newP.description) {
                return true;
            }
        }
    }

    return false;
}

// Compare banner arrays to detect changes
function hasBannerDataChanged(oldBanners, newBanners) {
    if (oldBanners.length !== newBanners.length) return true;

    for (let i = 0; i < oldBanners.length; i++) {
        const oldB = oldBanners[i];
        const newB = newBanners[i];

        if (oldB.id !== newB.id ||
            oldB.name !== newB.name ||
            oldB.image_url !== newB.image_url) {
            return true;
        }
    }

    return false;
}

// Update menu data and re-render without disrupting user
function updateMenuSilently(newMenuData) {
    const scrollY = window.scrollY;
    const activeCategory = document.querySelector('.category.active');
    const activeCategoryName = activeCategory?.dataset.category;

    data = newMenuData;
    createTabContents();
    renderProducts();

    // Restore active category
    if (activeCategoryName) {
        const categories = document.querySelectorAll('.category');
        const tabContents = document.querySelectorAll('.tab-content');

        categories.forEach(c => c.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        const targetCategory = document.querySelector(`.category[data-category="${activeCategoryName}"]`);
        const targetContent = document.getElementById(`content-${activeCategoryName}`);

        if (targetCategory && targetContent) {
            targetCategory.classList.add('active');
            targetContent.classList.add('active');
        }
    }

    window.scrollTo(0, scrollY);
    syncCartQuantities();
}

// Update banner data and carousel without disrupting user
function updateBannersSilently(newBanners) {
    const oldSlide = currentSlide;

    banners = newBanners;
    renderCarousel();

    if (oldSlide < banners.length) {
        goToSlide(oldSlide);
    } else {
        goToSlide(0);
    }
}

// Sync cart quantities in product cards after re-render
function syncCartQuantities() {
    cart.forEach(cartItem => {
        const card = document.querySelector(`.cardMenuItem[data-id="${cartItem.id}"]`);

        if (card) {
            const controlsContainer = card.querySelector('.quantity-controls');

            controlsContainer.innerHTML = `
                <button class="minus-btn">-</button>
                <span class="quantity-display">${cartItem.quantity}</span>
                <button class="plus-btn">+</button>
            `;

            const plusBtn = controlsContainer.querySelector('.plus-btn');
            const minusBtn = controlsContainer.querySelector('.minus-btn');
            const quantityDisplay = controlsContainer.querySelector('.quantity-display');

            plusBtn.addEventListener('click', () => {
                const newQuantity = cartItem.quantity + 1;
                quantityDisplay.textContent = newQuantity;
                updateCartItemQuantity(cartItem.id, newQuantity);
            });

            minusBtn.addEventListener('click', () => {
                if (cartItem.quantity > 1) {
                    const newQuantity = cartItem.quantity - 1;
                    quantityDisplay.textContent = newQuantity;
                    updateCartItemQuantity(cartItem.id, newQuantity);
                } else {
                    controlsContainer.innerHTML = `<button class="addItem">+</button>`;
                    addQuantityControls(card);
                    removeFromCart(cartItem.id);
                }
            });
        }
    });
}

// ===== END CACHE-FIRST LOADING FUNCTIONS =====

// Function to create tab contents dynamically
function createTabContents() {
    const tabContentsContainer = document.getElementById('tabContentsContainer');
    const categories = Object.keys(data);

    // Clear existing contents
    tabContentsContainer.innerHTML = '';

    // Create content for each category
    categories.forEach((category, index) => {
        const tabContent = document.createElement('div');
        tabContent.className = `tab-content ${index === 0 ? 'active' : ''}`;
        tabContent.id = `content-${category}`;

        const productsGrid = document.createElement('div');
        productsGrid.className = 'products-grid';
        productsGrid.id = `grid-${category}`;

        tabContent.appendChild(productsGrid);
        tabContentsContainer.appendChild(tabContent);
    });
}

// Function to render products by category
function renderProducts() {
    const categories = Object.keys(data);

    categories.forEach(category => {
        const container = document.getElementById(`grid-${category}`);

        // Get products for this category
        const categoryProducts = data[category];

        // Clear container
        container.innerHTML = '';

        // Render products or empty state
        if (categoryProducts.length === 0) {
            container.innerHTML = '<div class="empty-state">В этой категории пока нет блюд</div>';
        } else {
            categoryProducts.forEach(product => {
                const card = createProductCard(product);
                container.appendChild(card);
                addQuantityControls(card);
            });
        }
    });

    // Add description toggle buttons after all cards are rendered
    setTimeout(() => {
        addDescriptionToggles();
    }, 100);
}

function findProductById(productId) {
    for (const category in data) {
        const product = data[category].find(item => item.id === productId);
        if (product) {
            return product;
        }
    }
    return null;
}

// Function to find product by ID and return both product and its category
function findProductWithCategory(productId) {
    for (const category in data) {
        const product = data[category].find(item => item.id === productId);
        if (product) {
            return { product, category };
        }
    }
    return null;
}

// Function to navigate to a specific product by ID
function navigateToProduct(productId) {
    const result = findProductWithCategory(productId);

    if (!result) {
        return;
    }

    const { category } = result;

    // Switch to the correct category tab
    const categories = document.querySelectorAll('.category');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active class from all categories and contents
    categories.forEach(c => c.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to target category and content
    const targetCategoryButton = document.querySelector(`.category[data-category="${category}"]`);
    const targetContent = document.getElementById(`content-${category}`);

    if (targetCategoryButton && targetContent) {
        targetCategoryButton.classList.add('active');
        targetContent.classList.add('active');
    }

    // Find the product card and scroll to it
    setTimeout(() => {
        const productCard = document.querySelector(`.cardMenuItem[data-id="${productId}"]`);

        if (productCard) {
            // Scroll to the product card
            productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add highlight effect
            productCard.classList.add('highlighted');

            // Remove highlight after animation completes
            setTimeout(() => {
                productCard.classList.remove('highlighted');
            }, 2000);
        }
    }, 100); // Small delay to ensure tab switch completes
}

// Navigate to a category by name
function navigateToCategory(categoryName) {
    // Find the category button with matching data-category attribute
    const categories = document.querySelectorAll('.category');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active class from all categories and contents
    categories.forEach(c => c.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Find and activate the target category
    const targetCategoryButton = document.querySelector(`.category[data-category="${categoryName}"]`);
    const targetContent = document.getElementById(`content-${categoryName}`);

    if (targetCategoryButton && targetContent) {
        targetCategoryButton.classList.add('active');
        targetContent.classList.add('active');

        // Add description toggles for newly visible tab
        setTimeout(() => {
            addDescriptionToggles();
        }, 100);

        // Scroll to the navbar area
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            setTimeout(() => {
                navbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
}

// Function to add quantity controls to a card
function addQuantityControls(card) {
    const addBtn = card.querySelector('.addItem');
    const controlsContainer = card.querySelector('.quantity-controls');

    let quantity = 0;

    addBtn.addEventListener('click', () => {
        if (quantity === 0) {
            // Replace "+" button with "- counter +"
            controlsContainer.innerHTML = `
                <button class="minus-btn">-</button>
                <span class="quantity-display">1</span>
                <button class="plus-btn">+</button>
            `;
            quantity = 1;

            // Add the item to cart
            const productId = parseInt(card.dataset.id);
            const product = findProductById(productId);
            if (product) {
                addToCart(product, 1);
            }



            // Add event listeners to the new buttons
            const plusBtn = controlsContainer.querySelector('.plus-btn');
            const minusBtn = controlsContainer.querySelector('.minus-btn');
            const quantityDisplay = controlsContainer.querySelector('.quantity-display');

            plusBtn.addEventListener('click', () => {
                quantity++;
                quantityDisplay.textContent = quantity;
                updateCartItemQuantity(productId, quantity);
            });

            minusBtn.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                    updateCartItemQuantity(productId, quantity);
                } else {
                    // Replace with just "+" when quantity is 0
                    controlsContainer.innerHTML = `<button class="addItem">+</button>`;
                    quantity = 0;
                    removeFromCart(productId);
                    // Re-add the event listener to the new button
                    addQuantityControls(card);
                }
            });
        }
    });
}

function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    updateCartDisplay();
}

// Function to handle category switching
function setupCategorySwitching() {
    const categories = document.querySelectorAll('.category');
    const tabContents = document.querySelectorAll('.tab-content');

    categories.forEach(category => {
        category.addEventListener('click', () => {
            // Remove active class from all categories and contents
            categories.forEach(c => c.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked category and corresponding content
            category.classList.add('active');
            const categoryName = category.getAttribute('data-category');
            document.getElementById(`content-${categoryName}`).classList.add('active');

            // Add description toggles for newly visible tab
            setTimeout(() => {
                addDescriptionToggles();
            }, 100);
        });
    });
}

// Carousel functionality
let currentSlide = 0;
let banners = [];
let autoPlayInterval = null;

async function setupCarousel() {
    try {
        // Fetch banners from API
        const response = await fetch('https://foodikal-ny-cors-wrapper.x-gs-x.workers.dev/api/banners');
        const responseData = await response.json();

        if (responseData.success && responseData.banners && responseData.banners.length > 0) {
            banners = responseData.banners;
            renderCarousel();
            setupCarouselNavigation();
            startAutoPlay();
        } else {
            // Hide carousel if no banners available
            if (carouselWrapper) {
                carouselWrapper.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Failed to load banners:', error);
        // Hide carousel on error
        if (carouselWrapper) {
            carouselWrapper.classList.add('hidden');
        }
    }
}

function renderCarousel() {
    if (!carouselTrack || !carouselDots) return;

    // Render slides without frame (frame is now stationary outside track)
    carouselTrack.innerHTML = banners.map(banner => `
        <div class="carousel-slide">
            <a href="${banner.item_link}" title="${banner.name}">
                <img src="${banner.image_url}" alt="${banner.name}">
                <div class="banner-text-overlay">
                    <h2 class="banner-title">${banner.name}</h2>
                </div>
            </a>
        </div>
    `).join('');

    // Render dots
    carouselDots.innerHTML = banners.map((_, index) => `
        <span class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
    `).join('');

    // Add click handlers to dots
    const dots = carouselDots.querySelectorAll('.carousel-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            goToSlide(index);
        });
    });
}

function setupCarouselNavigation() {
    if (!carouselPrevBtn || !carouselNextBtn) return;

    // Previous button
    carouselPrevBtn.addEventListener('click', prevSlide);

    // Next button
    carouselNextBtn.addEventListener('click', nextSlide);

    // Get carousel container for mouse tracking
    const carouselContainer = document.getElementById('carouselContainer');

    if (carouselContainer) {
        // Track mouse movement to show appropriate button
        carouselContainer.addEventListener('mousemove', (e) => {
            const rect = carouselContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const containerWidth = rect.width;
            const isLeftHalf = mouseX < containerWidth / 2;

            if (isLeftHalf) {
                carouselPrevBtn.classList.add('show');
                carouselNextBtn.classList.remove('show');
            } else {
                carouselPrevBtn.classList.remove('show');
                carouselNextBtn.classList.add('show');
            }
        });

        // Hide both buttons when mouse leaves
        carouselContainer.addEventListener('mouseleave', () => {
            carouselPrevBtn.classList.remove('show');
            carouselNextBtn.classList.remove('show');
        });
    }

    // Pause auto-play on hover
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => {
            stopAutoPlay();
        });

        carouselWrapper.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }

    // Add touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - go to next slide
                nextSlide();
            } else {
                // Swiped right - go to previous slide
                prevSlide();
            }
        }
    }
}

function goToSlide(index) {
    currentSlide = index;

    // Update track position
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Update dots
    if (carouselDots) {
        const dots = carouselDots.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % banners.length;
    goToSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + banners.length) % banners.length;
    goToSlide(currentSlide);
}

function startAutoPlay() {
    stopAutoPlay(); // Clear any existing interval
    if (banners.length > 1) {
        autoPlayInterval = setInterval(nextSlide, 5000); // 5 seconds
    }
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity = quantity;
        updateCartDisplay();
    }
}

// Function to remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}


function updateCartDisplay() {
    // Clear cart items container
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Ваша корзина пуста</div>';
        cartTotalElement.textContent = '0 RSD';
        // Reset promo validation state but keep the input value
        appliedPromoCode = null;
        promoValidationCache = null;
        // Update promo display to show "add items" message if code is entered
        if (promoInput && promoInput.value.trim()) {
            updatePromoDisplay();
        }
        return;
    }

    // Auto-validate promo if user entered code but hasn't validated yet
    const currentCode = promoInput ? promoInput.value.trim().toUpperCase() : '';
    if (currentCode.length >= 3 && !appliedPromoCode && (!promoValidationCache || promoValidationCache.code !== currentCode)) {
        // No promo applied yet and not validated - validate it now
        updatePromoDisplay();
    }

    // Add each item to the cart display
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} RSD</div>
            </div>
            <div class="cart-item-controls">
                <button class="minus-btn" data-id="${item.id}">-</button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button class="plus-btn" data-id="${item.id}">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate discount locally if promo is applied
    let total, discountAmount;

    if (appliedPromoCode) {
        // Calculate 5% discount
        const discountedPrice = subtotal * 0.95;
        // Round final price to nearest 50 RSD
        total = Math.round(discountedPrice / 50) * 50;
        discountAmount = subtotal - total;
    } else {
        // No promo applied
        discountAmount = 0;
        total = subtotal;
    }

    // Update display based on whether promo is applied
    const cartTotalSection = document.getElementById('cartTotalSection');

    if (appliedPromoCode && discountAmount > 0) {
        // Show total with strikethrough and discounted total in green
        cartTotalSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Итого:</span>
                <span style="text-decoration: line-through;">${subtotal} RSD</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #28a745; font-weight: 700;">
                <span>Итого со скидкой:</span>
                <span id="cartTotal">${total} RSD</span>
            </div>
        `;
    } else {
        // Show just total
        cartTotalSection.innerHTML = `
            <span>Итого:</span>
            <span id="cartTotal">${total} RSD</span>
        `;
    }

    // Add event listeners to cart item controls
    document.querySelectorAll('.cart-item-controls .plus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const productCard = document.querySelector(`.cardMenuItem[data-id="${productId}"]`);
            const quantityDisplay = productCard.querySelector('.quantity-display');
            let currentQuantity = parseInt(quantityDisplay.textContent);
            currentQuantity++;
            quantityDisplay.textContent = currentQuantity;
            updateCartItemQuantity(productId, currentQuantity);
        });
    });

    document.querySelectorAll('.cart-item-controls .minus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const productCard = document.querySelector(`.cardMenuItem[data-id="${productId}"]`);
            const quantityDisplay = productCard.querySelector('.quantity-display');
            let currentQuantity = parseInt(quantityDisplay.textContent);

            if (currentQuantity > 1) {
                currentQuantity--;
                quantityDisplay.textContent = currentQuantity;
                updateCartItemQuantity(productId, currentQuantity);
            } else {
                // Remove from cart and reset product card
                const controlsContainer = productCard.querySelector('.quantity-controls');
                controlsContainer.innerHTML = `<button class="addItem">+</button>`;
                addQuantityControls(productCard);
                removeFromCart(productId);
            }
        });
    });
}

// Event listeners for cart modal
for (let button of orderButton) {
    button.addEventListener('click', function() {
    cartModal.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Validate delivery dates when cart opens
    validateDeliveryDates();
});
}


closeCartButton.addEventListener('click', function() {
    cartModal.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

cartOverlay.addEventListener('click', function() {
    cartModal.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close cart with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cartModal.classList.contains('active')) {
        cartModal.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Promo code handler
const promoInput = document.getElementById('promoCode');
const promoMessage = document.getElementById('promoMessage');

async function updatePromoDisplay() {
    if (!promoInput) return;

    const code = promoInput.value.trim().toUpperCase();

    // Clear debounce timer
    if (promoDebounceTimer) {
        clearTimeout(promoDebounceTimer);
        promoDebounceTimer = null;
    }

    if (!code) {
        promoMessage.textContent = '';
        promoMessage.className = 'promo-message';
        // Only update cart if we're clearing an applied promo
        if (appliedPromoCode) {
            appliedPromoCode = null;
            promoValidationCache = null;
            updateCartDisplay();
        }
        return;
    }

    // Client-side format validation
    if (code.length < 3) {
        promoMessage.textContent = 'Минимум 3 символа';
        promoMessage.className = 'promo-message error';
        return;
    }

    if (!/^[A-Z0-9А-ЯЁ]+$/u.test(code)) {
        promoMessage.textContent = 'Только буквы и цифры';
        promoMessage.className = 'promo-message error';
        return;
    }

    // Check if cart is empty
    if (cart.length === 0) {
        promoMessage.textContent = 'Добавьте товары в корзину';
        promoMessage.className = 'promo-message';
        // Don't clear promo code - it will auto-validate when items are added
        return;
    }

    // Check if we already validated this exact code
    if (promoValidationCache && promoValidationCache.code === code) {
        // Already validated - don't validate again
        return;
    }

    // Show loading state
    promoMessage.textContent = 'Проверка промокода...';
    promoMessage.className = 'promo-message';

    // Debounce API call (500ms)
    promoDebounceTimer = setTimeout(async () => {
        await validatePromoWithServer(code);
    }, 500);
}

async function validatePromoWithServer(code) {
    if (isValidatingPromo) return;

    isValidatingPromo = true;

    try {
        // Prepare cart items for API (limit to 20 for validation)
        const orderItems = cart.slice(0, 20).map(item => ({
            item_id: item.id,
            quantity: item.quantity
        }));

        // Call API to validate promo code
        const result = await api.validatePromoCode(code, orderItems);

        // Check if promo code still matches (user might have changed it)
        if (promoInput.value.trim().toUpperCase() !== code) {
            return; // User changed the code, ignore this result
        }

        if (result.valid) {
            appliedPromoCode = code;
            promoValidationCache = { code: code, valid: true };
            promoMessage.textContent = 'Промокод применен!';
            promoMessage.className = 'promo-message success';
        } else {
            appliedPromoCode = null;
            promoValidationCache = { code: code, valid: false }; // Cache invalid result
            promoMessage.textContent = `✗ ${result.error || 'Промокод недействителен'}`;
            promoMessage.className = 'promo-message error';
        }

        updateCartDisplay();
    } catch (error) {
        console.error('Promo validation error:', error);
        promoMessage.textContent = '✗ Ошибка проверки промокода';
        promoMessage.className = 'promo-message error';
        appliedPromoCode = null;
        promoValidationCache = null;
        updateCartDisplay();
    } finally {
        isValidatingPromo = false;
    }
}

// Auto-uppercase and validate on input
if (promoInput) {
    promoInput.addEventListener('input', function(e) {
        const upperValue = e.target.value.toUpperCase();
        if (e.target.value !== upperValue) {
            e.target.value = upperValue;
        }
        updatePromoDisplay();
    });
}

// Function to validate and update delivery date buttons based on 2-day advance requirement
function validateDeliveryDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

    const dateButtons = document.querySelectorAll('.date-btn');
    const deliveryDateInput = document.getElementById('deliveryDate');
    let firstValidButton = null;
    let currentSelectionValid = false;

    dateButtons.forEach(button => {
        const deliveryDateStr = button.getAttribute('data-value');
        const deliveryDate = new Date(deliveryDateStr);
        deliveryDate.setHours(0, 0, 0, 0);

        // Calculate days difference
        const diffTime = deliveryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Button is valid if delivery date is at least 2 days from today
        if (diffDays >= 2) {
            button.classList.remove('disabled');
            if (!firstValidButton) {
                firstValidButton = button;
            }
            // Check if this is the currently selected button
            if (button.classList.contains('selected')) {
                currentSelectionValid = true;
            }
        } else {
            button.classList.add('disabled');
            // Remove selection if this disabled button was selected
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
            }
        }
    });

    // If current selection is invalid, auto-select first valid date
    if (!currentSelectionValid && firstValidButton) {
        firstValidButton.classList.add('selected');
        deliveryDateInput.value = firstValidButton.getAttribute('data-value');
    }
}

// Date button selection handler
const dateButtons = document.querySelectorAll('.date-btn');
const deliveryDateInput = document.getElementById('deliveryDate');

dateButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Don't allow selection of disabled buttons
        if (this.classList.contains('disabled')) {
            return;
        }

        // Remove selected class from all buttons
        dateButtons.forEach(btn => btn.classList.remove('selected'));

        // Add selected class to clicked button
        this.classList.add('selected');

        // Update hidden input value
        deliveryDateInput.value = this.getAttribute('data-value');
    });
});

// Form submission handler
const checkoutForm = document.getElementById('checkoutForm');
const formMessage = document.getElementById('formMessage');
const submitOrderBtn = document.getElementById('submitOrderBtn');

checkoutForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate cart is not empty
    if (cart.length === 0) {
        showFormMessage('Ваша корзина пуста. Добавьте товары перед оформлением заказа.', 'error');
        return;
    }

    // Get form data
    const formData = new FormData(checkoutForm);
    const customerName = formData.get('customerName').trim();
    const customerContact = formData.get('customerContact').trim();
    const deliveryAddress = formData.get('deliveryAddress').trim();
    const deliveryDate = formData.get('deliveryDate');
    const comments = formData.get('comments').trim();

    // Validate required fields
    if (!customerName || customerName.length < 2) {
        showFormMessage('Пожалуйста, введите корректное имя (минимум 2 символа).', 'error');
        return;
    }

    if (!customerContact || customerContact.length < 3) {
        showFormMessage('Пожалуйста, введите номер телефона или Telegram.', 'error');
        return;
    }

    if (!deliveryAddress || deliveryAddress.length < 5) {
        showFormMessage('Пожалуйста, введите корректный адрес доставки (минимум 5 символов).', 'error');
        return;
    }

    if (!deliveryDate) {
        showFormMessage('Пожалуйста, выберите дату доставки.', 'error');
        return;
    }

    // Build order data
    const orderData = {
        customer_name: customerName,
        customer_contact: customerContact,
        delivery_address: deliveryAddress,
        delivery_date: deliveryDate,
        comments: comments || '',
        order_items: cart.map(item => ({
            item_id: item.id,
            quantity: item.quantity
        }))
    };

    // Add promo code if applied
    if (appliedPromoCode) {
        orderData.promo_code = appliedPromoCode;
    }

    // Disable submit button
    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = 'Отправка...';

    try {
        // Submit order
        const result = await api.createOrder(orderData);

        // Show success message
        showFormMessage(
            `Заказ успешно создан! Итого: ${result.totalPrice} RSD. Наш менеджер свяжется с вами для подтверждения.`,
            'success'
        );

        // Clear cart
        cart = [];
        updateCartDisplay();

        // Reset form
        checkoutForm.reset();

        // Clear promo code input and message
        if (promoInput) {
            promoInput.value = '';
            promoMessage.textContent = '';
            promoMessage.className = 'promo-message';
        }

        // Clear promo cache
        appliedPromoCode = null;
        promoValidationCache = null;

        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        // Check if error is related to invalid promo code
        if (error.details && error.details.promo_code) {
            // Clear invalid promo code
            appliedPromoCode = null;
            promoValidationCache = null;

            // Show error in promo section
            promoMessage.textContent = '✗ ' + error.details.promo_code;
            promoMessage.className = 'promo-message error';

            // Update cart display to remove discount
            updateCartDisplay();

            // Show general error message
            showFormMessage(
                'Промокод недействителен. Пожалуйста, проверьте код или продолжите без промокода.',
                'error'
            );

            // Scroll to promo section to make error visible
            if (promoInput) {
                promoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // Show generic error message
            showFormMessage(
                `Ошибка при создании заказа: ${error.message}. Пожалуйста, попробуйте еще раз или свяжитесь с нами напрямую.`,
                'error'
            );
        }
    } finally {
        // Re-enable submit button
        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = 'Отправить заказ';
    }
});

// Helper function to show form messages
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // PHASE 1: Instant render with embedded fallback data
    initializeWithData(FALLBACK_DATA.menu);
    initializeCarouselWithData(FALLBACK_DATA.banners);

    // PHASE 2: Background fetch and silent update
    // Small delay to let initial render complete
    setTimeout(() => {
        fetchAndUpdateInBackground();
    }, 100);
});

// Handle window resize to re-check description truncation
let resizeTimeout;
window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        addDescriptionToggles();
    }, 300);
});

// Handle hash changes while page is active
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1); // Remove the # symbol
    const productId = parseInt(hash, 10);

    // Check if it's a numeric product ID
    if (!isNaN(productId) && productId > 0) {
        navigateToProduct(productId);
    }
    // Check if it's a category name
    else if (hash) {
        const decodedHash = decodeURIComponent(hash);
        navigateToCategory(decodedHash);
    }
});