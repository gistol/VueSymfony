import uuid from 'uuid/v4';
import Main from '../Templates/Main.vue';
import CoffeeMenu from './CoffeeMenu.js';
import Cart from './Cart.js';
import EventBus from './EventBus.js';
import WsConnection from '../Services/WebsocketClient.js';
import Message from '../Services/MessageGenerator.js';
import menuData from '../../data/MenuData.json';

Main.data = function() {
	return {
		/** @type {Object<orderItem>} */
		order: {},
		/** @type {uuid} */
		orderID: null,
		/** @type {WebSocket} */
		connection: null,
		/** @type {uuid} */
		clientID: null
	}
};

Main.created = function() {
	this.clientID = uuid();
	this.orderID = uuid();
	this.connection = new WsConnection('CLIENT', this.clientID);
	EventBus.$on('order-submit', () => {
		return this.orderSubmit();
	});
	EventBus.$on('add-to-cart', (item) => {
		return this.onItemAdd(item);
	});
}

Main.methods = {
	/*
	* @param {Object}
	* Adds an item to the current order and updates the view accordingly
	*/
	onItemAdd: function (orderItem) {
		const {itemName, category} = orderItem;
		if (this.order[itemName] === undefined) {
			this.$set(this.order, itemName, {
				name: itemName, 
				quantity: 1, 
				unitPrice: menuData[category][itemName].price 
			});
		} else {
			this.order[itemName].quantity ++;
		}
	},

	/*
	* Currently sends the order to the server (in the future, the model will do that instead)
	*/
	orderSubmit: function () {
		if (Object.keys(this.order).length !== 0) {
			this.connection.send(Message('ORDER', this.clientID, this.orderID, this.order));
			this.order = {};
			this.orderID = uuid();
		} else {
			console.log('You can\'t send an empty order!');
		}
	}
};

Main.components = {
	coffeeMenu: CoffeeMenu,
	coffeeCart: Cart
};

export default Main;