type Variant = {
  value: string
  options: string[]
}

type SKU = {
  value: string
  price: number
  stock: number
  image: string
}

type Data = {
  product: {
    publishedAt: string | null // ISO date string
    name: string
    basePrice: number
    virtualPrice: number
    brandId: number
    images: string[]
    variants: Variant[]
    categories: number[]
  }
  skus: SKU[]
}

const data: Data = {
  product: {
    publishedAt: new Date().toISOString(),
    name: 'Sample product',
    basePrice: 100000,
    virtualPrice: 100000,
    brandId: 1,
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
    categories: [1, 2, 3],
    variants: [
      {
        value: 'Color',
        options: ['Red', 'White', 'Green', 'Black'],
      },
      {
        value: 'Size',
        options: ['S', 'M', 'L', 'XL'],
      },
      {
        value: 'Material',
        options: ['Cotton', 'Polyester', 'Linen'],
      },
    ],
  },

  skus: [
    {
      value: 'Black-S-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-S-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-S-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-M-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-M-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-M-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-L-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-L-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-L-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-XL-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-XL-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Black-XL-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-S-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-S-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-S-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-M-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-M-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-M-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-L-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-L-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-L-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-XL-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-XL-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'White-XL-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-S-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-S-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-S-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-M-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-M-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-M-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-L-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-L-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-L-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-XL-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-XL-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Green-XL-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-S-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-S-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-S-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-M-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-M-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-M-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-L-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-L-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-L-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-XL-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-XL-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'Red-XL-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
  ],
}

function generateSKUs(variants: Variant[]): SKU[] {
  // function to create all combinations
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), [''])
  }

  // Ger arrays of option from variants
  const options = variants.map((variant) => variant.options)

  // CReate all combinations
  const combinations = getCombinations(options)

  // Convert all combinations to SKUS object
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: '',
  }))
}

// EXAMPLE of INPUT

const variants: Variant[] = [
  {
    value: 'Color',
    options: ['Black', 'White', 'Blue', 'Red'],
  },
  {
    value: 'Size',
    options: ['S', 'M', 'L', 'XL'],
  },
]

// Test function
const skus = generateSKUs(variants)
console.log(JSON.stringify(skus))
