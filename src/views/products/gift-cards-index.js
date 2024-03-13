import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from '../../services/product';
import { replaceMenu, setMenuData } from '../../redux/slices/menu';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import getTranslationFields from '../../helpers/getTranslationFields';
import MediaUpload from '../../components/upload';

const GiftCardsIndex = ({ next, action_type = '' }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
    const { defaultLang, languages } = useSelector(
        (state) => state.formLang,
        shallowEqual
    );
    const [fileList, setFileList] = useState(activeMenu.data?.images || []);
    const [loadingBtn, setLoadingBtn] = useState(false);

    useEffect(() => {
        return () => {
            const data = form.getFieldsValue(true);
            dispatch(
                setMenuData({ activeMenu, data: { ...activeMenu.data, ...data } })
            );
        };
    }, []);

    const onFinish = (values) => {
        setLoadingBtn(true);
        const params = {
            title: getTranslationFields(languages, values, 'title'),
            description: getTranslationFields(languages, values, 'description'),
            keywords: values.keywords,
            qr_code: values.qr_code,
            images: [...fileList.flatMap((item) => item.name)],
            gift: 1
        };
        if (action_type === 'edit') {
            productUpdate(values, params);
        } else {
            productCreate(values, params);
        }
    };

    function productCreate(values, params) {
        productService
            .create(params)
            .then(({ data }) => {
                dispatch(
                    replaceMenu({
                        id: `gift-card-${data.uuid}`,
                        url: `gift-card/${data.uuid}`,
                        name: t('add.gift.card'),
                        data: { ...values, id: data.id },
                        refetch: false,
                    }),
                    setMenuData({ activeMenu, data: { id: data.id } })
                );
                navigate(`/gift-card/${data.uuid}?step=1`);
            })
            .catch((err) => setError(err.response.data.params))
            .finally(() => setLoadingBtn(false));
    }

    function productUpdate(values, params) {
        const id = activeMenu.data.id;
        productService
            .update(id, params)
            .then(({ data }) => {
                dispatch(
                    setMenuData({
                        activeMenu,
                        data: values,
                    })
                );
                next();
            })
            .catch((err) => setError(err.response.data.params))
            .finally(() => setLoadingBtn(false));
    }
    return (
        <Form
            layout='vertical'
            form={form}
            initialValues={{ active: true, ...activeMenu.data }}
            onFinish={onFinish}
        >
            <Row gutter={12}>
                <Col span={12}>
                    {languages.map((item) => (
                        <Form.Item
                            key={'name' + item.id}
                            label={t('name')}
                            name={`title[${item.locale}]`}
                            rules={[
                                {
                                    required: item.locale === defaultLang,
                                    message: t('required'),
                                },
                            ]}
                            hidden={item.locale !== defaultLang}
                        >
                            <Input />
                        </Form.Item>
                    ))}
                </Col>
                <Col span={12}>
                    {languages.map((item) => (
                        <Form.Item
                            key={'description' + item.id}
                            label={t('description')}
                            name={`description[${item.locale}]`}
                            rules={[
                                {
                                    required: item.locale === defaultLang,
                                    message: t('required'),
                                },
                            ]}
                            hidden={item.locale !== defaultLang}
                        >
                            <TextArea rows={3} />
                        </Form.Item>
                    ))}
                </Col>
                <Col span={12}>
                    <Form.Item
                        label={t('qr.code')}
                        name='qr_code'
                        rules={[
                            {
                                required: true,
                                message: t('required'),
                                error: 'error',
                            },
                        ]}
                        help={error?.qr_code ? error.qr_code[0] : null}
                        validateStatus={error?.qr_code ? 'error' : 'success'}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label={t('keywords')}
                        name='keywords'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label={t('images')}
                        name='images'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <MediaUpload
                            type='products'
                            GiftCardsIndex                     imageList={fileList}
                            setImageList={setFileList}
                            form={form}
                        />
                        {/* <ImageGallery
              type='products'
              fileList={fileList}
              setFileList={setFileList}
              form={form}
            /> */}
                    </Form.Item>
                </Col>
            </Row>

            <Button type='primary' htmlType='submit' loading={loadingBtn}>
                {t('next')}
            </Button>
        </Form>
    );
};

export default GiftCardsIndex;
