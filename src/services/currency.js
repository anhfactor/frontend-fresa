import request from './request';

const currencyService = {
  getAll: (params) => request.get('dashboard/admin/currencies', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/currencies/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/currencies', data),
  update: (id, data) => request.put(`dashboard/admin/currencies/${id}`, data),
  delete: (id) => request.delete(`dashboard/admin/currencies/${id}`),
};

export default currencyService;
