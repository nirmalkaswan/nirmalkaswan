import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  
  const [addFormData, setAddFormData] = useState({
    name: '',
    price: '',
    colors: '',
    category: '',
    description:'',
    photos: [],
  });
  const [addPreviewUrls, setAddPreviewUrls] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    colors: '',
    category: '',
     description:'',
    photos: [],
  });
  const [editPreviewUrls, setEditPreviewUrls] = useState([]);

  
  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched products:', data);
        setProducts(data);
      })
      .catch((err) => console.error('Fetch error:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
    console.log('addPreviewUrls:', addPreviewUrls);
    console.log('editPreviewUrls:', editPreviewUrls);
    products.forEach((product) => {
      console.log(`Product ${product._id} photos:`, product.photos);
    });
  }, [addPreviewUrls, editPreviewUrls, products]);

  useEffect(() => {
    return () => {
      addPreviewUrls.forEach((item) => URL.revokeObjectURL(item.url));
      editPreviewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [addPreviewUrls, editPreviewUrls]);

  
  const handleAddChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photos') {
      const filesArray = Array.from(files);
      setAddFormData((prev) => ({ ...prev, photos: filesArray }));
      const urls = filesArray.map((file) => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
      }));
      setAddPreviewUrls(urls);
    } else {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', addFormData.name);
    data.append('price', addFormData.price);
    data.append('colors', addFormData.colors);
    data.append('category', addFormData.category);
    data.append('description',addFormData.description)
    addFormData.photos.forEach((photo) => {
      data.append('photos', photo);
    });

    fetch(`${API_BASE_URL}/api/products/add-product`, {
      method: 'POST',
      body: data,
    })
      .then((res) => {
        if (res.ok) {
          alert('Product added successfully!');
          console.log("sss",addFormData)
          setAddFormData({
            name: '',
            price: '',
            colors: '',
            category: '',
            description:'',
            photos: [],
          });
          setAddPreviewUrls([]);
          fetchProducts();
        } else {
          return res.json().then((err) => {
            throw new Error(err.message || 'Failed to add product');
          });
        }
      })
      .catch((err) => {
        console.error('Add product error:', err);
        alert(`Failed to add product: ${err.message}`);
      });
  };

const handleAddToSale = (product) => {
  fetch(`${API_BASE_URL}/api/products/add-sale`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ _id: product._id }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('Product marked as on sale:', data);
   
    })
    .catch((err) => console.error('Error:', err));

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setEditFormData({
      name: product.name,
       description:product.description,
      price: product.price,
      colors: product.colors.join(', '),
      category: product.category,
      photos: [],
    });
    setEditPreviewUrls(
      product.photos.map((p) => ({
        id: uuidv4(),
        url: `${API_BASE_URL}/${p.startsWith('/') ? p.slice(1) : p}`,
      }))
    );
  };


  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photos') {
      const filesArray = Array.from(files);
      setEditFormData((prev) => ({ ...prev, photos: filesArray }));
      const urls = filesArray.map((file) => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
      }));
      setEditPreviewUrls(urls);
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProductId) return;

    const data = new FormData();
    data.append('name', editFormData.name);
    data.append('description',editFormData.description)
    data.append('price', editFormData.price);
    data.append('colors', editFormData.colors);
    data.append('category', editFormData.category);
    editFormData.photos.forEach((photo) => {
      data.append('photos', photo);
    });

    fetch(`${API_BASE_URL}/api/products/${editingProductId}`, {
      method: 'PUT',
      body: data,
    })
      .then((res) => {
        if (res.ok) {
          alert('Product updated!');
          setEditingProductId(null);
          setEditFormData({
            name: '',
            price: '',
            colors: '',
            category: '',
             description:'',
            photos: [],
          });
          setEditPreviewUrls([]);
          fetchProducts();
        } else {
          return res.json().then((err) => {
            throw new Error(err.message || 'Failed to update product');
          });
        }
      })
      .catch((err) => {
        console.error('Edit product error:', err);
        alert(`Failed to update product: ${err.message}`);
      });
  };


  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditFormData({
      name: '',
      price: '',
       description:'',
      colors: '',
      category: '',
      photos: [],
    });
    setEditPreviewUrls([]);
  };

  
  const handleRemove = (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          fetchProducts();
        } else {
          return res.json().then((err) => {
            throw new Error(err.message || 'Failed to delete product');
          });
        }
      })
      .catch((err) => {
        console.error('Delete product error:', err);
        alert(`Failed to delete product: ${err.message}`);
      });
  };};
  const handleremoveToSale = (product) => {
  fetch(`${API_BASE_URL}/api/products/remove-sale`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ _id: product._id }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('Product marked as off on  sale:', data);
     
    })
    .catch((err) => console.error('Error:', err));
};


  return (

    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add New Product</h1>

      <form
        onSubmit={handleAddSubmit}
        encType="multipart/form-data"
        className="bg-white p-6 rounded-xl shadow-lg mb-12"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
            <input
              type="text"
              name="name"
              value={addFormData.name}
              onChange={handleAddChange}
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price
            <input
              type="number"
              name="price"
              value={addFormData.price}
              onChange={handleAddChange}
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colors (comma-separated)
            <input
              type="text"
              name="colors"
              value={addFormData.colors}
              onChange={handleAddChange}
              placeholder="e.g. Red, Blue, White"
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
            <select
              name="category"
              value={addFormData.category}
              onChange={handleAddChange}
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">Select a Category</option>
              <option value="AC Comforters">AC Comforters</option>
              <option value="Bed in a Bag">Bed in a Bag</option>
              <option value="Premium Collections">Premium Collections</option>
              <option value="Luxury Collections">Luxury Collections</option>
              <option value="Essential Collection">Essential Collection</option>
            </select>
          </label>
        </div> <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: 8,
              color: '#444',
            }}
          >
            Dscription
            <textarea
              name="description"
              value={addFormData.description}
              onChange={handleAddChange}
              required
              style={{
                width: '100%',
                padding: 12,
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                outline: 'none',
                background: '#fff',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4a90e2')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            >
            </textarea>
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (multiple)
            <div
              className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition"
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.currentTarget.classList.remove('border-blue-500')}
              onDrop={(e) => e.currentTarget.classList.remove('border-blue-500')}
            >
              <input
                type="file"
                name="photos"
                multiple
                accept="image/*"
                onChange={handleAddChange}
                required
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="text-gray-500 cursor-pointer"
              >
                Drag and drop images here or click to upload
              </label>
            </div>
          </label>
          <div className="flex flex-wrap gap-4 mt-4">
            {addPreviewUrls.length === 0 && (
              <p className="text-gray-500 text-sm">No images selected</p>
            )}
            {addPreviewUrls.map((item) => (
              <div
                key={item.id}
                className="w-24 h-24 rounded-lg overflow-hidden shadow-md"
              >
                <img
                  src={item.url}
                  alt={`preview-${item.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image: ${item.url}`);
                    e.target.src = 'https://via.placeholder.com/100?text=Image+Not+Found';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
        >
          Add Product
        </button>
      </form>


      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 30, color: '#1a1a1a' }}>
        Product List
      </h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
         {products.map((product) => (

          <li
            key={product._id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            {editingProductId === product._id ? (
              <form
                onSubmit={handleEditSubmit}
                encType="multipart/form-data"
                className="bg-white p-6 rounded-xl shadow-inner"
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      required
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </label>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      required
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </label>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colors (comma-separated)
                    <input
                      type="text"
                      name="colors"
                      value={editFormData.colors}
                      onChange={handleEditChange}
                      required
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </label>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                    <select
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      required
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Select a Category</option>
                      <option value="AC Comforters">AC Comforters</option>
                      <option value="Bed in a Bag">Bed in a Bag</option>
                      <option value="Premium Collections">Premium Collections</option>
                      <option value="Luxury Collections">Luxury Collections</option>
                      <option value="Essential Collection">Essential Collection</option>
                    </select>
                  </label>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (optional to replace)
                    <div
                      className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition"
                      onDragOver={(e) => e.preventDefault()}
                      onDragLeave={(e) => e.currentTarget.classList.remove('border-blue-500')}
                      onDrop={(e) => e.currentTarget.classList.remove('border-blue-500')}
                    >
                      <input
                        type="file"
                        name="photos"
                        multiple
                        accept="image/*"
                        onChange={handleEditChange}
                        className="hidden"
                        id="edit-photo-upload"
                      />
                      <label
                        htmlFor="edit-photo-upload"
                        className="text-gray-500 cursor-pointer"
                      >
                        Drag and drop images here or click to upload
                      </label>
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {editPreviewUrls.length === 0 && (
                      <p className="text-gray-500 text-sm">No images selected</p>
                    )}
                    {editPreviewUrls.map((item) => (
                      <div
                        key={item.id}
                        className="w-24 h-24 rounded-lg overflow-hidden shadow-md"
                      >
                        <img
                          src={item.url}
                          alt={`edit-preview-${item.id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image: ${item.url}`);
                            e.target.src = 'https://via.placeholder.com/100?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{product.name}</h2>
                <p className="text-gray-600">Price: ${product.price}</p>
                <p className="text-gray-600">Colors: {product.colors.join(', ')}</p>
                <p className="text-gray-600">Category: {product.category}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  {product.photos.length === 0 && (
                    <p className="text-gray-500 text-sm">No images available</p>
                  )}
                  {product.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Product ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-md hover:scale-105 transition"
                      onError={(e) => {
                        console.error(`Failed to load image: ${photo}`);
                        e.target.src = 'https://via.placeholder.com/100?text=Image+Not+Found';
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition"

                  >
                    Remove
                  </button>
                  <button
                    onClick={() =>handleAddToSale(product)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      background: 'green',
                      color: 'black',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.3s ease, transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = '#d00000')}
                    onMouseLeave={(e) => (e.target.style.background = '#e63946')}
                    onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
                    onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}

                  >
                   Add to sale
                  </button>
                 
  <button
    onClick={() => handleremoveToSale(product)}
    style={{
      padding: '8px 16px',
      fontSize: '1rem',
      fontWeight: 500,
      background: 'green',
      color: 'black',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      transition: 'background 0.3s ease, transform 0.2s ease',
    }}
    onMouseEnter={(e) => (e.target.style.background = '#d00000')}
    onMouseLeave={(e) => (e.target.style.background = '#e63946')}
    onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
    onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
  >
    Remove from Sale
  </button>


                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductManager;
