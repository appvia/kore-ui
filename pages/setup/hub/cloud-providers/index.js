import React from 'react'
import { Layout, Typography } from 'antd'
const { Footer } = Layout
const { Title, Paragraph } = Typography

import redirect from '../../../../lib/utils/redirect'
import { hub } from '../../../../config'
import GKECredentialsForm from '../../../../lib/components/forms/GKECredentialsForm'

class ConfigureCloudProvidersPage extends React.Component {
  static propTypes = {}

  static staticProps = {
    title: 'Configure cluster providers',
    hideSider: true
  }

  handleFormSubmit = () => {
    redirect(null, '/setup/hub/complete')
  }

  render() {
    return (
      <div>
        <Title>Configure Cloud Cluster Provider</Title>
        <Paragraph>Choose your first cloud provider for your clusters, more can be configured later.</Paragraph>
        <GKECredentialsForm team={hub.hubAdminTeamName} handleSubmit={this.handleFormSubmit} />
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
