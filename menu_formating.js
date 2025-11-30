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
            console.log('API Response:', result);

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
            console.log('Sending order data:', orderData);

            const response = await fetch(`${this.baseURL}/api/create_order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            console.log('Order API response:', result);

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
            console.log('Validating promo code:', promoCode);

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
            console.log('Promo validation response:', result);

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

// Function to create a product card
function createProductCard(element) {
    let card = document.createElement("div");
    card.className = "cardMenuItem";
    card.dataset.id = element.id;

    card.innerHTML = `
        <div class="card-top-row">
            <h2 class="itemTitle">${element.name}</h2>
            <div class="itemPrice">${element.price} RSD</div>
        </div>
        <div class="card-bottom-row">
            <div class="itemDescription">${element.description}</div>
            <div class="quantity-controls">
                <button class="addItem">+</button>
            </div>
        </div>
    `;
    return card;
}

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
        console.log(`Product with ID ${productId} not found`);
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
        });
    });
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
    try {
        // Show loading state
        const container = document.querySelector('.container');
        container.innerHTML = '<div class="loading-message">Загрузка меню...</div>';

        // Fetch menu from API
        const menuData = await api.getMenu();

        // Validate menu data
        if (!menuData || typeof menuData !== 'object') {
            throw new Error('Invalid menu data received from API');
        }

        data = menuData;
        console.log('Menu loaded successfully:', Object.keys(data));

        // Hide loading and render content
        container.innerHTML = '<div id="tabContentsContainer"></div>';

        createTabContents();
        renderProducts();
        setupCategorySwitching();

        // Handle URL hash navigation (e.g., #30 for product ID 30)
        if (window.location.hash) {
            const hash = window.location.hash.substring(1); // Remove the # symbol
            const productId = parseInt(hash, 10);

            if (!isNaN(productId) && productId > 0) {
                // Navigate to the product after a short delay to ensure DOM is ready
                setTimeout(() => {
                    navigateToProduct(productId);
                }, 200);
            }
        }
    } catch (error) {
        // Show error message
        const container = document.querySelector('.container');
        container.innerHTML = `<div class="error-message">Ошибка загрузки меню: ${error.message}<br>Пожалуйста, обновите страницу.</div>`;
        console.error('Failed to initialize menu:', error);
    }
});

// Handle hash changes while page is active
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1); // Remove the # symbol
    const productId = parseInt(hash, 10);

    if (!isNaN(productId) && productId > 0) {
        navigateToProduct(productId);
    }
});