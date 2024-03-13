import request from './request';

const bannerService = {
  getAll: (params) =>
    request.get('dashboard/admin/banners/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/banners/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/banners', data, {}),
  update: (id, data) => request.put(`dashboard/admin/banners/${id}`, data, {}),
  delete: (id) => request.delete(`dashboard/admin/banners`, { data: id }),
  setActive: (id) => request.post(`dashboard/admin/banners/active/${id}`),
};

export default bannerService;
