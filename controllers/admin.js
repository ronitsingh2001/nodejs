const { validationResult } = require('express-validator')
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',
        {
            editing: false,
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            hasError: false,
            errorMessage: null,
            validationError: []
        });
}


exports.postAddProduct = (req, res, next) => {
    // products.push({ title: req.body.title });
    const title = req.body.title;
    const imageUrl = req.file;
    const price = req.body.price;
    const description = req.body.description;

    const errors = validationResult(req);
    // console.log(imageUrl)
    if (!imageUrl) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attached file is not an image.',
            validationError: []
        });
    }

    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('admin/edit-product',
            {
                pageTitle: 'Add Product',
                path: '/admin/edit-product',
                editing: false,
                hasError: true,
                product: {
                    title: title,
                    imageUrl: imageUrl,
                    price: price,
                    description: description
                },
                validationError: errors.array(),
                errorMessage: errors.array()[0].msg,
            });

    }

    const product = new Product({
        // _id: new mongoose.Types.ObjectId('6495b0c7029671624d6ab4f6'),
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
        // userId: req.user._id
    });
    product.save()
        .then(result => {
            console.log('Product Created!')
            res.redirect('/admin/products')
        }).catch(err => {
            // return res.status(500).render('admin/edit-product',
            //     {
            //         pageTitle: 'Add Product',
            //         path: '/admin/edit-product',
            //         editing: false,
            //         hasError: true,
            //         product: {
            //             title: title,
            //             imageUrl: imageUrl,
            //             price: price,
            //             description: description
            //         },
            //         errorMessage: "Some Error Occured in the database!!",
            //         validationError: []
            //     });
            // return res.redirect('/500')
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
            // console.log(err)
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
    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product',
            {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationError: []
            });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('admin/edit-product',
            {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                hasError: true,
                product: {
                    title: updatedTitle,
                    imageUrl: updatedImageUrl,
                    price: updatedPrice,
                    description: updatedDescription,
                    _id: prodId
                },
                errorMessage: errors.array()[0].msg,
                validationError: errors.array()
            });
    }

    Product.findById(prodId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/')
        }

        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.imageUrl = updatedImageUrl;
        return product.save().then(result => {
            console.log("Product Updated")
            res.redirect('/admin/products')
        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}



exports.getAdminProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            console.log(products)
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                prods: products,
                path: '/admin/products',
            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}
// Product.fetchAll().then(([rows, fieldData]) => {
//     res.render('admin/products', {
//         pageTitle: 'Admin Products',
//         prods: rows,
//         path: '/admin/products'
//     });
// }).catch(err => {
//     console.log(err)
// })

// }

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            console.log('Product Deleted')
            res.redirect('/admin/products')
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}