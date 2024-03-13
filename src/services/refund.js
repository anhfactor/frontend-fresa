import request from './request';

const refundService = {
  getAll: (params) => request.get('dashboard/admin/refund', { params }),
  getList: (params) => request.get('dashboard/user/refund', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/refund/${id}`, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/refund/${id}`, {}, { params }),
  delete: (params) =>
    request.delete(`dashboard/admin/refund/delete`, { params }),
  dropAll: () => request.get(`dashboard/admin/refund/drop/all`),
  restoreAll: () => request.get(`dashboard/admin/refund/restore/all`),
};

export default refundService;
