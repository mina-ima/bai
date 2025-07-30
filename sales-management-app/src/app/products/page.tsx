'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
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
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === 'product_tax' || name === 'product_unitPrice' ? parseInt(value) : value,
    }));
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
      });
      fetchProducts(); // 登録後にリストを更新
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AuthenticatedLayout>
      <div style={{ padding: '20px' }}>
        <h1>商品マスタ</h1>

        <h2>新規商品登録</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '600px' }}>
          <label>商品名:<input type="text" name="product_name" value={newProduct.product_name} onChange={handleChange} required /></label>
          <label>発送先名:<input type="text" name="product_shippingName" value={newProduct.product_shippingName} onChange={handleChange} /></label>
          <label>発送先〒:<input type="text" name="product_shippingPostalcode" value={newProduct.product_shippingPostalcode} onChange={handleChange} /></label>
          <label>発送先住所:<input type="text" name="product_shippingAddress" value={newProduct.product_shippingAddress} onChange={handleChange} /></label>
          <label>発送先電話:<input type="text" name="product_shippingPhone" value={newProduct.product_shippingPhone} onChange={handleChange} /></label>
          <label>税区分:<input type="number" name="product_tax" value={newProduct.product_tax} onChange={handleChange} required /></label>
          <label>単位:<input type="text" name="product_unit" value={newProduct.product_unit} onChange={handleChange} required /></label>
          <label>単価:<input type="number" name="product_unitPrice" value={newProduct.product_unitPrice} onChange={handleChange} required /></label>
          <label style={{ gridColumn: 'span 2' }}>商品備考:<textarea name="product_note" value={newProduct.product_note} onChange={handleChange} rows={3}></textarea></label>
          <button type="submit" style={{ gridColumn: 'span 2' }}>登録</button>
        </form>

        <h2>商品一覧</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>商品ID</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>商品名</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>単価</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>単位</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>税区分</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>備考</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{product.product_id}</td>
                <td style={{ padding: '8px' }}>{product.product_name}</td>
                <td style={{ padding: '8px' }}>{product.product_unitPrice}</td>
                <td style={{ padding: '8px' }}>{product.product_unit}</td>
                <td style={{ padding: '8px' }}>{product.product_tax}</td>
                <td style={{ padding: '8px' }}>{product.product_note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthenticatedLayout>
  );
}
