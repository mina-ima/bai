'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';

interface EditableProduct extends Product {
  isEditing?: boolean;
}

export default function ProductsPage() {
  const [originalProducts, setOriginalProducts] = useState<EditableProduct[]>([]);
  const [products, setProducts] = useState<EditableProduct[]>([]); // 表示用の商品リスト（ソート・フィルタリング後）
  const [sortColumn, setSortColumn] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<{[key: string]: string}>({});

  const handleSort = (column: keyof Product) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(column);

    const sortedProducts = [...products].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });
    setProducts(sortedProducts);
  };
  const [customers, setCustomers] = useState<Customer[]>([]); // 取引先リスト
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'product_id'>>({
    product_name: '',
    product_shippingName: '',
    product_shippingPostalcode: '',
    product_shippingAddress: '',
    product_shippingPhone: '',
    product_tax: 0,
    product_unit: '',
    product_unitPrice: 0,
    product_note: '',
    customer_name: '',
  });
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
      setOriginalProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (column: keyof Product, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [column]: value,
    }));
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (e: any) {
      console.error('Error fetching customers:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    let currentProducts = [...originalProducts];

    // Filtering
    currentProducts = currentProducts.filter(product => {
      return Object.entries(filters).every(([column, filterValue]) => {
        const productValue = String(product[column as keyof Product]).toLowerCase();
        return productValue.includes(filterValue.toLowerCase());
      });
    });

    // Sorting
    if (sortColumn) {
      currentProducts.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
          return 0;
        }
      });
    }
    setProducts(currentProducts);
  }, [originalProducts, sortColumn, sortDirection, filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === 'product_tax' || name === 'product_unitPrice' ? parseFloat(value) : value,
    }));
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewProduct((prev) => ({ ...prev, customer_name: value }));
    if (value.length > 0) {
      const filtered = customers.filter(customer =>
        customer.customer_name.toLowerCase().includes(value.toLowerCase())
      ).sort((a, b) => a.customer_name.localeCompare(b.customer_name));
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  };

  const handleCustomerSelect = (customerName: string) => {
    setNewProduct((prev) => ({ ...prev, customer_name: customerName }));
    setShowCustomerSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewProduct({
        product_name: '',
        product_shippingName: '',
        product_shippingPostalcode: '',
        product_shippingAddress: '',
        product_shippingPhone: '',
        product_tax: 0,
        product_unit: '',
        product_unitPrice: 0,
        product_note: '',
        customer_name: '',
      });
      fetchProducts();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('この商品を削除してもよろしいですか？')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchProducts();
      } catch (e: any) {
        setError(e.message);
      }
    }
  };

  const handleEdit = (productId: string) => {
    setProducts(products.map(product =>
      product.product_id === productId ? { ...product, isEditing: true } : product
    ));
  };

  const handleSave = async (productToSave: Product & { isEditing?: boolean }) => {
    try {
      const response = await fetch(`/api/products/${productToSave.product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productToSave),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setProducts(products.map(product =>
        product.product_id === productToSave.product_id ? { ...productToSave, isEditing: false } : product
      ));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCancel = (productId: string) => {
    setProducts(products.map(product =>
      product.product_id === productId ? { ...product, isEditing: false } : product
    ));
    fetchProducts();
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center">商品登録</h1>
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="bg-white shadow-md rounded-lg p-8 mb-8">
          {/* Row 1: Customer & Product Name */}
          <div className="mb-2 flex flex-wrap gap-4 relative">
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="customer_name">
                取引先名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_name"
                type="text"
                name="customer_name"
                value={newProduct.customer_name}
                onChange={handleCustomerNameChange}
                onFocus={() => setShowCustomerSuggestions(true)}
                onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 100)}
                autoComplete="off"
                required
              />
              {showCustomerSuggestions && filteredCustomers.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto rounded-md shadow-lg">
                  {filteredCustomers.map((customer) => (
                    <li
                      key={customer.customer_id}
                      onMouseDown={() => handleCustomerSelect(customer.customer_name)}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                    >
                      {customer.customer_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="product_name">
                商品名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_name"
                type="text"
                name="product_name"
                value={newProduct.product_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Postal Code & Shipping Name */}
          <div className="mb-2 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="product_shippingPostalcode">
                発送先〒：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_shippingPostalcode"
                type="text"
                name="product_shippingPostalcode"
                value={newProduct.product_shippingPostalcode}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="product_shippingName">
                発送先名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_shippingName"
                type="text"
                name="product_shippingName"
                value={newProduct.product_shippingName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Shipping Address (Full Width) */}
          <div className="mb-2 flex flex-wrap items-center gap-4">
            <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_shippingAddress">
              発送先住所：
            </label>
            <input
              className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              id="product_shippingAddress"
              type="text"
              name="product_shippingAddress"
              value={newProduct.product_shippingAddress}
              onChange={handleChange}
            />
          </div>

          {/* Row 4: Phone, Unit, Price, Tax */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Shipping Phone */}
            <div className="flex-1">
              <label htmlFor="product_shippingPhone" className="block text-gray-700 text-size-20 font-medium mb-2">
                発送先電話：
              </label>
              <input
                id="product_shippingPhone"
                type="text"
                name="product_shippingPhone"
                value={newProduct.product_shippingPhone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>

            {/* Unit */}
            <div className="flex-1">
              <label htmlFor="product_unit" className="block text-gray-700 text-size-20 font-medium mb-2">
                単位：
              </label>
              <input
                id="product_unit"
                type="text"
                name="product_unit"
                value={newProduct.product_unit}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>

            {/* Unit Price */}
            <div className="flex-1">
              <label htmlFor="product_unitPrice" className="block text-gray-700 text-size-20 font-medium mb-2">
                単価：
              </label>
              <input
                id="product_unitPrice"
                type="number"
                step="any"
                name="product_unitPrice"
                value={newProduct.product_unitPrice}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>

            {/* Tax */}
            <div className="flex-1">
              <label htmlFor="product_tax" className="block text-gray-700 text-size-20 font-medium mb-2">
                税区分：
              </label>
              <input
                id="product_tax"
                type="number"
                name="product_tax"
                value={newProduct.product_tax}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>
          </div>

          {/* Row 5: Notes (Full Width) */}
          <div className="mb-2 flex flex-wrap items-center gap-4">
            <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_note">
              商品備考：
            </label>
            <textarea
              className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              id="product_note"
              name="product_note"
              value={newProduct.product_note}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex items-center justify-center">
            <button
              className="w-full py-4 px-8 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 text-2xl"
              type="submit"
            >
              登録
            </button>
          </div>
        </form>

        <h2 className="text-size-30 font-bold text-center mt-[50px]">商品リスト</h2>
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600">
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('customer_name')}>
                    取引先名
                    {sortColumn === 'customer_name' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_name')}>
                    商品名
                    {sortColumn === 'product_name' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_unitPrice')}>
                    単価
                    {sortColumn === 'product_unitPrice' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_unit')}>
                    単位
                    {sortColumn === 'product_unit' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_tax')}>
                    税
                    {sortColumn === 'product_tax' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_shippingName')}>
                    発送先名
                    {sortColumn === 'product_shippingName' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_shippingPostalcode')}>
                    発送先〒
                    {sortColumn === 'product_shippingPostalcode' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_shippingAddress')}>
                    発送先住所
                    {sortColumn === 'product_shippingAddress' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_shippingPhone')}>
                    発送先電話
                    {sortColumn === 'product_shippingPhone' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_note')}>
                    備考
                    {sortColumn === 'product_note' && (
                      <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">編集</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">削除</th>
                </tr>
                <tr className="bg-blue-500">
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.customer_name || ''}
                      onChange={(e) => handleFilterChange('customer_name', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_name || ''}
                      onChange={(e) => handleFilterChange('product_name', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_unitPrice || ''}
                      onChange={(e) => handleFilterChange('product_unitPrice', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_unit || ''}
                      onChange={(e) => handleFilterChange('product_unit', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_tax || ''}
                      onChange={(e) => handleFilterChange('product_tax', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_shippingName || ''}
                      onChange={(e) => handleFilterChange('product_shippingName', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_shippingPostalcode || ''}
                      onChange={(e) => handleFilterChange('product_shippingPostalcode', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_shippingAddress || ''}
                      onChange={(e) => handleFilterChange('product_shippingAddress', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_shippingPhone || ''}
                      onChange={(e) => handleFilterChange('product_shippingPhone', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300">
                    <input
                      type="text"
                      placeholder="絞り込み"
                      value={filters.product_note || ''}
                      onChange={(e) => handleFilterChange('product_note', e.target.value)}
                      className="mt-1 p-1 w-full text-black rounded text-xs"
                    />
                  </th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300"></th>
                  <th className="py-1 px-4 text-white text-xs border border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} className="even:bg-gray-100">
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.customer_name}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, customer_name: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.customer_name
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_name}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_name: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_name
                      )}
                    </td>
                    <td className="py-1 px-4 text-right border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={product.product_unitPrice}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_unitPrice: parseFloat(e.target.value) } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_unitPrice
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_unit}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_unit: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_unit
                      )}
                    </td>
                    <td className="py-1 px-4 text-right border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="number"
                          value={product.product_tax}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_tax: parseInt(e.target.value) } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_tax
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingName}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingName: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingName
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingPostalcode}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingPostalcode: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingPostalcode
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingAddress}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingAddress: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingAddress
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingPhone}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingPhone: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingPhone
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <textarea
                          value={product.product_note}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_note: e.target.value } : p))}
                          className="w-full p-1 border rounded h-auto"
                          rows={3}
                        />
                      ) : (
                        product.product_note
                      )}
                    </td>
                    <td className="py-1 px-4 text-center border border-gray-300 text-sm">
                      {product.isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(product)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mr-1"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => handleCancel(product.product_id)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(product.product_id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          編集
                        </button>
                      )}
                    </td>
                    <td className="py-1 px-4 text-center border border-gray-300 text-sm">
                      {!product.isEditing && (
                        <button
                          onClick={() => handleDelete(product.product_id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          削除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
