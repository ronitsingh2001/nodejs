const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',
        {
            editing: false,
            pageTitle: 'Add Product',
            path: '/admin/add-product'
        });
}


exports.postAddProduct = (req, res, next) => {
    // products.push({ title: req.body.title });
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    // console.log(req.user)
    req.user.createProduct({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
    })

    // Product.create({
    //     title: title,
    //     imageUrl: imageUrl,
    //     price: price,
    //     description: description,
    //     // userId: req.user.id
    // })
    .then(result => {
        console.log('Product Created!')
        res.redirect('/admin/products')
    }).catch(err => {
        console.log(err)
    })

    // ************When using file system or mysql directly ****** 
    // const product = new Product(null, title, imageUrl, price, description);
    // product.save().then(() => {
    //     res.redirect('/');
    // }).catch(err => {
    //     console.log(err)
    // })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findByPk(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product',
            {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
    }).catch(err => {
        console.log(err)
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    Product.findByPk(prodId).then(product => {
        product.title = updatedTitle;
        product.imageUrl = updatedImageUrl;
        product.price = updatedPrice;
        product.description = updatedDescription;
        return product.save()
    }).then(result => {
        console.log("Product Updated")
        res.redirect('/admin/products')
    }).catch(err => {
        console.log(err)
    })
}



exports.getAdminProducts = (req, res, next) => {
    // Product.findAll().
    req.user.getProducts().
    then(products => {
        res.render('admin/products', {
            pageTitle: 'Admin Products',
            prods: products,
            path: '/admin/products'
        });
    }).catch(err => {
        console.log(err)
    });
    // Product.fetchAll().then(([rows, fieldData]) => {
    //     res.render('admin/products', {
    //         pageTitle: 'Admin Products',
    //         prods: rows,
    //         path: '/admin/products'
    //     });
    // }).catch(err => {
    //     console.log(err)
    // })

}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByPk(prodId).then(product => {
        return product.destroy()
    }).then(result => {
        console.log('Product Deleted')
        res.redirect('/admin/products')
    }).catch(err => {
        console.log(err)
    })
}