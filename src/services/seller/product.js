import request from '../request';

const productService = {
  getAll: (params) => request.get('dashboard/seller/shop/product', { params }),
  selectProduct: (params) =>
    request.get('dashboard/seller/shop/product/select-paginate', { params }),
  export: () => request.get('dashboard/seller/shop/product/export'),
  import: (data) =>
    request.post('dashboard/seller/shop/product/import', data, {}),
  getByUuid: (uuid, params) =>
    request.get(`dashboard/seller/shop/product/getById/${uuid}`, { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/shop/product/${id}`, { params }),
  create: (data) => request.post(`dashboard/seller/shop/product`, data, {}),
  newCreate: (data) => request.post(`dashboard/seller/products`, data, {}),
  update: (id, data) =>
    request.put(`dashboard/seller/shop/product/${id}`, data, {}),
  delete: (uuid) =>
    request.delete(`dashboard/seller/shop/product`, { data: uuid }),
  deleteAll: (ids) =>
    request.delete(`dashboard/seller/shop/product`, { data: ids }),
  extras: (uuid, data) =>
    request.post(`dashboard/seller/products/${uuid}/extras`, data),
  stocks: (uuid, data) =>
    request.post(`dashboard/seller/products/${uuid}/stocks`, data),
  properties: (uuid, data) =>
    request.post(`dashboard/seller/products/${uuid}/properties`, data),
  setActive: (uuid) =>
    request.post(`dashboard/seller/products/${uuid}/active`, {}),
  search: (params) =>
    request.get('dashboard/seller/shop/product/all-product', { params }),
};

export default productService;
