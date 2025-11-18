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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Order API response:', result);

            if (result.success) {
                return {
                    orderId: result.order_id,
                    totalPrice: result.total_price,
                    message: result.message
                };
            } else {
                // Include details if available
                const errorMessage = result.error || 'Failed to create order';
                if (result.details) {
                    console.error('Order validation errors:', result.details);
                    throw new Error(`${errorMessage}: ${JSON.stringify(result.details)}`);
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    }
}

// Initialize API
const api = new FoodikalAPI();

// Menu data - will be populated from API
let data = {};

// Cart state
let cart = [];


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

    // Use placeholder if no image is provided
    let imagePath = 'images/photos/placeholder.jpg';
    if (element.image && element.image.trim() !== '') {
        // Ensure image path has images/ prefix
        imagePath = element.image.startsWith('images/') ? element.image : `images/${element.image}`;
    }

    card.innerHTML = `
        <img class="itemImage" src="${imagePath}" alt="${element.name}" onerror="this.src='images/photos/placeholder.jpg'">
        <div class="itemText">
            <h2 class="itemTitle">${element.name}</h2>
            <div class="itemDescription">${element.description}</div>
            <div class="itemRow">
                <div class="itemPrice">${element.price} RSD</div>
                <div class="quantity-controls">
                    <button class="addItem">+</button>
                </div>
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
        return;
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

    // Calculate and display total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `${total} RSD`;

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

// Date button selection handler
const dateButtons = document.querySelectorAll('.date-btn');
const deliveryDateInput = document.getElementById('deliveryDate');

dateButtons.forEach(button => {
    button.addEventListener('click', function() {
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

        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        // Show error message
        showFormMessage(
            `Ошибка при создании заказа: ${error.message}. Пожалуйста, попробуйте еще раз или свяжитесь с нами напрямую.`,
            'error'
        );
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
    } catch (error) {
        // Show error message
        const container = document.querySelector('.container');
        container.innerHTML = `<div class="error-message">Ошибка загрузки меню: ${error.message}<br>Пожалуйста, обновите страницу.</div>`;
        console.error('Failed to initialize menu:', error);
    }
});