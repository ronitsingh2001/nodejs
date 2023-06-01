// ***************When working with sequelize *************
const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Product;




// ********* When working with Database system directly**********
// const db = require('../utils/database')
// module.exports = class Product {
//     constructor(id, title, imageUrl, price, description) {
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//     }

//     save() {
//         return db.execute("INSERT INTO products (title, price, imageUrl, description) VALUES (?,?,?,?)",
//             [this.title, this.price, this.imageUrl, this.description]
//         );
//     }

//     static fetchAll() {
//         return db.execute('SELECT * FROM products')
//     }

//     static findById(id) {
//         return db.execute('SELECT * FROM products where id=?', [id]);
//     }

//     static deleteProductById(id) {
//         return db.execute("DELETE FROM `node`.`products` WHERE (`id` = '" + id + "')")
//     }
// }



// ********* When working with file system**********
// const fs = require('fs');
// const path = require('path')

// const Cart = require('./cart')

// const p = path.join(__dirname,
//     '../data',
//     'products.json'
// );

// const getProductsFromFile = cb => {
//     fs.readFile(p, (err, fileContent) => {
//         if (err) {
//             return cb([])
//         }
//         cb(JSON.parse(fileContent))
//     })
// }

// module.exports = class Product {
//     constructor(id, title, imageUrl, price, description) {
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//     }

//     save() {
//         getProductsFromFile(products => {
//             if (this.id) {
//                 const existingProdIndex = products.findIndex(prod => prod.id === this.id);
//                 const updatedProd = [...products];
//                 updatedProd[existingProdIndex] = this;
//                 fs.writeFile(p, JSON.stringify(updatedProd), err => {
//                     console.log("error", err)

//                 })
//             } else {

//                 this.id = Math.random().toString();
//                 products.push(this);
//                 fs.writeFile(p, JSON.stringify(products), err => {
//                     console.log("error", err)

//                 })
//             }
//         })
//     }

//     static fetchAll(cb) {
//         getProductsFromFile(cb)
//     }

//     static findById(id, cb) {
//         getProductsFromFile(products => {
//             const product = products.find(p => p.id === id);
//             cb(product);
//         })
//     }

//     static deleteProductById(id) {
//         getProductsFromFile(products => {
//             const product = products.find(prod => prod.id === id);
//             const updatedProds = products.filter(p => p.id !== id);
//             fs.writeFile(p, JSON.stringify(updatedProds), err => {
//                 if (!err)
//                     Cart.deleteProduct(id, product?.price)
//                 else
//                     console.log("error", err)
//             })

//         })
//     }
// }