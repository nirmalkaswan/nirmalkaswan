import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define API base URL using environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [addFormData, setAddFormData] = useState({
    name: '',
    price: '',
    colors: '',
    category: '',
    photos: [],
  });
  const [addPreviewUrls, setAddPreviewUrls] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    colors: '',
    category: '',
    photos: [],
  });
  const [editPreviewUrls, setEditPreviewUrls] = useState([]);

  // Fetch products from the server
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

  // Debug preview URLs and product photos
  useEffect(() => {
    console.log('addPreviewUrls:', addPreviewUrls);
    console.log('editPreviewUrls:', editPreviewUrls);
    products.forEach((product) => {
      console.log(`Product ${product._id} photos:`, product.photos);
    });
  }, [addPreviewUrls, editPreviewUrls, products]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      addPreviewUrls.forEach((item) => URL.revokeObjectURL(item.url));
      editPreviewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [addPreviewUrls, editPreviewUrls]);

  // Handle input changes for adding a product
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

  // Handle form submission for adding a product
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', addFormData.name);
    data.append('price', addFormData.price);
    data.append('colors', addFormData.colors);
    data.append('category', addFormData.category);
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
          setAddFormData({
            name: '',
            price: '',
            colors: '',
            category: '',
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

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setEditFormData({
      name: product.name,
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

  // Handle input changes for editing a product
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

  // Handle form submission for editing a product
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProductId) return;

    const data = new FormData();
    data.append('name', editFormData.name);
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

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditFormData({
      name: '',
      price: '',
      colors: '',
      category: '',
      photos: [],
    });
    setEditPreviewUrls([]);
  };

  // Handle product deletion
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

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Product List</h1>
      <ul className="space-y-6">
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