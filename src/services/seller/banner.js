import request from '../request';

const bannerService = {
  getAll: (params) => request.get('dashboard/seller/banner', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/banner/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/banner', data, {}),
  update: (id, data) => request.put(`dashboard/seller/banner/${id}`, data, {}),
  delete: (id) => request.delete(`dashboard/seller/banner`, { data: id }),
  setActive: (id) => request.post(`dashboard/seller/banner/active/${id}`),
};

export default bannerService;
