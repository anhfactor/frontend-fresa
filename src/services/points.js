import request from './request';

const pointService = {
  getAll: (params) => request.get('dashboard/admin/points', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/points/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/points', data),
  update: (id, data) => request.put(`dashboard/admin/points/${id}`, data),
  delete: (id) => request.delete(`dashboard/admin/points`, { data: id }),
  setActive: (id) => request.post(`dashboard/admin/points/${id}/active`),
};

export default pointService;
