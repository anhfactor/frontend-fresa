import request from '../request';

const refundService = {
  getAll: (params) => request.get('dashboard/seller/refund', { params }),
  getList: (params) => request.get('dashboard/user/refund', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/refund/${id}`, { params }),
  update: (id, data) => request.put(`dashboard/seller/refund/${id}`, data),
  delete: (params) =>
    request.delete(`dashboard/seller/refund/delete`, { params }),
};

export default refundService;
