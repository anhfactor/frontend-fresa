import request from '../request';

const brandService = {
  getAll: (params) => request.get('dashboard/seller/shop/brand', { params }),
  create: (data) => request.post('dashboard/seller/shop/brand', data, {}),
  delete: (id) => request.delete(`dashboard/seller/shop/brand`, { data: id }),
  update: (data) => request.put('dashboard/seller/shop/brand/update', data, {}),
  search: (params) =>
    request.get('dashboard/seller/shop/brand/all-brand', { params }),
};

export default brandService;
