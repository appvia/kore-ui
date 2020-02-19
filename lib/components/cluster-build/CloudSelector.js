import * as React from 'react'
import PropTypes from 'prop-types'
import { Typography, Row, Col, Card, Tag } from 'antd'
const { Title, Paragraph, Text } = Typography

class CloudSelector extends React.Component {
  static propTypes = {
    selectedCloud: PropTypes.string.isRequired,
    handleSelectCloud: PropTypes.func.isRequired,
    providers: PropTypes.object,
    showCustom: PropTypes.bool
  }

  selectCloud = (cloud) => {
    return () => {
      this.props.handleSelectCloud(cloud)
    }
  }

  render() {
    const { selectedCloud, providers, showCustom } = this.props

    const getCardStyle = cloud => {
      const style = {
        height: '100%'
      }
      if (selectedCloud === cloud) {
        style.border = '1px solid #999999'
      }
      return style
    }

    const getCardBodyStyle = cloud => {
      const style = {
        height: 'inherit'
      }
      if (selectedCloud === cloud) {
        style.backgroundColor = '#f0f2f5'
      }
      return style
    }

    const Providers = ({ cloud }) => {
      if (!providers) {
        return null
      }
      const cloudProviderCount = providers[cloud].length
      return (
        <Paragraph style={{textAlign: 'center', marginTop: '20px', marginBottom: '0'}}>
          {cloudProviderCount > 0 ?
            <Tag color="#87d068">{cloudProviderCount} providers</Tag> :
            <Text type="warning">No providers</Text>
          }
        </Paragraph>
      )
    }

    const ComingSoon = () => (
      <div style={{ height: 'inherit', position: 'absolute', zIndex: '1', top: '10px', left: '0', width: '100%', textAlign: 'center' }}>
        <Tag style={{ fontSize: '18px', fontWeight: 'bold', padding: '5px' }} color="#2db7f5">Coming soon!</Tag>
      </div>
    )

    return (
      <Row gutter={16} type="flex" justify="center" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <Col span={6}>
          <Card
            style={getCardStyle('GKE')}
            onClick={this.selectCloud('GKE')}
            bodyStyle={getCardBodyStyle('GKE')}
            hoverable={true}
          >
            <Paragraph style={{ textAlign: 'center' }}>
              <img src="/static/images/GKE.png" height="80px" />
            </Paragraph>
            <Paragraph strong style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0' }}>Google Kubernetes Engine</Paragraph>
            <Providers cloud="GKE" />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={getCardStyle('EKS')}
            bodyStyle={getCardBodyStyle('EKS')}
            hoverable={false}
          >
            <ComingSoon />
            <div style={{ textAlign: 'center', opacity: '0.3' }}>
              <Paragraph>
                <img src="/static/images/EKS.png" height="80px" />
              </Paragraph>
              <Paragraph strong style={{ marginTop: '20px' }}>Elastic Kubernetes Service</Paragraph>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={getCardStyle('AKS')}
            bodyStyle={getCardBodyStyle('AKS')}
            hoverable={false}
          >
            <ComingSoon />
            <div style={{ textAlign: 'center', opacity: '0.3' }}>
              <Paragraph>
                <img src="/static/images/AKS.svg" height="80px" />
              </Paragraph>
              <Paragraph strong style={{ marginTop: '20px' }}>Azure Kubernetes Service</Paragraph>
            </div>
          </Card>
        </Col>
        {showCustom ? (
          <Col span={6}>
            <Card
              style={getCardStyle('CUSTOM')}
              bodyStyle={getCardBodyStyle('CUSTOM')}
              hoverable={false}
            >
              <ComingSoon />
              <div style={{ textAlign: 'center', opacity: '0.3' }}>
                <Title level={3} style={{ paddingTop: '30px', height: '80px' }}>Custom</Title>
                <Paragraph strong style={{ marginTop: '20px' }}>Bring your own cluster</Paragraph>
              </div>
            </Card>
          </Col>
        ) : null}
      </Row>
    )
  }
}

export default CloudSelector
