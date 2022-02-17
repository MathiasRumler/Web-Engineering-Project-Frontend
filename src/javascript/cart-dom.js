import {calculatePrice} from "./frame.js";

export class CartItemContainer {
    constructor(containerID = 'cart') {
        this.container = document.getElementById(containerID);
        if (!this.container) {
            throw `Error when trying to create RecipeDocumentContainer: ` +
            `ID '${containerID}' does not exist`;
        }
    }

    clear() {
        this.container.innerHTML = '';
    }

    addCartItemToDocument(cartItem, picture) {
        const total = document.getElementById('cart-total');
        this.container.insertBefore(createCartItemElements(cartItem, picture), total);

        function createCartItemElements(cartItem, picture) {
            const item = document.createElement('div');
            item.className = 'cart-item';
            item.appendChild(createPreviewContainer());
            item.appendChild(createLabelContainer());
            return item;

            function createPreviewContainer() {
                const preview = document.createElement('div');
                preview.className = 'cart-preview';
                preview.setAttribute('id', cartItem.objectID);
                const a = document.createElement('a');
                a.setAttribute('href', `framing.html?objectID=${cartItem.objectID}&printSize=${cartItem.printSize}&frameStyle=${cartItem.frameStyle}&frameWidth=${cartItem.frameWidth}` + (cartItem.matWidth > 0 ? `&matColor=${cartItem.matColor}&matWidth=${cartItem.matWidth}` : ''));
                const image = document.createElement('img');
                image.className = 'cart-thumb';
                if (picture.primaryImageSmall !== undefined) {
                    image.setAttribute('src', picture.primaryImageSmall);
                } else {
                    image.setAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/6/6c/No_image_3x4.svg');
                }
                image.setAttribute('alt', picture.title);
                /*
                TODO show preview of framed artwork using frame.render
                 */
                image.setAttribute('onload', /*`console.log(document.getElementById(\'${cartItem.objectID}\'))`);*/
                    `render(document.getElementById(\'${cartItem.objectID}\'), document.getElementById(\'${cartItem.objectID}\').children.item(0).children.item(0), \"${cartItem.printSize}\", \"${cartItem.frameStyle}\", ${cartItem.frameWidth}, \"${cartItem.matColor}\", ${cartItem.matWidth});`);
                //console.log(image.getAttribute('onload'));
                a.appendChild(image);
                preview.appendChild(a);
                return preview;
            }

            function createLabelContainer() {
                const label = document.createElement('div');
                label.className = 'museum-label';
                const div = document.createElement('div');
                const artist = document.createElement('span');
                artist.className = 'artist';
                if (picture.artistDisplayName === "" || picture.artistDisplayName === undefined) {
                    artist.innerText = 'Unknown';
                } else {
                    artist.innerText = picture.artistDisplayName;
                }
                const title = document.createElement('span');
                title.className = 'title';
                title.innerText = picture.title + ', ';
                const date = document.createElement('span');
                date.className = 'date';
                date.innerText = picture.objectDate;
                const br = document.createElement('br');
                const frameDescription = document.createElement('span');
                frameDescription.className = 'frame-description';
                let size;
                switch (cartItem.printSize) {
                    case 'S':
                        size = 'Small';
                        break;
                    case 'M':
                        size = 'Medium';
                        break;
                    case 'L':
                        size = 'Large';
                        break;
                    default:
                        size = '[Invalid size]';
                }
                frameDescription.innerText = `${size} print in a ${cartItem.frameWidth / 10} cm ${cartItem.frameStyle} frame`
                    + (cartItem.matWidth > 0 ? ` with a ${cartItem.matWidth / 10} cm ${cartItem.matColor} mat.` : '');
                const price = document.createElement('div');
                price.className = 'price';
                price.innerText = '€ ' + (calculatePrice(cartItem.printSize, cartItem.frameStyle,
                        cartItem.frameWidth, cartItem.matWidth) / 100).toFixed(2);
                const cartRemove = document.createElement('button');
                cartRemove.setAttribute('type', 'button');
                cartRemove.className = 'cart-remove';
                cartRemove.setAttribute('aria-label', 'Remove')

                div.append(artist, title, date, br, br.cloneNode(), frameDescription);
                label.appendChild(div);
                label.appendChild(price);
                label.appendChild(cartRemove);
                return label;
            }
        }
    }
}
