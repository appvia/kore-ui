import React from 'react'
import { Layout, Typography, Card, Checkbox, Row, Col } from 'antd'
const { Footer } = Layout
const { Title, Text, Paragraph } = Typography

import { hub } from '../../../../config'
import redirect from '../../../../utils/redirect'
import apiRequest from '../../../../utils/api-request'
import JSONSchemaForm from '../../../../components/forms/JSONSchemaForm'
import Generic from '../../../../server/models/Generic'

const RECOMMENDED = 'gke'

class ConfigureCloudProvidersPage extends React.Component {

  static getInitialProps = async (ctx) => {
    const classes = await apiRequest(ctx.req, 'get', '/classes?category=cluster')
    return {
      title: 'Configure cluster providers',
      hideSider: true,
      classes
    }
  }

  state = {
    selected: [RECOMMENDED]
  }

  onChange = (className) => {
    return (e) => {
      let selected = [ ...this.state.selected ]
      if (e.target.checked) {
        selected.push(className)
      } else {
        selected = selected.filter(s => s !== className)
      }
      this.setState({ selected })
    }
  }

  handleFormSubmit = ({ requires, className }) => {
    return async (values, setState) => {
      const resource = Generic({
        apiVersion: `${requires.group}/${requires.version}`,
        kind: requires.kind,
        name: className,
        spec: values
      })
      try {
        await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${className}`, resource)
        return redirect(null, '/setup/hub/complete')
      } catch (err) {
        console.error('Error submitting form', err)
        const state = { ...this.state }
        state.buttonText = 'Save'
        state.submitting = false
        state.formErrorMessage = 'An error occurred saving the configuration, please try again'
        setState(state)
      }
    }
  }

  render() {
    const Providers = () => (
      <Row gutter={20}>
        {this.props.classes.items.map(c => (
          <Col span={8} key={c.metadata.name}>
            <Card>
              <Paragraph>
                <Checkbox
                  checked={this.state.selected.includes(c.metadata.name)}
                  onChange={this.onChange(c.metadata.name)}
                >
                  <Text strong>{c.spec.displayName}</Text>
                </Checkbox>
                { c.metadata.name === RECOMMENDED ? <Text style={{color: '#1890ff'}}>Recommended</Text> : null }
              </Paragraph>
              <Paragraph>{c.spec.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    )

    const ProviderForms = () => {
      return this.props.classes.items.filter(c => this.state.selected.includes(c.metadata.name)).map(s => {
        const requires = s.spec.requires
        const requiresSchema = s.spec.schemas.definitions[requires.kind].properties.spec
        return (
          <Card key={s.metadata.name} title={s.spec.displayName} style={{marginTop: '20px'}} headStyle={{backgroundColor: '#f5f5f5'}}>
            <Paragraph>
              <Text>Complete the form required for <Text strong>{s.spec.displayName}</Text></Text>
            </Paragraph>
            <JSONSchemaForm schema={requiresSchema} handleSubmit={this.handleFormSubmit({ requires, className: s.metadata.name })} />
          </Card>
        )
      })
    }

    return (
      <div>
        <Title>Configure Cloud Cluster Providers</Title>
        <Paragraph>Choose the cloud providers for your clusters.</Paragraph>
        <Providers />
        <ProviderForms />
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
