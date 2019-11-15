import { Row, Col, Typography } from 'antd'
const { Text } = Typography;

const CopyTextWithLabel = ({ label, text }) => {
  return (
    <div style={{ padding: '5px 0' }}>
      <Row>
        <Col xs={24} sm={12} md={9} lg={7} xl={5}>
          <Text strong>{label}</Text>
        </Col>
        <Col>
          <Text copyable>{text}</Text>
        </Col>
      </Row>
    </div>
  )
}

export default CopyTextWithLabel
