import {CartPictureModel} from "./CartPictureModel.js";
import {CartItemContainer} from "./cart-dom.js";
import {PictureModel} from "./PictureModel.js";

export function updateNumberNextToCart() {
    const cart = retrieveCart();
    if (cart == null) {
        return
    }
    if (cart.length > 0) {
        const cartLink = document.getElementById('cart-link')
        const number = cartLink.innerText.match(/\(\d+\)/);
        if (number != null) {
            cartLink.innerText = cartLink.innerText.replace(/\(\d+\)/, `(${cart.length})`);
        } else {
            cartLink.innerText += ` (${cart.length})`;
        }
    }
}

export async function createCartElements(cartItems) {
    if (!(cartItems instanceof Array)) {
        throw 'Error: \'cartItems\' is expected to be of type \'Array\'';
    }
    let cart = new CartItemContainer();
    let cache = retrieveCartCache();
    const origCache = cache;
    for (const cartItem of cartItems) {
        let picture = null;
        if (cache != null) {
            picture = cache.find(item => {
                return item.objectID === cartItem.objectID;
            });
        }
        if (picture == null) /*check if undefined implied*/ {
            const picture = await retrieveFromApi(cartItem.objectID);
            cart.addCartItemToDocument(cartItem, picture);
            cache = cache == null ? [] : cache;
            cache.push(picture);
        } else {
            cart.addCartItemToDocument(cartItem, picture);
        }
    }
    if (cache !== origCache) {
        localStorage.setItem('cartCache', JSON.stringify(cache));
    }
    return cart.container;
}

async function retrieveFromApi(id) {
    const url = api_url(id);
    try {
        const response = await fetch(url);
        let resp = new PictureModel();
        if (response.ok) {
            resp = await response.json();
        }
        return resp;
    } catch (error) {
        console.log(`An error occurred when trying to retrieve data from URL ${url}`);
        console.log(error);
    }
}

function api_url(id) {
    return `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
}

function retrieveCartCache() {
    console.log(`Retrieving cart cache from local storage`);
    let cache = JSON.parse(localStorage.getItem('cartCache'));
    if (cache == null) {
        console.log(`No items in cart cache`);
        return null;
    }
    if (!(cache instanceof Array)) {
        cache = [cache];
    }
    return cache;
}

export function removeCartItemById(id) {
    const cart = retrieveCart();
    let picture = cart.find(item => {
        return item.objectID === id;
    });
    if (picture !== undefined) {
        const newCart = cart.filter(item => {
            return item.objectID !== picture.objectID;
        });
        localStorage.setItem('cart', JSON.stringify(newCart));
        return picture;
    } else {
        console.log(`Object with id ${id} not present in cart`);
        return null;
    }
}

export function retrieveCart() {
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart == null) {
        console.log(`No items in cart`);
        return null;
    }
    console.log(`Retrieved ${cart.length} cart items from local storage`);
    if (!(cart instanceof Array)) {
    }

    return cart;
}

export function storeInCart(picture) {
    if (!(picture instanceof CartPictureModel)) {
        console.log(`Picture must be of type 'CartPictureModel' to be stored in cart`);
        return;
    }
    let cart = retrieveCart();
    if (cart == null) {
        cart = [picture];
    } else {
        cart.unshift(picture);
    }
    console.log(`Storing picture with id ${picture.objectID} in local storage`);
    localStorage.setItem('cart', JSON.stringify(cart));
}