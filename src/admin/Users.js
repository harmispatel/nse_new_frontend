import { Breadcrumb, Button, Form, Input, Layout, Modal, Popconfirm, Table, Tooltip } from 'antd'
import React from 'react'
import Sidebar from './Sidebar'
import { Content } from 'antd/es/layout/layout';
import NseService from '../services/NseService';
import { useEffect } from 'react';
import { useState } from 'react';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AuthService from '../services/AuthService';
const { Header } = Layout;
const Users = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [visibleUpdate, setVisibleUpdate] = useState(false);
    const [registerData, setRegisterData] = useState({
        username: "",
        password: "",
    });

    useEffect(() => {
        document.title = "Users";
        loadUser();
    }, []);
    
    const loadUser = () => {
        setLoading(true)
        NseService.getUsers().then((response) => { 
            setData(response?.data?.data)
            setLoading(false)
        })
    }

    const handleOnChanger = (e) => { 
        const { name, value } = e.target;
        setRegisterData({ ...registerData, [name]: value });
    }

    const handleEdit = (data) => {
        form.setFieldsValue(data)
        setVisibleUpdate(true)
    }

    const handleUpdate = async () => {
        const value = await form.validateFields()
        const id = value.id
        NseService.updateUsers(value, id)
        .then((res) => { 
            if (res.status === 200) { 
                setVisibleUpdate(false)
                form.resetFields()

                toast.success('Successfully Updated', {
                    position: toast.POSITION.TOP_RIGHT,
                });

                const updatedIndex = data.findIndex(item => item.id === value.id);
                if (updatedIndex !== -1) {
                const newData = [...data];
                newData[updatedIndex] = value;
                setData(newData); 
                }
            }
        }).catch((e)=>{ 
            toast.error('Something went wrong!', {
                position: toast.POSITION.TOP_RIGHT,
            });
         })
    }

    const handleSubmit = () => {
        AuthService.registerUser(registerData)
        .then((res) =>{ 
            if (res.status === 200) { 
                setVisible(false)
                form.resetFields()
                loadUser()
                toast.success('Successfully Created.', {
                    position: toast.POSITION.TOP_RIGHT,
                });
            }
        }).catch((err) => { 
            toast.error(err.username[0] ?? 'Something went wrong!', {
                position: toast.POSITION.TOP_RIGHT,
            });
        })
    }

    const handleDelete = (id) => {
        NseService.deleteUser(id)
        .then((res) =>{ 
            loadUser()
        })
    }
    
    const handleCancel = () => {
        setVisible(false)
        setVisibleUpdate(false)
        form.resetFields()
      };
        
    const columns = [
        {
          title: "Id",
          key: "index",
          render: (text, record, index) => index + 1,
        },
        {
          title: "username",
          dataIndex: "username",
          key: "username",
        },
        // {
        //   title: "Email",
        //   dataIndex: "email",
        //   key: "email",
        // },
        {
            title: "Action",
            render: (data) => (
              <span className="btn_action">
                <Tooltip placement="left" title="Edit">
                  <Button
                    type="primary"
                    className="bt mr10"
                    onClick={() => handleEdit(data)}
                    shape="circle"
                    icon={<FaEdit />}
                  />
                </Tooltip>

                <Tooltip placement="left" title="Deleted">
                    <Popconfirm
                    title="Are you sure Deleted User"
                    className="ml15"
                    onConfirm={() => handleDelete(data.id)}
                    okText={"yes"}
                    cancelText={"no"}
                    >
                    <Button
                    type="primary"
                    className="bt"
                    shape="circle"
                    style={{marginLeft: "10px"}}
                    icon={<FaTrashAlt />}
                    />
                </Popconfirm>
            </Tooltip>
              </span>
            ),
          },
      ];
    
  return (
    <>
        <Layout>
            <Header className="head-main">
                <div className="logo" />
            </Header>

            <Layout>
                <Sidebar />

                <Layout className="site-layout-background" style={{ margin: "24px 16px 0" }} >
                
                <Breadcrumb style={{ margin: "16px 30px" }}>
                    <Breadcrumb.Item>Admin</Breadcrumb.Item>
                    <Breadcrumb.Item>Users</Breadcrumb.Item>
                </Breadcrumb>
                

                <Content
                    style={{
                    padding: "14px 24px",
                    margin: 0,
                    minHeight: 280,
                    }} 
                >
                    <Button type="primary" style={{float: "right", marginBottom: "15px", borderRadius: "25px"}} onClick={() => setVisible(true)} ><FaPlus /> Add </Button>

                    <Table
                    rowKey={(record) => record.id}
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={false}
                    />

                    {/* Update Model */}
                    <Modal
                        title="Urban Kars"
                        open={visibleUpdate}
                        footer={null}
                        onCancel={handleCancel}
                    >
                    <div className="auth-inr p20">
                    <Form
                        form={form}
                        name="normal_login"
                        className="login-form"
                        layout="vertical"
                        onFinish={handleUpdate} 
                    >

                    <Form.Item hidden={true} name="id" label="Id">
                        <Input />
                    </Form.Item>

                    <Form.Item name="username" label="Username">
                        <Input />
                    </Form.Item>

                    <Form.Item className="sign-bt">
                        <Button
                        block="true"
                        type="primary"
                        shape="round"
                        htmlType="submit"
                        className="login-form-button bg-dark-green"
                        key="submit"
                        >
                        Update
                        </Button>
                    </Form.Item>
                    </Form>
                    </div>
                    </Modal>

                    {/* Add Model */}
                    <Modal
                        title="Urban Kars"
                        open={visible}
                        footer={null}
                        onCancel={handleCancel}
                    >
                    <div className="auth-inr p20">
                    <Form
                        form={form}
                        name="normal_login"
                        className="login-form"
                        layout="vertical"
                        onFinish={handleSubmit} 
                    >

                    <Form.Item hidden={true} name="id" label="Id">
                        <Input />
                    </Form.Item>

                    <Form.Item 
                    name="username" 
                    label="Username"
                    onChange={handleOnChanger}
                    rules={[
                        {
                        required: true,
                        message: "Please input your username!",
                        },
                    ]}
                    >
                        <Input name="username" />
                    </Form.Item>

                    <Form.Item 
                    name="password" 
                    label="Password"
                    onChange={handleOnChanger}
                    rules={[
                        {
                        required: true,
                        message: "Please input your password!",
                        },
                    ]}
                    >
                        <Input name="password" />
                    </Form.Item>

                    <Form.Item className="sign-bt">
                        <Button
                        block="true"
                        type="primary"
                        shape="round"
                        htmlType="submit"
                        className="login-form-button bg-dark-green"
                        key="submit"
                        >
                        Save
                        </Button>
                    </Form.Item>
                    </Form>
                    </div>
                    </Modal>
                </Content>

                </Layout>
            </Layout>
        </Layout>
    </>
  )
}

export default Users