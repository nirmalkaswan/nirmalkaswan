import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
    fetch('http://localhost:5000/api/products')
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
    data.append('description',addFormData.description)
    addFormData.photos.forEach((photo) => {
      data.append('photos', photo);
    });


    fetch('http://localhost:5000/api/products/add-product', {
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
  fetch('http://localhost:5000/api/products/add-sale', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ _id: product._id }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('Product marked as on sale:', data);
      // Optionally update state or show toast
    })
    .catch((err) => console.error('Error:', err));
};

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
        url: `http://localhost:5000/${p.startsWith('/') ? p.slice(1) : p}`,
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
    data.append('description',editFormData.description)
    data.append('price', editFormData.price);
    data.append('colors', editFormData.colors);
    data.append('category', editFormData.category);
    editFormData.photos.forEach((photo) => {
      data.append('photos', photo);
    });

    fetch(`http://localhost:5000/api/products/${editingProductId}`, {
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

    fetch(`http://localhost:5000/api/products/${id}`, {
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
    <div style={{ maxWidth: 900, margin: '30px auto', fontFamily: "'Inter', sans-serif", color: '#333' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 30, color: '#1a1a1a' }}>
        Add New Product
      </h1>
      
      <form
        onSubmit={handleAddSubmit}
        encType="multipart/form-data"
        style={{
          background: '#fff',
          padding: 30,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: 40,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: 8,
              color: '#444',
            }}
          >
            Product Name
            <input
              type="text"
              name="name"
              value={addFormData.name}
              onChange={handleAddChange}
              required
              style={{
                width: '100%',
                padding: 12,
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                outline: 'none',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4a90e2')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </label>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: 8,
              color: '#444',
            }}
          >
            Price
            <input
              type="number"
              name="price"
              value={addFormData.price}
              onChange={handleAddChange}
              required
              style={{
                width: '100%',
                padding: 12,
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                outline: 'none',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4a90e2')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </label>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: 8,
              color: '#444',
            }}
          >
            Colors (comma-separated)
            <input
              type="text"
              name="colors"
              value={addFormData.colors}
              onChange={handleAddChange}
              placeholder="e.g. Red, Blue, White"
              required
              style={{
                width: '100%',
                padding: 12,
                fontSize: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                outline: 'none',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4a90e2')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </label>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: 8,
              color: '#444',
            }}
          >
            Category
            <select
              name="category"
              value={addFormData.category}
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

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: 8,
              color: '#444',
            }}
          >
            Photos (multiple)
            <div
              style={{
                border: '2px dashed #e0e0e0',
                borderRadius: 8,
                padding: 20,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease',
                background: '#f9fafb',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#4a90e2';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <input
                type="file"
                name="photos"
                multiple
                accept="image/*"
                onChange={handleAddChange}
                required
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                Drag and drop images here or click to upload
              </label>
            </div>
          </label>
          <div style={{ display: 'flex', gap: 12, marginTop: 15, flexWrap: 'wrap' }}>
            {addPreviewUrls.length === 0 && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>No images selected</p>
            )}
            {addPreviewUrls.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <img
                  src={item.url}
                  alt={`preview-${item.id}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 500,
            background: '#4a90e2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background 0.3s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.target.style.background = '#357abd')}
          onMouseLeave={(e) => (e.target.style.background = '#4a90e2')}
          onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
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
         
            style={{
              border: '1px solid #e0e0e0',
              marginBottom: 20,
              borderRadius: 8,
              padding: 15,
              background: '#fff',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            {editingProductId === product._id ? (
              <form
                onSubmit={handleEditSubmit}
                encType="multipart/form-data"
                style={{
                  background: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: 500,
                      marginBottom: 8,
                      color: '#444',
                    }}
                  >
                    Product Name
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      required
                      style={{
                        width: '100%',
                        padding: 12,
                        fontSize: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        outline: 'none',
                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#4a90e2')}
                      onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: 500,
                      marginBottom: 8,
                      color: '#444',
                    }}
                  >
                    Price
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      required
                      style={{
                        width: '100%',
                        padding: 12,
                        fontSize: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        outline: 'none',
                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#4a90e2')}
                      onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: 500,
                      marginBottom: 8,
                      color: '#444',
                    }}
                  >
                    Colors (comma-separated)
                    <input
                      type="text"
                      name="colors"
                      value={editFormData.colors}
                      onChange={handleEditChange}
                      required
                      style={{
                        width: '100%',
                        padding: 12,
                        fontSize: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        outline: 'none',
                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#4a90e2')}
                      onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: 500,
                      marginBottom: 8,
                      color: '#444',
                    }}
                  >
                    Category
                    <select
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
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
                      <option value="">Select a Category</option>
                      <option value="AC Comforters">AC Comforters</option>
                      <option value="Bed in a Bag">Bed in a Bag</option>
                      <option value="Premium Collections">Premium Collections</option>
                      <option value="Luxury Collections">Luxury Collections</option>
                      <option value="Essential Collection">Essential Collection</option>
                    </select>
                  </label>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: 500,
                      marginBottom: 8,
                      color: '#444',
                    }}
                  >
                    Photos (optional to replace)
                    <div
                      style={{
                        border: '2px dashed #e0e0e0',
                        borderRadius: 8,
                        padding: 20,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.3s ease',
                        background: '#f9fafb',
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#4a90e2';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }}
                    >
                      <input
                        type="file"
                        name="photos"
                        multiple
                        accept="image/*"
                        onChange={handleEditChange}
                        style={{ display: 'none' }}
                        id="edit-photo-upload"
                      />
                      <label
                        htmlFor="edit-photo-upload"
                        style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          color: '#666',
                          cursor: 'pointer',
                        }}
                      >
                        Drag and drop images here or click to upload
                      </label>
                    </div>
                  </label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 15, flexWrap: 'wrap' }}>
                    {editPreviewUrls.length === 0 && (
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>No images selected</p>
                    )}
                    {editPreviewUrls.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                          borderRadius: 8,
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <img
                          src={item.url}
                          alt={`edit-preview-${item.id}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  style={{
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    background: '#4a90e2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    marginRight: 10,
                    transition: 'background 0.3s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = '#357abd')}
                  onMouseLeave={(e) => (e.target.style.background = '#4a90e2')}
                  onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
                  onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.3s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = '#d0d0d0')}
                  onMouseLeave={(e) => (e.target.style.background = '#e0e0e0')}
                  onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
                  onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 10px' }}>
                  {product.name}
                </h2>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0 0 10px' }}>
                  {product.description} hi
                </h2>
             <h1>
  {new Date(product.createAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</h1>

                <p>Price: ${product.price}</p>
                <p>Colors: {product.colors.join(', ')}</p>
                <p>Category: {product.category}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                  {product.photos.length === 0 && (
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>No images available</p>
                  )}
                {product.photos.map((photo, index) => (
  <img
    key={index}
    src={photo} 
    alt={`Product ${index + 1}`}
    className="w-full h-80 object-cover rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
    loading="lazy"
    onError={(e) => { e.target.style.display = 'none'; }}
  />
))}

                </div>
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => handleEditClick(product)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      background: '#4a90e2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      marginRight: 10,
                      transition: 'background 0.3s ease, transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = '#357abd')}
                    onMouseLeave={(e) => (e.target.style.background = '#4a90e2')}
                    onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
                    onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      background: '#e63946',
                      color: '#fff',
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