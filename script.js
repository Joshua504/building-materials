// Cart functionality
class Cart {
	constructor() {
		this.items = JSON.parse(localStorage.getItem('cart')) || [];
		this.init();
	}

	init() {
		this.addEventListeners();
		this.updateCartDisplay();
	}

	addEventListeners() {
		// Add to cart buttons
		document.addEventListener('click', (e) => {
			if (e.target.classList.contains('add')) {
				this.addToCart(e.target);
			}

			// Checkout button
			if (e.target.classList.contains('checkout-btn')) {
				this.processCheckout(e.target);
			}
		});
	}

	addToCart(button) {
		const productItem = button.closest('.item');
		const product = {
			id: productItem.dataset.productId,
			name: productItem.dataset.productName,
			price: parseInt(productItem.dataset.productPrice),
			image: productItem.dataset.productImage,
			quantity: 1,
		};

		const existingItem = this.items.find((item) => item.id === product.id);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			this.items.push(product);
		}

		this.saveCart();
		this.showAddedMessage();
		this.updateCartDisplay();
	}

	removeFromCart(productId) {
		this.items = this.items.filter((item) => item.id !== productId);
		this.saveCart();
		this.updateCartDisplay();
	}

	updateQuantity(productId, quantity) {
		const item = this.items.find((item) => item.id === productId);
		if (item) {
			item.quantity = quantity;
			if (item.quantity <= 0) {
				this.removeFromCart(productId);
			} else {
				this.saveCart();
				this.updateCartDisplay();
			}
		}
	}

	saveCart() {
		localStorage.setItem('cart', JSON.stringify(this.items));
	}

	showAddedMessage() {
		this.showNotification(
			'Product Added!',
			'Item has been successfully added to your cart.',
			'success'
		);
	}

	showNotification(title, message, type = 'success') {
		// Remove existing notification if any
		const existingNotification = document.querySelector(
			'.notification-overlay'
		);
		if (existingNotification) {
			existingNotification.remove();
		}

		// Create overlay
		const overlay = document.createElement('div');
		overlay.className = 'notification-overlay';

		// Create notification
		const notification = document.createElement('div');
		notification.className = `notification ${type}`;

		const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

		notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="notification-btn" onclick="this.closest('.notification-overlay').remove()">OK</button>
        `;

		overlay.appendChild(notification);
		document.body.appendChild(overlay);

		// Auto remove after 3 seconds
		setTimeout(() => {
			if (overlay.parentNode) {
				overlay.remove();
			}
		}, 3000);

		// Remove on overlay click
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				overlay.remove();
			}
		});
	}

	processCheckout(button) {
		if (this.items.length === 0) {
			this.showNotification(
				'Cart Empty!',
				'Please add items to your cart before checkout.',
				'error'
			);
			return;
		}

		// Disable checkout button
		button.classList.add('loading');
		button.textContent = 'Processing...';

		// Show loading overlay
		this.showLoadingOverlay();

		// Simulate checkout process (10 seconds)
		setTimeout(() => {
			this.hideLoadingOverlay();
			this.showCheckoutSuccess();

			// Clear cart after successful checkout
			this.items = [];
			this.saveCart();
			this.updateCartDisplay();

			// Reset button
			button.classList.remove('loading');
			button.textContent = 'Proceed to Checkout';
		}, 10000);
	}

	showLoadingOverlay() {
		// Remove existing loading overlay if any
		const existingOverlay = document.querySelector('.loading-overlay');
		if (existingOverlay) {
			existingOverlay.remove();
		}

		const loadingOverlay = document.createElement('div');
		loadingOverlay.className = 'loading-overlay';

		loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Processing Your Order</h3>
                <p>Please wait while we process your checkout...</p>
            </div>
        `;

		document.body.appendChild(loadingOverlay);
	}

	hideLoadingOverlay() {
		const loadingOverlay = document.querySelector('.loading-overlay');
		if (loadingOverlay) {
			loadingOverlay.remove();
		}
	}

	showCheckoutSuccess() {
		const total = this.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		const orderNumber = 'WM' + Date.now().toString().slice(-6);

		this.showNotification(
			'Checkout Successful! 🎉',
			`Your order #${orderNumber} for ₦${total.toLocaleString()} has been processed successfully. Thank you for your purchase!`,
			'success'
		);
	}

	updateCartDisplay() {
		const cartItemsContainer = document.getElementById('cart-items');
		const cartTotal = document.getElementById('cart-total');
		const totalAmount = document.getElementById('total-amount');

		if (!cartItemsContainer) return;

		if (this.items.length === 0) {
			cartItemsContainer.innerHTML =
				'<p class="empty-cart">Your cart is empty</p>';
			if (cartTotal) cartTotal.style.display = 'none';
			return;
		}

		let total = 0;
		let html = '';

		this.items.forEach((item) => {
			const itemTotal = item.price * item.quantity;
			total += itemTotal;

			html += `
                <div class="cart-item" data-product-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>₦${item.price.toLocaleString()}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="qty-btn minus" onclick="cart.updateQuantity('${
													item.id
												}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="cart.updateQuantity('${
													item.id
												}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-total">
                        <p>₦${itemTotal.toLocaleString()}</p>
                        <button class="remove-btn" onclick="cart.removeFromCart('${
													item.id
												}')">Remove</button>
                    </div>
                </div>
            `;
		});

		cartItemsContainer.innerHTML = html;

		if (totalAmount) {
			totalAmount.textContent = total.toLocaleString();
			cartTotal.style.display = 'block';
		}
	}

	getCartCount() {
		return this.items.reduce((total, item) => total + item.quantity, 0);
	}
}

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');

// Toggle a class to show/hide the menu on click
hamburger.addEventListener('click', () => {
	navMenu.classList.toggle('active');
});

// Initialize cart and mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	window.cart = new Cart();
});
