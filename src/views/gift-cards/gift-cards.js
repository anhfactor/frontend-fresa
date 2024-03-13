import {Button, Card, Col, Image, Row, Space, Table} from "antd";
import {useTranslation} from "react-i18next";
import SearchInput from "../../components/search-input";
import React, {useContext, useEffect, useState} from "react";
import {addMenu, disableRefetch, setMenuData} from "../../redux/slices/menu";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {fetchGiftCards} from "../../redux/slices/giftCard";
import {IMG_URL} from "../../configs/app-global";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import DeleteButton from "../../components/delete-button";
import {Context} from "../../context/context";
import useDidUpdate from "../../helpers/useDidUpdate";
import formatSortType from "../../helpers/formatSortType";
import CustomModal from "../../components/modal";
import productService from "../../services/product";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";


function GiftCards() {
    const {t} = useTranslation();
    const dispatch = useDispatch()
    const {activeMenu} = useSelector((state) => state.menu, shallowEqual);
    const {giftCards, meta, loading, params} = useSelector((state) => state.giftCard, shallowEqual);
    const {setIsModalVisible} = useContext(Context);
    const navigate = useNavigate()
    const [uuid, setUUID] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtn, setLoadingBtn] = useState(false);

    const [columns, setColumns] = useState([{
        title: t('id'),
        is_show: true,
        dataIndex: 'id',
        sorter: (a, b) => a.id - b.id,
    }, {
        title: t('image'),
        dataIndex: 'img',
        is_show: true,
        render: (img) => {
            return (
                <Image
                    width={100}
                    src={IMG_URL + img}
                    placeholder
                    style={{borderRadius: 4}}
                />
            );
        },
    }, {
        title: t('name'),
        dataIndex: 'name',
        is_show: true,
    }, {
        title: t('options'),
        dataIndex: 'options',
        is_show: true,
        render: (data, row) => {
            return (
                <Space>
                    <Button
                        type='primary'
                        icon={<EditOutlined/>}
                        onClick={() => goToEdit(row.uuid, !!row.gift)}
                    />
                    <DeleteButton
                        icon={<DeleteOutlined/>}
                        onClick={() => {
                            setIsModalVisible(true);
                            setUUID(row.uuid);
                            setIsDelete(true);
                        }}
                    />
                </Space>
            );
        },
    },])

    const handleFilter = (item, name) => {
        dispatch(
            setMenuData({
                activeMenu,
                data: {...activeMenu.data, [name]: item},
            })
        );
    };
    const goToAddGiftCard = () => {
        dispatch(
            addMenu({
                id: 'gift-card-add',
                url: 'gift-card/add',
                name: t('add.gift.card'),
            }));
        navigate('/gift-card/add');
    }
    const goToEdit = (row) => {
        dispatch(
            addMenu({
                id: `gift-card-edit`,
                url: `gift-card/${row}`,
                name: t('edit.gift.card'),
            })
        );
        navigate(`/gift-card/${row}`);
    }

    const onChangePagination = (pagination, sorter) => {
        const {pageSize: perPage, current: page} = pagination;
        const {field: column, order} = sorter;
        const sort = formatSortType(order);
        dispatch(
            setMenuData({
                activeMenu,
                data: {...activeMenu.data, perPage, page, column, sort},
            })
        );
    }

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const giftCardDelete = () => {
        setLoadingBtn(true);
        productService
            .delete(uuid)
            .then(() => {
                setIsModalVisible(false);
                toast.success(t('successfully.deleted'));
                dispatch(fetchGiftCards(params));
            })
            .finally(() => setLoadingBtn(false));
    };

    const handleActive = () => {
        setLoadingBtn(true);
        productService
            .setActive(uuid)
            .then(() => {
                setIsModalVisible(false);
                dispatch(fetchGiftCards(params));
                toast.success(t('successfully.updated'));
            })
            .finally(() => setLoadingBtn(false));
    };

    useEffect(() => {
        const data = activeMenu.data;

        const paramsData = {
            search: data?.search,
        }

        if (activeMenu.refetch) {
            dispatch(fetchGiftCards(paramsData))
            dispatch(disableRefetch(activeMenu));
        }
    }, [activeMenu.refetch]);

    useDidUpdate(() => {
        const data = activeMenu.data;
        const paramsData = {
            search: data?.search,
            shop_id: data?.shop?.value,
            sort: data?.sort,
            column: data?.column,
            perPage: data?.perPage,
            page: data?.page,
        };
        dispatch(fetchGiftCards(paramsData));
    }, [activeMenu.data]);


    return <Card title={t('gift.cards')}>
        <Row gutter={24} className='mb-2'>
            <Col span={12}>
                <Space>
                    <SearchInput
                        placeholder={t('search')}
                        handleChange={(search) => handleFilter(search, 'search')}
                    />
                </Space>
            </Col>
            <Col span={12} className='d-flex justify-content-end'>
                <Space>
                    <Button type='primary' onClick={goToAddGiftCard}>
                        {t('add.gift.card')}
                    </Button>
                </Space>
            </Col>
        </Row>
        <Table
            rowSelection={rowSelection}
            loading={loading}
            columns={columns?.filter((item) => item.is_show)}
            dataSource={giftCards}
            pagination={{
                pageSize: params.perPage,
                page: activeMenu.data?.page || 1,
                total: meta.total,
                defaultCurrent: activeMenu.data?.page,
            }}
            onChange={onChangePagination}
            rowKey={(record) => record.id}
        />
        <CustomModal
            click={isDelete ? giftCardDelete : handleActive}
            text={isDelete ? t('delete.product') : t('set.active.product')}
            loading={loadingBtn}
        />
    </Card>
}

export default GiftCards;