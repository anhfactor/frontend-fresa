import request from './request';

const galleryService = {
  getAll: (params) =>
    request.get('dashboard/galleries/storage/files', { params }),
  upload: (data) => request.post('dashboard/galleries', data),
  delete: (data) =>
    request.post('dashboard/galleries/storage/files/delete', data),
};

export default galleryService;
