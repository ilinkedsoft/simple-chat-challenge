import React, { useEffect, useState } from 'react';
import { Card, List, Row, Col } from 'antd';
import { TOPIC_PRESENCE, TOPIC_PRIVATE, TOPIC_PUBLIC } from '.';
import { LockOutlined, StopOutlined } from '@ant-design/icons'

const Receiver = ({ payload, username, selectedUser, setSelectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([{username: '--all--', isOnline: true}]);

  useEffect(() => {
    switch (payload.topic) {
      case TOPIC_PRESENCE:
        const { username: newUser, date } = JSON.parse(payload.message);
        const userIdx = users.findIndex((user) => user.username === newUser);
        if (username !== newUser && userIdx === -1) setUsers(users => [...users, {username: newUser, date, isOnline: true}]);
        if (userIdx >= 0) setUsers(users => [...users.slice(0, userIdx), {...users[userIdx], date}, ...users.slice(userIdx + 1)]);
        break;
      case `${TOPIC_PRIVATE}/${username}`:
      case TOPIC_PUBLIC:
        setMessages(messages => [...messages, {...JSON.parse(payload.message), isPublic: payload.topic === TOPIC_PUBLIC}]);
        break;
      default:
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, username]);

  useEffect(() => {
    const timer = setInterval(() => {
      const _users = [];
      let isChanged = false;
      users.forEach((user) => {
        const _user = {...user};
        if (_user.username !== '--all--' && Date.now() - _user.date > 1500) {
          _user.isOnline = false;
          isChanged = true;
        }
        _users.push(_user);
      });
      console.log('***');
      if (isChanged) setUsers(_users);
    }, 1000);
    return () => clearInterval(timer);
  }, [users]);

  const renderMessageItem = (item) => {
    const { date, message, username, isPublic } = item;
    return (
      <List.Item>
        {`${new Date(date).getHours()}:${new Date(date).getMinutes()} [${username}]: `}
        {!isPublic && <LockOutlined />}
        {message}
      </List.Item>
    );
  };
  const renderUserItem = (item) => (
    <List.Item onClick={() => setSelectedUser(item.username)} style={{backgroundColor: item.username === selectedUser ? 'grey' : 'white', cursor: 'pointer'}}>
      {item.username}
      {!item.isOnline && (<StopOutlined style={{marginLeft: '5px'}}/>)}
    </List.Item>
  );

  return (
    <Card>
      <Row gutter={20}>
        <Col span={18}>
          <List
            size="small"
            bordered
            dataSource={messages}
            renderItem={renderMessageItem}
          />
        </Col>
        <Col span={6}>
          <List
            size="small"
            bordered
            dataSource={users}
            renderItem={renderUserItem}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default Receiver;
