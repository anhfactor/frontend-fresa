import request from './request';

const userService = {
  getAll: (params) => request.get('dashboard/admin/users/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/users/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/users', data),
  update: (id, data) => request.put(`dashboard/admin/users/${id}`, data),
  delete: (data) => request.post(`dashboard/admin/users/delete/all`, data),
  deleteOfficial: (id) => request.delete(`dashboard/admin/users/${id}`),
  search: (params) => request.get(`dashboard/admin/users/search`, { params }),
  updateRole: (id, params) =>
    request.post(`dashboard/admin/users/${id}/role/update`, {}, { params }),
  setActive: (id, params) =>
    request.post(`dashboard/admin/users/${id}/active`, {}, { params }),
  createAddress: (uuid, data) =>
    request.post(`dashboard/admin/users/${uuid}/addresses`, data),
  topupWallet: (uuid, data) =>
    request.post(`dashboard/admin/users/${uuid}/wallets`, data),
  walletHistory: (uuid, params) =>
    request.get(`dashboard/admin/users/${uuid}/wallets/history`, { params }),
  profileShow: (params) =>
    request.get('dashboard/user/profile/show', { params }),
  profileUpdate: (data) => request.put('dashboard/user/profile/update', data),
  getRoles: (params) => request.get('dashboard/admin/roles', { params }),
  updatePassword: (uuid, data) =>
    request.put(`dashboard/admin/users/${uuid}/password`, data),
};

export default userService;
