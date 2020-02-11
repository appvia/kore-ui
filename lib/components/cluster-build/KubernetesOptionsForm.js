import * as React from 'react'
import PropTypes from 'prop-types'

import { Form, Card, Input } from 'antd'

class KubernetesOptionsForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired
  }

  render() {
    const { getFieldDecorator } = this.props.form

    return (
      <Card title="Choose Kubernetes options" style={{ marginTop: '20px' }}>
        <Form.Item label="Domain">
          {getFieldDecorator('domain', {
            rules: [{ required: true, message: 'Please enter the domain!' }],
          })(
            <Input id="domain" key="k8s_dom" placeholder="Domain" />
          )}
        </Form.Item>
      </Card>
    )
  }
}

const WrappedKubernetesOptionsForm = Form.create({ name: 'cluster_options' })(KubernetesOptionsForm)

export default WrappedKubernetesOptionsForm
