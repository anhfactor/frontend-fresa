import {Button, Card, Image, Space, Switch, Table} from "antd";
import {useTranslation} from "react-i18next";
import SearchInput from "../../../components/search-input";
import React, {useContext, useEffect, useState} from "react";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {addMenu, disableRefetch, setMenuData} from "../../../redux/slices/menu";
import {fetchSellerGiftCards} from "../../../redux/slices/giftCard";
import formatSortType from "../../../helpers/formatSortType";
import {IMG_URL} from "../../../configs/app-global";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import DeleteButton from "../../../components/delete-button";
import {Context} from "../../../context/context";
import useDidUpdate from "../../../helpers/useDidUpdate";
import {fetchSellerProducts} from "../../../redux/slices/product";
import {useNavigate} from "react-router-dom";
import CustomModal from "../../../components/modal";
import SelectProduct from "../products/select-product";
import productService from "../../../services/seller/product";
import {toast} from "react-toastify";

function GiftCards() {
    const {t} = useTranslation();
    const { giftCards, meta, loading, params } = useSelector(
        (state) => state.giftCard,
        shallowEqual
    );
    const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
    const dispatch = useDispatch();
    const [uuid, setUUID] = useState(false);
    const { setIsModalVisible } = useContext(Context);
    const navigate = useNavigate()
    const [modalVisible, setModalVisible] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [columns, setColumns] = useState([
        {
            title: t('id'),
            is_show: true,
            dataIndex: 'id',
            sorter: true,
        },
        {
            title: t('image'),
            is_show: true,
            dataIndex: 'img',
            render: (img) => {
                return (
                    <Image
                        width={100}
                        src={IMG_URL + img}
                        placeholder
                        style={{ borderRadius: 4 }}
                    />
                );
            },
        },
        {
            title: t('name'),
            is_show: true,
            dataIndex: 'name',
        },
        {
            title: t('active'),
            is_show: true,
            dataIndex: 'active',
            render: (active, row) => {
                return (
                    <Switch
                        onChange={() => {
                            setIsModalVisible(true);
                            setUUID(row.uuid);
                            setIsDelete(false);
                        }}
                        checked={active}
                    />
                );
            },
        },
        {
            title: t('options'),
            is_show: true,
            dataIndex: 'options',
            render: (data, row) => {
                return (
                    <Space>
                        <Button
                            type='primary'
                            icon={<EditOutlined />}
                            onClick={() => goToEdit(row.id)}
                        />
                        <DeleteButton
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                setIsModalVisible(true);
                                setUUID(row.id);
                                setIsDelete(true);
                            }}
                        />
                    </Space>
                );
            },
        },
    ]);

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const handleFilter = (item, name) => {
        dispatch(
            setMenuData({
                activeMenu,
                data: { ...activeMenu.data, [name]: item },
            })
        );
    }
    const gotoAddGiftCard = () => {
    }

    function onChangePagination(pagination, sorter) {
        const { pageSize: perPage, current: page } = pagination;
        const { field: column, order } = sorter;
        const sort = formatSortType(order);
        dispatch(
            setMenuData({
                activeMenu,
                data: { ...activeMenu.data, perPage, page, column, sort },
            })
        );
    }

    const goToEdit = (row) => {
        dispatch(
            addMenu({
                id: 'gift-card-edit',
                url: `seller/gift-card/edit/${row}`,
                name: t('edit.gift.card'),
            })
        );
        navigate(`/seller/gift-card/edit/${row}`);
    }

    const giftCardDelete = () => {
        setLoadingBtn(true);
        productService
            .delete({ ids: [uuid] })
            .then(() => {
                setIsModalVisible(false);
                toast.success(t('successfully.deleted'));
                dispatch(fetchSellerGiftCards(params));
            })
            .finally(() => setLoadingBtn(false));
    };

    const handleActive = () => {
        setLoadingBtn(true);
        productService
            .setActive(uuid)
            .then(() => {
                setIsModalVisible(false);
                dispatch(fetchSellerGiftCards(params));
                toast.success(t('successfully.updated'));
            })
            .finally(() => setLoadingBtn(false));
    };

    const handleCancel = () => setModalVisible(false);
    const showModal = () => setModalVisible(true);

    useEffect(() => {
        if (activeMenu.refetch) {
            const data = activeMenu.data;
            const paramsData = {
                perPage: data?.perPage,
                page: data?.page,
            };
            dispatch(fetchSellerGiftCards(paramsData));
            dispatch(disableRefetch(activeMenu));
        }
    }, [activeMenu.refetch]);

    useDidUpdate(() => {
        const data = activeMenu.data;
        const paramsData = {
            search: data?.search,
            sort: data?.sort,
            column: data?.column,
            perPage: data?.perPage,
            page: data?.page,
        };
        dispatch(fetchSellerGiftCards(paramsData));
    }, [activeMenu.data]);

    return <Card
        title={t('gift.cards')}
        extra={<Space>
            <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
        /> <Button type='primary' onClick={showModal}>
            {t('add.gift.card')}
        </Button></Space>}
    >
        <Table
            rowSelection={rowSelection}
            loading={loading}
            columns={columns?.filter((items) => items.is_show)}
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
        <SelectProduct isGiftCard isModalOpen={modalVisible} handleCancel={handleCancel} />
    </Card>
}

export default GiftCards;