// Fixed JSON data with proper syntax
const data = {
    "Брускеты": [
        {
            "id": 1,
            "name": "Брускетта с вяленой свининой (60г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 300,
            "image": "images/img1.jpg"
        },
        {
            "id": 15,
            "name": "Брускетта с вяленой свининой (60г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 300,
            "image": "images/img1.jpg"
        },

        {
            "id": 2,
            "name": "Брускетта с гравлаксом (60г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 220,
            "image": "images/img1.jpg"
        },
        {
            "id": 3,
            "name": "Брускетта с грибной икрой (60г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 120,
            "image": "images/img1.jpg"
        }
    ],
    "Горячее": [
        {
            "id": 4,
            "name": "Баранья нога (запеченая, 1780г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 15500,
            "image": "images/img1.jpg"
        },
        {
            "id": 5,
            "name": "Куриный шашлычок с картофелем фри (200г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 550,
            "image": "images/img1.jpg"
        },
        {
            "id": 6,
            "name": "Овощи гриль (550г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 650,
            "image": "images/img1.jpg"
        }
    ],
    "Закуски": [
        {
            "id": 7,
            "name": "Ассорти сыров и мясных деликатесов (300г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 2000,
            "image": "images/img1.jpg"
        },
        {
            "id": 8,
            "name": "Хумус с баклажаном (закуска, 1шт 50г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 120,
            "image": "images/img1.jpg"
        }
    ],
    "Канапе": [
        {
            "id": 9,
            "name": "Канапе овощное (45г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 75,
            "image": "images/img1.jpg"
        },
        {
            "id": 10,
            "name": "Канапе с ветчиной (40г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 90,
            "image": "images/img1.jpg"
        },
        {
            "id": 11,
            "name": "Канапе с грушей и пршутом (25г)",
            "description": "Состав составов: блюдо состоит из кучи разных штук например штука1 и штука2 и штука3 и штука4.",
            "price": 140,
            "image": "images/img1.jpg"
        }

    ],
    "Салаты": [],
    "Тарталетки": []
};

// Cart state
let cart = [];


const orderButton = document.querySelector('.order');
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
        <img class="itemImage" src="${element.image}" alt="${element.name}">
        <h2 class="itemTitle">${element.name}</h2>
        <div class="itemDescription">${element.description}</div>
        <div class="itemRow">
            <div class="itemPrice">${element.price} RSD</div>
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
orderButton.addEventListener('click', function() {
    cartModal.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

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


// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    createTabContents();
    renderProducts();
    setupCategorySwitching();
});