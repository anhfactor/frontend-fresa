import request from '../request';

const discountService = {
  getAll: (params) =>
    request.get('dashboard/seller/discounts/paginate', { params }),
  getById: (id) => request.get(`dashboard/seller/discounts/${id}`),
  create: (data) => request.post('dashboard/seller/discounts', data),
  update: (id, data) => request.put(`dashboard/seller/discounts/${id}`, data),
  delete: (id) => request.delete(`dashboard/seller/discounts`, { data: id }),
  setActive: (id) =>
    request.post(`dashboard/seller/discounts/${id}/active/status`),
};

export default discountService;
