import request from '../request';

const lookService = {
  getAll: (params) =>
    request.get('dashboard/seller/looks/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/looks/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/looks', data),
  update: (id, data) => request.put(`dashboard/seller/looks/${id}`, data),
  delete: (id) => request.delete(`dashboard/seller/looks/${id}`),
  setActive: (id) => request.post(`dashboard/seller/looks/active/${id}`),
};

export default lookService;
