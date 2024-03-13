import React, { useState } from 'react';
import { FcFolder } from 'react-icons/fc';
import { Card, Col, Row } from 'antd';
import ButtonFolder from '../gallary-button';
import { colLg } from '../card-responsive';
import { useTranslation } from 'react-i18next';
import GalleryItem from './gallery-item';

const UploadMedia = ({
  setImageList,
  imageList,
  setIsModalOpen,
  form,
  name,
}) => {
  const { t } = useTranslation();
  const [currentType, setCurrentType] = useState(null);
  const folder = [
    'languages',
    'categories',
    'shops',
    'brands',
    'products',
    'users',
  ];
  return (
    <>
      {currentType ? (
        <GalleryItem
          type={currentType}
          setCurrentType={setCurrentType}
          setImageList={setImageList}
          imageList={imageList}
          setIsModalOpen={setIsModalOpen}
          form={form}
          name={name}
        />
      ) : (
        <Card className='media-upload-gallery-container'>
          <Row gutter={[24, 24]}>
            {folder.map((item) => {
              return (
                <Col {...colLg}>
                  <Card
                    cover={<FcFolder className='icon-folder' />}
                    title={t(item)}
                    className='folder'
                    onClick={() => setCurrentType(item)}
                  >
                    <ButtonFolder />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}
    </>
  );
};

export default UploadMedia;
