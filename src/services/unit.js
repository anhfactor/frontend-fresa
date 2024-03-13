import request from './request';

const unitService = {
  getAll: (params) => request.get('dashboard/admin/units/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/units/${id}`, { params }),
  create: (params) => request.post('dashboard/admin/units', {}, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/units/${id}`, {}, { params }),
  delete: (id) => request.delete(`dashboard/admin/units/${id}`),
  setActive: (id) => request.post(`dashboard/admin/units/active/${id}`, {}),
};

export default unitService;
