import request from './request';

const couponService = {
  getAll: (params) =>
    request.get('dashboard/seller/coupons/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/coupons/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/coupons', data),
  update: (id, data) => request.put(`dashboard/seller/coupons/${id}`, data),
  delete: (id) => request.delete(`dashboard/seller/coupons`, { data: id }),
};

export default couponService;
