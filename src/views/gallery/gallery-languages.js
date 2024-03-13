import React, { useContext, useEffect, useState } from 'react';
import { Card, Col, Image, Row, Pagination } from 'antd';
import '../../assets/scss/components/gallery-languages.scss';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { FcOpenedFolder } from 'react-icons/fc';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import galleryService from '../../services/gallery';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../components/loading';
import DeleteButton from '../../components/delete-button';

const GalleryLanguages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [skipPage, setSkipPage] = useState(0);

  const imageDelete = () => {
    setLoadingBtn(true);
    const payload = { file: id };
    galleryService
      .delete(payload)
      .then(() => {
        toast.success(t('successfully.deleted'));
        fetchGallery();
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const fetchGallery = () => {
    const params = {
      type,
      length: pageSize,
      skip: skipPage,
    };
    setLoading(true);
    galleryService
      .getAll(params)
      .then((res) => {
        setLanguages(res.data);
        setTotal(res.meta?.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGallery();
  }, [page, pageSize, skipPage]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    const skip = (current - 1) * pageSize;
    setPageSize(pageSize);
    setPage(current);
    setSkipPage(skip);
  };
  return (
    <div className='gallery-item'>
      <Card
        title={
          <div className='d-flex align-items-center'>
            <span className='mr-3' onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </span>
            <FcOpenedFolder style={{ fontSize: '25px' }} />
            <span className='ml-2'>{t('gallery')}</span>
          </div>
        }
      >
        {!loading ? (
          <>
            <Row gutter={[24, 24]} className='mt-2'>
              {Array.isArray(languages) &&
                languages?.map((item, index) => (
                  <Col key={index}>
                    <Card
                      className={`${
                        item.isset ? 'card-noActive' : 'card-active'
                      } card-image`}
                    >
                      <Image
                        src={item.path}
                        className='images'
                        alt={'images'}
                      />
                      {!item.isset && (
                        <DeleteButton
                          type='primary'
                          danger
                          shape='circle'
                          className='icon-center-delete'
                          icon={<DeleteOutlined />}
                          size={'small'}
                          onClick={() => {
                            setId(item.path);
                            setIsModalVisible(true);
                          }}
                        />
                      )}
                    </Card>
                  </Col>
                ))}
            </Row>
            <div className='d-flex justify-content-end'>
              <Pagination
                total={total}
                pageSize={pageSize}
                current={page}
                onChange={onChangePagination}
              />
            </div>
          </>
        ) : (
          <Loading />
        )}
        <CustomModal
          click={imageDelete}
          text={t('delete.image')}
          loading={loadingBtn}
        />
      </Card>
    </div>
  );
};

export default GalleryLanguages;
