import React, { useState } from 'react';
import { Card, Input, Row, Col, Button } from 'antd';
import { TOPIC_PRIVATE, TOPIC_PUBLIC } from '.';

const Publisher = ({ publish, selectedUser, username }) => {
  const [text, setText] = useState('');
  const isPublic = () => selectedUser === '--all--';

  const onSend = () => {
    publish({topic: isPublic() ? TOPIC_PUBLIC : `${TOPIC_PRIVATE}/${selectedUser}`, payload: JSON.stringify({message: text, username, date: Date.now()})});
  };

  return (
    <Card>
      <Row gutter={20}>
        <Col flex={"1 0 auto"}>
          <Input placeholder='enter your text here' value={text} onChange={(e) => setText(e.target.value)}/>
        </Col>
        <Col>
          <Button type="primary" onClick={onSend} disabled={text === ''}>Send to {isPublic() ? 'All' : selectedUser}</Button>
        </Col>
      </Row>
    </Card>
  );
}

export default Publisher;
