import request from '../request';

const branchService = {
  getAll: (params) => request.get('dashboard/seller/branch', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/branch/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/branch', data, {}),
  update: (id, data) => request.put(`dashboard/seller/branch/${id}`, data, {}),
  delete: (id) => request.delete(`dashboard/seller/branch`, { data: id }),
};

export default branchService;
