const fs = require('fs');
const path = require('path');

const Product = require('../models/product')
const Order = require('../models/order')


exports.getProducts = (req, res, next) => {
    Product.find().then(products => {
        // console.log(products)
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        });
    }).catch(err => {
        console.log(err)
    });
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then(product => {
        // console.log(product)
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            csrfToken: req.csrfToken()

        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })

}

exports.getCart = (req, res, next) => {
    req.user.populate({ path: 'cart.items.productId' })
        .then(products => {
            res.render('shop/cart',
                {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: products.cart.items,
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product)
        }).then(result => {
            res.redirect('/cart')
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your orders',
                orders: orders,
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postOrders = (req, res, next) => {
    req.user.populate({ path: 'cart.items.productId' })
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } }
            })
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user._id
                },
                products: products
            })
            return order.save()
        })
        .then(() => {
            req.user.clearCart();
        }).then(() => {
            console.log('Order Created!')
            res.redirect('/orders')
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoice', invoiceName)
    fs.readFile(invoicePath, (err, data) => {
        if (err) {
            next()
        }
        res.send(data)
    })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout',
        {
            pageTitle: 'Checkout',
            path: '/checkout',
        })
}

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.id;
    req.user.deleteItemFromCart(productId)
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}
