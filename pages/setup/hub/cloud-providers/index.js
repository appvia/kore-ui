import React from 'react'
import axios from 'axios'
import { Layout, Typography, Card, Checkbox, Row, Col } from 'antd'
const { Footer } = Layout
const { Title, Text, Paragraph } = Typography

import { hub } from '../../../../config'
import redirect from '../../../../utils/redirect'

import JSONSchemaForm from '../../../../components/forms/JSONSchemaForm'

const RECOMMENDED = 'gke'

class ConfigureCloudProvidersPage extends React.Component {
  static async getClusterClasses() {
    try {
      const result = await axios.get(`${hub.baseUrl}/classes?category=cluster`)
      return result.data
    } catch (err) {
      throw new Error(err.message)
    }
  }

  static getInitialProps = async () => {
    const classes = await this.getClusterClasses()
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
      console.log('onChange', className, e.target.checked)
      let selected = [ ...this.state.selected ]
      if (e.target.checked) {
        selected.push(className)
      } else {
        selected = selected.filter(s => s !== className)
      }
      this.setState({ selected })
    }
  }

  handleFormSubmit = ({ kind, className }) => {
    return (values, setState) => {
      const body = {
        team: 'hub-admins',
        className,
        kind,
        spec: values
      }
      axios.post(`${hub.baseUrl}/classes`, body)
        .then(function (res) {
          console.log(res)
          if (res.status === 200) {
            return redirect(null, '/setup/hub/complete')
          }
        }.bind(this))
        .catch(function (error) {
          setState({
            buttonText: 'Save',
            submitting: false,
            formErrorMessage: 'An error occurred saving the configuration, please try again'
          })
        })
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
        const requiresKind = s.spec.requires.kind
        const requiresSchema = s.spec.schemas.definitions[requiresKind]
        const specSchemaRef = requiresSchema.properties.spec.$ref
        const specSchema = s.spec.schemas.definitions[specSchemaRef.substr(specSchemaRef.lastIndexOf('/') + 1, specSchemaRef.length)]
        return (
          <Card key={s.metadata.name} title={s.spec.displayName} style={{marginTop: '20px'}} headStyle={{backgroundColor: '#f5f5f5'}}>
            <Paragraph>
            <Text>Enter the credentials for {s.spec.displayName}</Text>
            </Paragraph>
            <JSONSchemaForm schema={specSchema} handleSubmit={this.handleFormSubmit({ kind: requiresKind, className: s.metadata.name })} />
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
