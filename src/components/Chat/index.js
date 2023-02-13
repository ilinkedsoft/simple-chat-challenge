import React, { useCallback, useEffect, useState } from 'react';
import Connection from './Connection';
import Publisher from './Publisher';
import Receiver from './Receiver';
import mqtt from 'mqtt';
import { Card, Input, Row, Col } from 'antd';

export const TOPIC_PRESENCE = '/topic/chatserver101/presence';
export const TOPIC_PUBLIC = '/topic/chatserver101/public';
export const TOPIC_PRIVATE = '/topic/chatserver101/priv';

const HookMqtt = () => {
  const [client, setClient] = useState(null);
  const [payload, setPayload] = useState({});
  const [connectStatus, setConnectStatus] = useState('Connect');
  const [username, setUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState('--all--');

  const mqttConnect = (host, mqttOption) => {
    setConnectStatus('Connecting');
    setClient(mqtt.connect(host, mqttOption));
  };

  const mqttPublish = useCallback((context) => {
    if (client) {
      const { topic, qos = 0, payload } = context;
      client.publish(topic, payload, { qos }, error => {
        if (error) {
          console.log('Publish error: ', error);
        }
      });
    }
  }, [client]);

  const mqttSub = useCallback((subscription) => {
    if (client) {
      const { topic, qos = 0 } = subscription;
      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.log('Subscribe to topics error', error)
          return
        }
      });
    }
  }, [client]);

  const broadcastUserPresence = useCallback(() => {
    return setInterval(() => {
      mqttPublish({ topic: TOPIC_PRESENCE, payload: JSON.stringify({ username, date: Date.now() }) });
    }, 1500);
  }, [username, mqttPublish]);

  useEffect(() => {
    let timer = null;
    if (client) {
      client.on('connect', () => {
        setConnectStatus('Connected');
        timer = broadcastUserPresence();
        mqttSub({ topic: TOPIC_PRESENCE });
        mqttSub({ topic: TOPIC_PUBLIC });
        mqttSub({ topic: `${TOPIC_PRIVATE}/${username}` });
      });
      client.on('error', (err) => {
        console.error('Connection error: ', err);
        client.end();
      });
      client.on('reconnect', () => {
        setConnectStatus('Reconnecting');
      });
      client.on('message', (topic, message) => {
        const payload = { topic, message: message.toString() };
        setPayload(payload);
      });
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [client, broadcastUserPresence, mqttSub, username]);

  const mqttDisconnect = () => {
    if (client) {
      client.end(() => {
        setConnectStatus('Connect');
        setClient(null);
      });
    }
  }

  return (
    <Card>
      <Card>
        <Row gutter={20}>
          <Col span={12}>
            <Input placeholder='enter username here' value={username} onChange={(e) => setUsername(e.target.value)}/>
          </Col>
          <Col span={12}>
            <Connection connect={mqttConnect} disconnect={mqttDisconnect} connectBtn={connectStatus} username={username}/>
          </Col>
        </Row>
      </Card>
      <Receiver payload={payload} username={username} selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
      <Publisher publish={mqttPublish} selectedUser={selectedUser} username={username}/>
    </Card>
  );
}

export default HookMqtt;
