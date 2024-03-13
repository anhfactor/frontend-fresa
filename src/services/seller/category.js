import request from '../request';

const sellerCategory = {
  getAll: (params) => request.get('dashboard/seller/shop/category', { params }),
  delete: (id) =>
    request.delete(`dashboard/seller/shop/category`, { data: id }),
  create: (params) =>
    request.post('dashboard/seller/shop/category', params, {}),
  search: (params) =>
    request.get('dashboard/seller/shop/category/all-category', { params }),
};

export default sellerCategory;
