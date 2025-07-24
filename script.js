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

// Hamburger Menu functionality
class MobileMenu {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('nav ul');
        this.init();
    }

    init() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.toggleMenu();
            });

            // Close menu when clicking on a nav link
            this.navMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMenu();
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }
    }

    toggleMenu() {
        console.log('Hamburger clicked!'); // Debug log
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('mobile-active');
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('mobile-active');
    }
}

// Contact Form functionality
class ContactForm {
    constructor() {
        this.form = document.querySelector('.input-sec');
        this.sendButton = this.form?.querySelector('button');
        this.nameInput = this.form?.querySelector('input[placeholder="name"]');
        this.phoneInput = this.form?.querySelector('input[placeholder="phone number"]');
        this.emailInput = this.form?.querySelector('input[placeholder="email"]');
        this.messageTextarea = this.form?.querySelector('textarea');
        this.init();
    }

    init() {
        if (this.sendButton) {
            this.sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    handleSubmit() {
        const formData = this.validateForm();
        
        if (!formData.isValid) {
            this.showErrorPopup(formData.errors);
            return;
        }

        // Show loading state
        this.sendButton.textContent = 'Sending...';
        this.sendButton.disabled = true;

        // Simulate sending (2 seconds delay)
        setTimeout(() => {
            this.showSuccessPopup();
            this.clearForm();
            
            // Reset button
            this.sendButton.textContent = 'send';
            this.sendButton.disabled = false;
        }, 2000);
    }

    validateForm() {
        const errors = [];
        let isValid = true;

        // Check name
        if (!this.nameInput?.value.trim()) {
            errors.push('Name is required');
            isValid = false;
        }

        // Check phone
        if (!this.phoneInput?.value.trim()) {
            errors.push('Phone number is required');
            isValid = false;
        } else if (!/^\d{10,}$/.test(this.phoneInput.value.trim())) {
            errors.push('Please enter a valid phone number');
            isValid = false;
        }

        // Check email
        if (!this.emailInput?.value.trim()) {
            errors.push('Email is required');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailInput.value.trim())) {
            errors.push('Please enter a valid email address');
            isValid = false;
        }

        // Check message
        if (!this.messageTextarea?.value.trim()) {
            errors.push('Message is required');
            isValid = false;
        }

        return { isValid, errors };
    }

    showErrorPopup(errors) {
        const errorMessage = errors.length === 1 
            ? errors[0] 
            : 'Please fix the following:\n• ' + errors.join('\n• ');
            
        this.showNotification('Form Validation Error', errorMessage, 'error');
    }

    showSuccessPopup() {
        this.showNotification(
            'Message Sent Successfully! 📧', 
            'Thank you for contacting us. We will get back to you within 24 hours.', 
            'success'
        );
    }

    clearForm() {
        if (this.nameInput) this.nameInput.value = '';
        if (this.phoneInput) this.phoneInput.value = '';
        if (this.emailInput) this.emailInput.value = '';
        if (this.messageTextarea) this.messageTextarea.value = '';
    }

    showNotification(title, message, type = 'success') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification-overlay');
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
            <p style="white-space: pre-line;">${message}</p>
            <button class="notification-btn" onclick="this.closest('.notification-overlay').remove()">OK</button>
        `;

        overlay.appendChild(notification);
        document.body.appendChild(overlay);

        // Auto remove after 4 seconds for error, 3 for success
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, type === 'error' ? 4000 : 3000);

        // Remove on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }
}

// Initialize cart, mobile menu, and contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	window.cart = new Cart();
    window.mobileMenu = new MobileMenu();
    window.contactForm = new ContactForm();
});
