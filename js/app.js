// set variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart
let cart = [];

// buttons

let buttonsDOM = [];

// getting all the products
class Products {
	async getProducts() {
		try {
			let result = await fetch('data.json');
			let data = await result.json();
			let products = data.items;
			products = products.map(item => {
				const { title, price } = item.fields;
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return { title, price, id, image };
			});
			return products;
		} catch (error) {
			console.log(error);
		}
	}
}

// display products to the screen
class Screen {
	displayProduct(products) {
		let result = '';
		products.forEach(product => {
			result += `
				<!---start single product--->
				<article class="product">
					<div class="img-container">
						<img src="${product.image}" alt="sofa" class="product-img" />
						<button class="bag-btn" data-id=${product.id}>
							<i class="bx bx-cart-alt" id="cart-btn"></i>
							add to card
						</button>
					</div>
					<h3>${product.title}</h3>
					<h4>£ ${product.price}</h4>
				</article>
				<!---end single product--->
	`;
		});
		productsDOM.innerHTML = result;
	}
	getCartButtons() {
		const buttons = [...document.querySelectorAll('.bag-btn')];
		buttonsDOM = buttons;
		buttons.forEach(button => {
			let id = button.dataset.id;
			let inCart = cart.find(item => item.id === id);
			if (inCart) {
				button.innerText = 'In Cart';
				button.disabled = true;
			}
			button.addEventListener('click', event => {
				event.target.innerText = 'In Cart';
				event.target.disabled = true;
				// get product from products
				let cartItem = { ...Storage.getProduct(id), amount: 1 };
				// add product to the cart
				cart = [...cart, cartItem];
				//save cart in local storage
				Storage.saveCart(cart);
				//set cart values
				this.setCartValues(cart);
				// display cart item
				this.addCartItem(cartItem);
				//show the cart
				this.showCart();
			});
		});
	}
	setCartValues() {
		let tempTotal = 0;
		let itemsTotal = 0;
		cart.map(item => {
			tempTotal += item.price * item.amount;
			itemsTotal += item.amount;
		});
		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemsTotal;
	}
	addCartItem(item) {
		const div = document.createElement('div');
		div.classList.add('cart-item');
		div.innerHTML = `
		 <!---start cart item--->
    <img src="${item.image}" alt="product" />
    <div>
      <h3>${item.title}</h3>
      <h5>£${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>delete</span>
    </div>
    
    <div>
      <i class="bx bx-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="bx bx-chevron-down" data-id=${item.id}></i>
    </div>
		 <!---end cart item---->
	 `;

		cartContent.appendChild(div);
		console.log(cartContent);
	}
	showCart() {
		cartOverlay.classList.add('transparentBcg');
		cartDOM.classList.add('showCart');
	}
	setUpApp() {
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);
		cartBtn.addEventListener('click', this.showCart);
		closeCartBtn.addEventListener('click', this.hideCart);
	}
	populateCart(cart) {
		cart.forEach(item => this.addCartItem(item));
	}
	hideCart() {
		cartOverlay.classList.remove('transparentBcg');
		cartDOM.classList.remove('showCart');
	}
	cartLogic() {
		// clear cart button
		clearCartBtn.addEventListener('click', () => {
			this.clearCart();
		});
		// cart functionality
		cartContent.addEventListener('click', event => {
			if (event.target.classList.contains('remove-item')) {
				let removeItem = event.target;
				let id = removeItem.dataset.id;
				cartContent.removeChild(removeItem.parentElement.parentElement);
				this.removeItem(id);
			} else if (event.target.classList.contains('bx-chevron-up')) {
				let addAmount = event.target;
				let id = addAmount.dataset.id;
				let tempItem = cart.find(item => item.id === id);
				tempItem.amount = tempItem.amount + 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addAmount.nextElementSibling.innerText = tempItem.amount;
			} else if (event.target.classList.contains('bx-chevron-down')) {
				let lowerAmount = event.target;
				let id = lowerAmount.dataset.id;
				let tempItem = cart.find(item => item.id === id);
				tempItem.amount = tempItem.amount - 1;
				if (tempItem.amount > 0) {
					Storage.saveCart(cart);
					this.setCartValues(cart);
					lowerAmount.previousElementSibling.innerText = tempItem.amount;
				} else {
					cartContent.removeChild(lowerAmount.parentElement.parentElement);
					this.removeItem(id);
				}
			}
		});
	}
	clearCart() {
		let cartItems = cart.map(item => item.id);
		cartItems.forEach(id => this.removeItem(id));
		console.log(cartContent.children);
		while (cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}
		this.hideCart();
	}
	removeItem(id) {
		cart = cart.filter(item => item.id !== id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getSingleButton(id);
		button.disabled = false;
		button.innerHTML = `
		 <i class='bx bx-cart' ></i>add to cart
	 `;
	}
	getSingleButton(id) {
		return buttonsDOM.find(button => button.dataset.id === id);
	}
}

// add data on local storage
class Storage {
	static saveProducts(products) {
		localStorage.setItem('products', JSON.stringify(products));
	}
	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find(product => product.id === id);
	}
	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
	static getCart() {
		return localStorage.getItem('cart')
			? JSON.parse(localStorage.getItem('cart'))
			: [];
	}
}

document,
	addEventListener('DOMContentLoaded', () => {
		const screen = new Screen();
		const products = new Products();

		// set app
		screen.setUpApp();

		// get all products
		products
			.getProducts()
			.then(products => {
				screen.displayProduct(products);
				Storage.saveProducts(products);
			})
			.then(() => {
				screen.getCartButtons();
				screen.cartLogic();
			});
	});

// hamburger menu
const menu = document.querySelector('#menu-icon');
const navMenu = document.querySelector('.nav-menu');

menu.addEventListener('click', () => {
	menu.classList.toggle('active');
	navMenu.classList.toggle('active');
});

// countdown date
let countDate = new Date('sep, 2022 00:00:00').getTime();

function countDown() {
	let now = new Date().getTime();
	gap = now - countDate;

	let seconds = 1000;
	let minutes = seconds * 60;
	let hours = minutes * 60;
	let day = hours * 24;

	let d = Math.floor(gap / day);
	let h = Math.floor((gap % day) / hours);
	let m = Math.floor((gap % hours) / minutes);
	let s = Math.floor((gap % minutes) / seconds);

	document.getElementById('days').innerText = d;
	document.getElementById('hours').innerText = h;
	document.getElementById('minutes').innerText = m;
	document.getElementById('seconds').innerText = s;
}

setInterval(function () {
	console.log(countDown());
}, 1000);
