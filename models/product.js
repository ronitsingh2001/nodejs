const fs = require('fs');
const path = require('path')

const Cart = require('./cart')

const p = path.join(__dirname,
    '../data',
    'products.json'
);

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return cb([])
        }
        cb(JSON.parse(fileContent))
    })
}

module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProdIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProd = [...products];
                updatedProd[existingProdIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProd), err => {
                    console.log(err)
                })
            } else {

                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    if (err)
                        console.log(err)
                })
            }
        })
    }

    static fetchAll(cb) {
        getProductsFromFile(cb)
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        })
    }

    static deleteProductById(id) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === id);
            let updatedProds = products.filter(p => p.id !== id);
            console.log(updatedProds)
            if (updatedProds === []) {
                fs.writeFile(p, [], err => {
                    if (err)
                        console.log(err)
                })
            } else {

                fs.writeFile(p, JSON.stringify(updatedProds), err => {
                    if (!err)
                        Cart.deleteProduct(id, product.price)
                    else
                        console.log(err)
                })
            }
        })
    }
}