const fs = require('fs')
const path = require('path')

const p = path.join(__dirname,
    '../data',
    'cart.json')


module.exports = class Cart {
    // constructor(){
    //     this.products =[]
    //     this.totalPrice = 0;
    // }
    static addProduct(id, productPrice) {
        // fetch previous products
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            // analize cart => find existing products
            const existingProdIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProd = cart.products[existingProdIndex];
            let updatedProd;
            // add new/ increase quantity
            if (existingProd) {
                updatedProd = { ...existingProd }
                updatedProd.qty += 1;
                cart.products = [...cart.products];
                cart.products[existingProdIndex] = updatedProd;
            } else {
                updatedProd = { id: id, qty: 1 }
                cart.products = [...cart.products, updatedProd]
            }
            cart.totalPrice += +productPrice;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err)
            })
        })

    }

    static deleteProduct(id, price) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }
            const cart = JSON.parse(fileContent);
            const updatedCart = { ...cart };
            const product = updatedCart.products.find(prod => prod.id === id);
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            updatedCart.totalPrice -= productQty * price;

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                if (err)
                    console.log(err)
            })
        })
    }

}