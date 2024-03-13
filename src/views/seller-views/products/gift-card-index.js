import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    Form,
    Input,
    InputNumber,
    Row,
    Switch,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setMenuData } from '../../../redux/slices/menu';
import getTranslationFields from '../../../helpers/getTranslationFields';
import productService from '../../../services/seller/product';
import MediaUpload from '../../../components/upload';

export default function GiftCardsIndex({ next, setUuid }) {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
    const [error, setError] = useState(null);
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
        const data = {
            title: getTranslationFields(languages, values, 'title'),
            description: getTranslationFields(languages, values, 'description'),
            images: [...fileList.flatMap((item) => item.name)],
            active: values.active,
            keywords: values.keywords,
            max_qty: values.max_qty,
            min_qty: values.min_qty,
            price: values.price,
            qr_code: values.qr_code,
            quantity: values.quantity,
            tax: values.tax,
            gift:1
        };
        productService
            .newCreate(data)
            .then((res) => {
                next();
                setUuid(res.data.uuid);
            })
            .catch((err) => setError(err.response.data.params))
            .finally(() => setLoadingBtn(false));
    };

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
                <Col span={8}>
                    <Form.Item
                        label={t('qr_code')}
                        name='qr_code'
                        rules={[{ required: true, message: t('required') }]}
                        help={error?.qr_code?.[0] || null}
                        validateStatus={error?.qr_code?.[0] ? 'error' : 'success'}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label={t('keywords')}
                        name='keywords'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item
                        label={t('tax')}
                        name='tax'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <InputNumber min={0} className='w-100' addonAfter='%' />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item
                        label={t('min.qty')}
                        name='min_qty'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <InputNumber min={1} className='w-100' />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label={t('max.qty')}
                        name='max_qty'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <InputNumber min={1} className='w-100' />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label={t('price')}
                        name='price'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <InputNumber min={0} className='w-100' />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label={t('quantity')}
                        name='quantity'
                        rules={[{ required: true, message: t('required') }]}
                    >
                        <InputNumber min={0} className='w-100' />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label={t('active')} name='active' valuePropName='checked'>
                        <Switch />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label={t('images')} name='images'>
                        <MediaUpload
                            type='products'
                            imageList={fileList}
                            setImageList={setFileList}
                            form={form}
                        />
                        {/* <ImageGallery
              type='products'
              fileList={fileList}
              setFileList={setFileList}
              form={form}
              disabled={false}
            /> */}
                    </Form.Item>
                </Col>
            </Row>
            <Button
                type='primary'
                htmlType='submit'
                loading={loadingBtn}
                disabled={loadingBtn}
            >
                {t('next')}
            </Button>
        </Form>
    );
}
