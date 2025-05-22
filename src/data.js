export async function fetchProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    const data = await res.json();

    console.log('in fetch products');
    return data.map(item => ({
      id: item.id,
      name: item.title,
      price: item.price,
      category: item.category,
      image: item.image,
      description: item.description
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function fetchProduct(id) {
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const data = await res.json();

    //console.log(data);

    const product = {
      id: data.id,
      name: data.title,
      price: data.price,
      category: data.category,
      image: data.image,
      description: data.description
    };

    return product;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}