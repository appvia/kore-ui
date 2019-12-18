import React from 'react'
import PropTypes from 'prop-types'
import { Layout, Typography } from 'antd'
const { Footer } = Layout
const { Title, Paragraph } = Typography

import redirect from '../../../../lib/utils/redirect'
import apiRequest from '../../../../lib/utils/api-request'
import ClusterProviderForm from '../../../../lib/components/forms/ClusterProviderForm'

class ConfigureCloudProvidersPage extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired
  }

  static getInitialProps = async (ctx) => {
    const classes = await apiRequest(ctx.req, 'get', '/classes?category=cluster')
    return {
      title: 'Configure cluster providers',
      hideSider: true,
      classes
    }
  }

  handleFormSubmit = () => {
    redirect(null, '/setup/hub/complete')
  }

  render() {
    return (
      <div>
        <Title>Configure Cloud Cluster Provider</Title>
        <Paragraph>Choose your first cloud provider for your clusters, more can be configured later.</Paragraph>
        <ClusterProviderForm
          mode="new"
          classes={this.props.classes}
          teams={{ items: [] }}
          handleSubmit={this.handleFormSubmit}
        />
        <Footer style={{textAlign: 'center', backgroundColor: '#fff'}}>
          <span>
          For more information read the <a href="#">Documentation</a>
          </span>
        </Footer>
      </div>
    )
  }
}

export default ConfigureCloudProvidersPage
