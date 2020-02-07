import * as React from 'react'
import PropTypes from 'prop-types'
import { Typography, Row, Col, Card } from 'antd'
const { Title, Paragraph } = Typography

class CloudSelector extends React.Component {
  static propTypes = {
    selectedCloud: PropTypes.string.isRequired,
    handleSelectCloud: PropTypes.func.isRequired
  }

  selectCloud = (cloud) => {
    return () => {
      this.props.handleSelectCloud(cloud)
    }
  }

  render() {
    const getCardStyle = (cloud) => {
      const style = {
        height: '100%'
      }
      if (this.props.selectedCloud === cloud) {
        style.border = '1px solid #999999'
      }
      return style
    }

    const getCardBodyStyle = (cloud, disabled) => {
      const style = {}
      if (this.props.selectedCloud === cloud) {
        style.backgroundColor = '#f0f2f5'
      }
      if (disabled) {
        style.opacity = '0.3'
      }
      return style
    }

    return (
      <Row gutter={16} type="flex" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Col span={6}>
          <Card
            style={getCardStyle('GKE')}
            onClick={this.selectCloud('GKE')}
            bodyStyle={getCardBodyStyle('GKE')}
            hoverable={true}
          >
            <Paragraph style={{ textAlign: 'center' }}>
              <img src="/static/GKE.png" height="80px" />
            </Paragraph>
            <Paragraph strong style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0' }}>Google Kubernetes Engine</Paragraph>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={getCardStyle('EKS')}
            onClick={this.selectCloud('EKS')}
            bodyStyle={getCardBodyStyle('EKS')}
            hoverable={true}
          >
            <Paragraph style={{ textAlign: 'center' }}>
              <img src="/static/EKS.png" height="80px" />
            </Paragraph>
            <Paragraph strong style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0' }}>Elastic Kubernetes Service</Paragraph>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={getCardStyle('AKS')}
            bodyStyle={getCardBodyStyle('AKS', true)}
            hoverable={false}
          >
            <Paragraph style={{ textAlign: 'center' }}>
              <img src="/static/AKS.svg" height="80px" />
            </Paragraph>
            <Paragraph strong style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0' }}>Azure Kubernetes Service</Paragraph>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={getCardStyle('CUSTOM')}
            bodyStyle={getCardBodyStyle('CUSTOM', true)}
            hoverable={false}
          >
            <Title level={3} style={{ textAlign: 'center', paddingTop: '37px', height: '80px' }}>Custom</Title>
            <Paragraph strong style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0' }}>Bring your own cluster</Paragraph>
          </Card>
        </Col>
      </Row>
    )
  }
}

export default CloudSelector
