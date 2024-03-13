import request from '../request';

const extraService = {
  getAllGroups: (params) =>
    request.get('dashboard/seller/extras/groups', { params }),
  getGroupById: (id, params) =>
    request.get(`dashboard/seller/extras/groups/${id}`, { params }),

  getValueByGroupId: (id, params) =>
    request.get(`dashboard/seller/extras/group/${id}/values`, { params }),
  getValueById: (id, params) =>
    request.get(`dashboard/seller/extras/values/${id}`, { params }),
};

export default extraService;
