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
/*
let object = [
  {
    name: 'Haribo',
    description: 'Sachet de bonbons Haribo',
    price: 2,
    stock: 5,
    tags: [ 'haribo', 'bonbon' ],
    image: 'haribo.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Kinder Bueno',
    description: 'Des bonbons Kinder Bueno',
    price: 2,
    stock: 18,
    tags: [ 'kinder', 'bueno' ],
    image: 'kinder_bueno.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Kinder Country',
    description: 'Des bonbons Kinder Country',
    price: 2,
    stock: 11,
    tags: [ 'kinder', 'country' ],
    image: 'kinder_country.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Kinder Delice',
    description: 'Des bonbons Kinder Delice',
    price: 2,
    stock: 19,
    tags: [ 'kinder', 'delice' ],
    image: 'kinder_delice.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Kinder Maxi',
    description: 'Des bonbons Kinder Maxi',
    price: 4.1,
    stock: 4,
    tags: [ 'kinder', 'maxi' ],
    image: 'kinder_maxi.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Kinder Surprise',
    description: 'Des bonbons Kinder Surprise',
    price: 2.2,
    stock: 8,
    tags: [ 'kinder', 'surprise' ],
    image: 'kinder_surprise.png',
    category: 'Confiseries'
  },
  {
    name: 'Kitkat',
    description: 'Des gaufrettes Kitkat',
    price: 2,
    stock: 19,
    tags: [ 'kitkat', 'gaufrette' ],
    image: 'kitkat.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Mars',
    description: 'Une barre chocolatée Mars',
    price: 2,
    stock: 13,
    tags: [ 'mars', 'barre' ],
    image: 'mars.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Mars ice cream',
    description: 'Une barre chocolatée Mars goût ice cream',
    price: 2,
    stock: 18,
    tags: [ 'mars', 'ice', 'cream' ],
    image: 'mars_ice_cream.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Oreo',
    description: 'Des bonbons Oreo',
    price: 2.55,
    stock: 3,
    tags: [ 'oreo', 'bonbon' ],
    image: 'oreo.png',
    category: 'Confiseries'
  },
  {
    name: 'Le Ster',
    description: 'Des madeleines Le Ster',
    price: 2,
    stock: 16,
    tags: [ 'le ster' ],
    image: 'le_ster.jpg',
    category: 'Confiseries'
  },
  {
    name: 'Galettes bretonnes',
    description: 'Des succulentes galettes bretonnes',
    price: 3,
    stock: 14,
    tags: [ 'galette', 'bretonne' ],
    image: 'galettes_bretonnes.jpg',
    category: 'Encas'
  },
  {
    name: 'Banzai Noodle Poulet',
    description: 'Des bons poulets frits avec une sauce banzai',
    price: 5,
    stock: 11,
    tags: [ 'poulet', 'frit', 'banzai' ],
    image: 'banzai_noodle_poulet.jpg',
    category: 'Encas'
  },
  {
    name: "Lay's barbecue",
    description: "Des incroyables chips Lay's saveur barbecue",
    price: 2,
    stock: 19,
    tags: [ 'lays', 'barbecue' ],
    image: 'lays_barbecue.jpg',
    category: 'Encas'
  },
  {
    name: "Lay's bolognaise",
    description: "Des incroyables chips Lay's saveur bolognaise",
    price: 2,
    stock: 6,
    tags: [ 'lays', 'bolognaise' ],
    image: 'lays_bolognaise.jpg',
    category: 'Encas'
  },
  {
    name: "Lay's nature",
    description: "Des incroyables chips Lay's saveur nature",
    price: 2.21,
    stock: 13,
    tags: [ 'lays', 'nature' ],
    image: 'lays_nature.png',
    category: 'Encas'
  },
  {
    name: "Lay's poulet rôti",
    description: "Des incroyables chips Lay's saveur poulet rôti",
    price: 2,
    stock: 18,
    tags: [ 'lays', 'poulet', 'roti' ],
    image: 'lays_poulet_roti.jpg',
    category: 'Encas'
  },
  {
    name: "Lay's sel vinaigre",
    description: "Des incroyables chips Lay's saveur sel vinaigre",
    price: 2.22,
    stock: 0,
    tags: [ 'lays', 'sel', 'vinaigre' ],
    image: 'lays_sel_vinaigre.jpg',
    category: 'Encas'
  },
  {
    name: 'Mr Freeze',
    description: 'Sucettes à glacer Mr Freeze',
    price: 2.54,
    stock: 18,
    tags: [ 'mr', 'freeze' ],
    image: 'mr_freeze.jpg',
    category: 'Encas'
  },
  {
    name: 'Pom-Potes',
    description: 'Des compotes Pom-Potes',
    price: 17,
    stock: 19,
    tags: [ 'pom', 'potes' ],
    image: 'pom_potes.png',
    category: 'Encas'
  },
  {
    name: '7 Up',
    description: 'Une canette 7 Up de 33cl',
    price: 2,
    stock: 1,
    tags: [ '7', 'up' ],
    image: '7_up.jpg',
    category: 'Boissons'
  },
  {
    name: '7 Up Mojito',
    description: 'Une canette 7 Up de 33cl saveur mojito',
    price: 2,
    stock: 2,
    tags: [ '7', 'up', 'mojito' ],
    image: '7_up_mojito.jpg',
    category: 'Boissons'
  },
  {
    name: 'Coca-Cola Cherry',
    description: 'Une canette Coca-Cola de 33cl saveur cherry',
    price: 2,
    stock: 11,
    tags: [ 'coca', 'cola', 'cherry' ],
    image: 'coca_cola_cherry.jpg',
    category: 'Boissons'
  },
  {
    name: 'Coca-Cola Zero',
    description: 'Une canette Coca-Cola de 33cl sans sucres',
    price: 2,
    stock: 19,
    tags: [ 'coca', 'cola', 'zero' ],
    image: 'coca_cola_zero.jpg',
    category: 'Boissons'
  },
  {
    name: 'Coca-Cola',
    description: 'Une canette Coca-Cola de 33cl',
    price: 2,
    stock: 8,
    tags: [ 'coca', 'cola' ],
    image: 'coca_cola.png',
    category: 'Boissons'
  },
  {
    name: 'Dr Pepper',
    description: 'Une canette Dr Pepper de 33cl',
    price: 1.25,
    stock: 0,
    tags: [ 'dr', 'pepper' ],
    image: 'dr_pepper.jpg',
    category: 'Boissons'
  },
  {
    name: 'Fanta Orange',
    description: 'Une canette Fanta de 33cl saveur orange',
    price: 1.22,
    stock: 0,
    tags: [ 'fanta', 'orange' ],
    image: 'fanta_orange.jpg',
    category: 'Boissons'
  },
  {
    name: 'Fanta Exotic',
    description: 'Une canette Fanta Exotic de 33cl',
    price: 1.9,
    stock: 2,
    tags: [ 'fanta', 'exotic' ],
    image: 'fanta_exotic.png',
    category: 'Boissons'
  },
  {
    name: 'Fanta Dragon Fruit',
    description: 'Une canette Fanta de 33cl saveur fruit du dragon',
    price: 1.7,
    stock: 3,
    tags: [ 'fanta', 'dragon', 'fruit' ],
    image: 'fanta_dragon_fruit.jpg',
    category: 'Boissons'
  },
  {
    name: 'Lipton Lemon',
    description: 'Une canette Lipton de 33cl saveur citron',
    price: 1.4,
    stock: 1,
    tags: [ 'lipton', 'lemon' ],
    image: 'lipton_lemon.jpg',
    category: 'Boissons'
  },
  {
    name: 'Lipton Raspberry',
    description: 'Une canette Lipton de 33cl saveur framboise',
    price: 1.2,
    stock: 2,
    tags: [ 'lipton', 'raspberry' ],
    image: 'lipton_raspberry.jpg',
    category: 'Boissons'
  },
  {
    name: 'Lipton Citron Vert Menthe',
    description: 'Une canette Lipton de 33cl saveur citron vert et menthe',
    price: 1.2,
    stock: 3,
    tags: [ 'lipton', 'citron', 'vert', 'menthe' ],
    image: 'lipton_citron_vert_menthe.jpg',
    category: 'Boissons'
  },
  {
    name: 'Minute Maid',
    description: 'Une canette Minute Maid de 33cl',
    price: 2.2,
    stock: 9,
    tags: [ 'minute', 'maid' ],
    image: 'minute_maid.jpg',
    category: 'Boissons'
  },
  {
    name: 'Monster',
    description: 'Une canette Monster de 33cl',
    price: 2.1,
    stock: 7,
    tags: [ 'monster' ],
    image: 'monster.jpg',
    category: 'Boissons'
  },
  {
    name: 'Monster Mango Loco',
    description: 'Une canette Monster de 33cl goût mangue et loco',
    price: 2.3,
    stock: 11,
    tags: [ 'monster', 'mango', 'loco' ],
    image: 'monster_mango_loco.jpg',
    category: 'Boissons'
  },
  {
    name: 'Oasis Pomme Poire',
    description: 'Une canette Oasis de 33cl goût pomme et poire',
    price: 2.1,
    stock: 12,
    tags: [ 'oasis', 'pomme', 'poire' ],
    image: 'oasis_pomme_poire.jpg',
    category: 'Boissons'
  },
  {
    name: 'Oasis',
    description: 'Une canette Oasis de 33cl',
    price: 2.5,
    stock: 17,
    tags: [ 'oasis' ],
    image: 'oasis.jpg',
    category: 'Boissons'
  },
  {
    name: 'Red Bull',
    description: 'Une canette Red Bull de 33cl',
    price: 2.7,
    stock: 10,
    tags: [ 'red', 'bull' ],
    image: 'red_bull.jpg',
    category: 'Boissons'
  }
];

step3Analysis(object, ['Confiseries', 'Encas', 'Boissons']);*/