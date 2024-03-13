import request from './request';

const deliveryTypeService = {
  get: (params) => request.get('dashboard/admin/deliveries', { params }),
  getAll: (params) =>
    request.get('dashboard/admin/deliveries/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/deliveries/${id}`, { params }),
  create: (params) =>
    request.post('dashboard/admin/deliveries', {}, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/deliveries/${id}`, {}, { params }),
  getTypes: (params) =>
    request.get(`dashboard/admin/delivery/types`, { params }),
};

export default deliveryTypeService;
