import { Breadcrumb, Layout, Table, Tooltip, Button, Modal, Form, Input, Spin } from 'antd'
import { Content, Header } from 'antd/es/layout/layout'
import React, { useEffect, useState} from 'react'
import Sidebar from './Sidebar'
import NseService from '../services/NseService'
import { FaEdit } from "react-icons/fa";
import { toast } from 'react-toastify';

const AccountDetails = () => {
  
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);
  
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Account Details";
    loadNse();
  }, [form]);

  const loadNse = () => {
    NseService.accountdetails_get().then((response) => {
      setLoading(false);
      setData(response?.data);
    });
  };
  

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "ApiKey",
      dataIndex: "apikey",
      key: "apikey",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
    },
    {
      title: "t otp",
      dataIndex: "t_otp",
      key: "t_otp",
    },
    {
      title: "Action",
      render: (data) => (
        <span className="btn_action">
          <Tooltip placement="left" title="Edit">
            <Button
              type="primary"
              className="bt mr10"
              onClick={() => editData(data.id)}
              shape="circle"
              icon={<FaEdit />}
            />
          </Tooltip>
        </span>
      ),
    },
    
  ];

  const editData = (id) => { 
    setVisible(true)
    NseService.accountdetailById(id)
    .then((response) => {
      form.setFieldsValue(response.data)
    })
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  };

  const handleUpdate = async () => {
    const value = await form.validateFields()
    const id = value.id
    NseService.updateAccountdetail(value, id)
    .then((response) => { 
      if (response.status === 200) { 
        setVisible(false)
        form.resetFields()

        toast.success('Successfully Updated', {
          position: toast.POSITION.TOP_RIGHT, });

        const updatedIndex = data.findIndex(item => item.id === value.id);

        if (updatedIndex !== -1) {
          const newData = [...data];
          newData[updatedIndex] = value;
          setData(newData);
        }
      }
    })
    .catch((error) => { 
        toast.error('Somthing went Wrong', {
          position: toast.POSITION.TOP_RIGHT,});
      })
  };


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
                  <Breadcrumb.Item>Account Settings</Breadcrumb.Item>
                </Breadcrumb>

                <Content
                  style={{
                      padding: 24,
                      margin: 0,
                      minHeight: 280,
                    }}
                    >

              <Table
                  rowKey={(record) => record.id}
                  columns={columns}
                  dataSource={data}
                  loading={loading}
                  pagination={false}
                  />
              <Modal
                title="account"
                open={visible}
                footer={null}
                
                onCancel={handleCancel}
              >
              <Spin size="small" spinning={loading}>
                <div className="auth-inr p20">
                  <Form
                    onFinish={handleUpdate} 
                    form={form}
                    name="normal_login"
                    className="login-form"
                    layout="vertical"
                  >

                  <Form.Item hidden={true} name="id" label="Id">
                    <Input />
                  </Form.Item>

                  <Form.Item name="username" label="Username">
                    <Input />
                  </Form.Item>

                  <Form.Item name="apikey" label="apikey">
                    <Input name="apikey" />
                  </Form.Item>

                  <Form.Item name="password" label="password">
                    <Input />
                  </Form.Item>

                  <Form.Item name="t_otp" label="t_otp">
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
                </Spin>
                </Modal>
                  </Content>
                </Layout>
            </Layout>
        </Layout>
    </>
  )
}

export default AccountDetails