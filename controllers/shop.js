const Product = require('../models/product')


exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    }).catch(err => {
        console.log(err)
    });
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findByPk(prodId).then(product => {
        // console.log(rows)
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        })
    }).catch(err => {
        console.log(err)
    })
    // res.redirect('/');
}

exports.getIndex = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    }).catch(err => {
        console.log(err)
    });
    // Product.fetchAll().then(([rows, fieldData]) => {
    //     // console.log(fieldData)
    //     res.render('shop/index', {
    //         prods: rows,
    //         pageTitle: 'Shop',
    //         path: '/'
    //     });

    // }).catch(err => { console.log(err) });
}

exports.getCart = (req, res, next) => {
    req.user.getCart().then(cart => {
        if (cart)
            return cart.getProducts()
        return []
    }).then(products => {
        res.render('shop/cart',
            {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            })
    })
        .catch(err => {
            console.log(err)
        })
    // Cart.getCart(cart => {
    //     Product.fetchAll(products => {
    //         const cartProduct = []
    //         for (prod of products) {
    //             const prodData = cart.products.find(p => p.id === prod.id);
    //             if (prodData) {
    //                 cartProduct.push({ productData: prod, quantity: prodData.qty });
    //             }
    //         }
    //         res.render('shop/cart',
    //             {
    //                 path: '/cart',
    //                 pageTitle: 'Your Cart',
    //                 products: cartProduct
    //             })
    //     })
    // })
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity += oldQuantity;
                return product;
            }
            return Product.findByPk(prodId)
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity }
            })
        })
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders({ include: ['products'] })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'orders',
                orders: orders
            })
        })
        .catch(err => console.log(err))
}

exports.postOrders = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts()
        }).then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    order.addProduct(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product;
                    })
                    )
                })
                .catch(err => console.log(err))
        }).then(result => {
            return fetchedCart.setProducts(null);
        }).then(result => {
            res.redirect('/orders')
        })
        .catch(err => console.log(err))
}
exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout',
        {
            pageTitle: 'Checkout',
            path: '/checkout'
        })
}

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.id;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy()
        })
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => console.log(err));
}