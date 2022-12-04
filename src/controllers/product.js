const { conn } = require('../db');
const { Product, Category, Brand } = require('../db');
const { insertIntoString } = require('../utils');
const jsonProducts = require("../json/all.json");

const populateProducts = async () => {
  for (p of jsonProducts) {
    const category = await Category.findOne({ where: { name: p.category } });
    const brand = await Brand.findOne({ where: { name: p.brand } });
    prod = await Product.create({ title: p?.title, img: p?.img, price: p?.price, description: p?.model, stock: Math.floor(Math.random() * 500), categoryId: category?.dataValues?.id, brandId: brand?.dataValues?.id })
  }
}

const allProductsDB = async () => {
  return await Product.findAll({
    include: [
      {
        model: Category,
        attributes: ['name']
      },
      {
        model: Brand,
        attributes: ['name']
      },
    ]
  });
}

const getAllProducts = async (req, res, next) => {

  const { name } = req.query;
  const products = await allProductsDB();
  try {
    if (name) {
      let productName = await products.filter(e => e.title.toLowerCase().includes(name.toLowerCase()));
      (productName.length > 0 ? res.json(productName) : res.status(404).json({ message: 'Product not found' }))
    } else {
      products.length > 0 ? res.json(products) : res.status(404).json({ message: 'No products' })
    };
  } catch (error) {
    next(error);
  }
  next();
}

const getProductById = async (req, res) => {

  const { id } = req.params;
  const products = await allProductsDB()
  try {
    products.forEach(el => {
      if (el.id == id) {
        res.json({
          id: el.id,
          title: el.title,
          img: el.img || el.img.forEach(i => { return i }),
          price: el.price,
          description: el.description,
          stock: el.stock,
          category: el.category.name,
          brand: el.brand.name
        })
      }
    })
  } catch (error) {
    res.status(404).send(error);
  }
}

const getFilteredProducts = async (req, res) => {

  const { category, brand } = req.query;
  let { min_price, max_price } = req.query;

  let sqlQuery = 'SELECT p.id, p.title, p.img, p.price, p.description, p.stock FROM products AS p WHERE p.price <> -1';

  if (category) {
    sqlQuery = insertIntoString(sqlQuery, ', c.name AS category', 'FROM');
    sqlQuery = insertIntoString(sqlQuery, 'JOIN categories AS c ON p."categoryId" = c.id', 'WHERE');
    sqlQuery += ` AND c.id = ${category}`;
  }

  if (brand) {
    sqlQuery = insertIntoString(sqlQuery, ', b.name AS brand', 'FROM');
    sqlQuery = insertIntoString(sqlQuery, 'JOIN brand AS b ON p."brandId" = b.id', 'WHERE');
    sqlQuery += ` AND b.id = ${brand}`;
  }

  if (min_price || max_price) {
    if (!min_price) {
      min_price = 0
    };
    if (!max_price) {
      max_price = 100000000
    };

    sqlQuery += ` AND p.price BETWEEN ${min_price} AND ${max_price}`;
  }

  try {
    const products = await conn.query(sqlQuery, {
      model: Product,
      mapToModel: true
    });
    res.status(200).send(products);
  } catch (error) {
    res.status(404).send("No products found");
  }

}

const postProducts = async () => {
  const { name, brand, stock, price, description, img, category } = req.body;
  try {
    const findBrand = await Brand.findOne({
      where: {
        name: brand,
      }
    })
    const findCategory = await Category.findOne({
      where: {
        name: category,
      }
    })
    await Product.create({
      title: name,
      img,
      price,
      description,
      stock,
      categoryId: findCategory.dataValues.id,
      brandId: findBrand.dataValues.id,
    },
    )
    res.send('Product created successfully')
  } catch (error) {
    res.status(404).json({ "error": error.message })
  }
}

module.exports = { populateProducts, getAllProducts, getProductById, getFilteredProducts, postProducts };