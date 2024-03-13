import request from './request';

const extraService = {
  getAllGroups: (params) =>
    request.get('dashboard/admin/extra/groups', { params }),
  getGroupById: (id, params) =>
    request.get(`dashboard/admin/extra/groups/${id}`, { params }),
  getGroupTypes: (params) =>
    request.get('dashboard/admin/extra/groups/types', { params }),
  createGroup: (data) => request.post('dashboard/admin/extra/groups', data),
  updateGroup: (id, data) =>
    request.put(`dashboard/admin/extra/groups/${id}`, data),
  deleteGroup: (id) => request.delete(`dashboard/admin/extra/groups/${id}`),

  getAllValues: (params) =>
    request.get('dashboard/admin/extra/values', { params }),
  getValueById: (id, params) =>
    request.get(`dashboard/admin/extra/values/${id}`, { params }),
  createValue: (params) =>
    request.post('dashboard/admin/extra/values', {}, { params }),
  updateValue: (id, params) =>
    request.put(`dashboard/admin/extra/values/${id}`, {}, { params }),
  deleteValue: (id) => request.delete(`dashboard/admin/extra/values/${id}`),
};

export default extraService;
