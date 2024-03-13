import request from './request';

const emailService = {
  get: (params) => request.get(`dashboard/admin/email-settings`, { params }),
  setActive: (id, params) =>
    request.get(`dashboard/admin/email-settings/set-active/${id}`, { params }),
};

export default emailService;
