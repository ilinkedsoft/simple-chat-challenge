import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Row, Col, Modal } from 'antd';

const ConnectionModal = ({ open, onCancel, record }) => {
  const [form] = Form.useForm();
  const handleOk = () => {
    form.submit();
    onCancel();
  };
  useEffect(() => {
    if (open) {
      form.setFieldsValue(record);
    }
  }, [form, record, open]);
  const ConnectionForm = (
    <Form
      layout="vertical"
      name="connectionForm"
      form={form}
    >
      <Row gutter={20}>
        <Col span={8}>
          <Form.Item
            label="Host"
            name="host"
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Port"
            name="port"
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Client ID"
            name="clientId"
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
  return (
    <Modal forceRender title="Connection" visible={open} onOk={handleOk} onCancel={onCancel}>
      {ConnectionForm}
    </Modal>
  )
}

const Connection = ({ connect, disconnect, connectBtn, username }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [connectionOptions, setConnectionOptions] = useState({
    host: 'broker.emqx.io',
    clientId: `mqttjs_ + ${Math.random().toString(16).substr(2, 8)}`,
    port: 8083,
  });
  const onFinish = (values) => {
    setConnectionOptions(values);
  };

  const handleConnect = () => {
    const { host, clientId, port } = connectionOptions;
    const url = `ws://${host}:${port}/mqtt`;
    const options = {
      keepalive: 30,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      will: {
        topic: 'WillMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false
      },
      rejectUnauthorized: false
    };
    options.clientId = clientId;
    connect(url, options);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const showConnectionForm = () => {
    setModalOpen(true);
  };

  const hideConnectionForm = () => {
    setModalOpen(false);
  }

  return (
    <>
      <Button type="primary" onClick={handleConnect} disabled={username === ''}>{connectBtn}</Button>
      <Button danger onClick={handleDisconnect} style={{marginLeft: '10px'}}>Disconnect</Button>
      <Button type="primary" onClick={showConnectionForm} style={{marginLeft: '10px'}}>Modify</Button>
      <Form.Provider
        onFormFinish={(name, { values }) => {
          if (name === 'connectionForm') {
            onFinish(values);
          }
        }}
      >
        <ConnectionModal open={isModalOpen} onCancel={hideConnectionForm} record={connectionOptions}/>
      </Form.Provider>
    </>
  );
}

export default Connection;
