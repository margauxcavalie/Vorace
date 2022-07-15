import fs from 'fs';

export function checkSameImages(firstPath, secPath) {
    let imageOne = fs.readFileSync(firstPath);
    let imageTwo = fs.readFileSync(secPath);
    return Buffer.compare(imageOne, imageTwo) === 0;
}

export default function step3Analysis(listProducts, listCategories)
{
    let totalValueStock = listProducts.reduce((accumulator, currentProduct) => {
        return accumulator + (currentProduct.price * currentProduct.stock);
    }, 0);

    let meanPrice = (listProducts.reduce((accumulator, currentProduct) => {
        return accumulator + currentProduct.price;
    }, 0) / listProducts.length) || 0;

    let meanPricePerCategory = {};
    for (let category of listCategories) {
        let filteredList = (listProducts.filter(product => product.category === category));
        meanPricePerCategory[category] = (filteredList.reduce((accumulator, currentProduct) => {
            return accumulator + currentProduct.price;
        }, 0) / filteredList.length) || 0;
    }

    let productsWithDuplicateImage = new Set();
    for (let i = 0; i < listProducts.length; i++) {
        for (let j = i + 1; j < listProducts.length; j++) {
            let areImagesSame = checkSameImages('./images/' + listProducts[i].image, './images/' + listProducts[j].image);
            if (areImagesSame) {
                productsWithDuplicateImage.add(listProducts[i].name);
                productsWithDuplicateImage.add(listProducts[j].name);
            }
        }
    }

    let allStats = {
        productsWithDuplicateImage: Array.from(productsWithDuplicateImage),
        meanPrice: meanPrice,
        meanPricePerCategory: meanPricePerCategory,
        totalValueOfStock: totalValueStock
    };

    // create products_analysis.json
    fs.writeFile('./results/products_analysis.json', JSON.stringify(allStats, null, 4), err => {
        if (err) {
            console.log(err.message);
        }
    });

    return;
}
