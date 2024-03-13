import request from '../request';

const warehouseService = {
  getAll: (params) => request.get('dashboard/seller/warehouse', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/warehouse/${id}`, { params }),
  delete: (uuid) => request.delete(`dashboard/seller/warehouse/${uuid}`),
  create: (data) => request.post('dashboard/seller/warehouse', data),
};

export default warehouseService;
