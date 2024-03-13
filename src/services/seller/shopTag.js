import request from '../request';

const shopTagService = {
  getAll: (params) => request.get('dashboard/seller/shop-tags', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/shop-tags/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/shop-tags', data, {}),
  update: (id, data) =>
    request.put(`dashboard/seller/shop-tags/${id}`, data, {}),
  delete: (params) =>
    request.delete(`dashboard/seller/shop-tags/delete`, { params }),
  dropAll: () => request.get(`dashboard/seller/shop-tags/drop/all`),
  restoreAll: () => request.get(`dashboard/seller/shop-tags/restore/all`),
};

export default shopTagService;
