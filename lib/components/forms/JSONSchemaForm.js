import * as React from 'react'
import { Button, Form, Input, Alert } from 'antd'

class JSONSchemaForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonText: 'Save',
      submitting: false,
      formErrorMessage: false
    }
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }

  disableButton = fieldsError => {
    if (this.state.submitting) {
      return true
    }
    return Object.keys(fieldsError).some(field => fieldsError[field])
  }

  handleSubmit = e => {
    e.preventDefault()

    this.setState({
      buttonText: 'Saving...',
      submitting: true,
      formErrorMessage: false
    })

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.handleSubmit(values, this.setState.bind(this))
      }
    })
  }

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form
    const { schema } = this.props

    const formConfig = {
      layout: 'horizontal',
      labelAlign: 'left',
      labelCol: {
        sm: { span: 24 },
        md: { span: 5 },
        lg: { span: 4 },
      },
      wrapperCol: {
        span: 12
      },
    }

    const formErrorMessage = () => {
      if (this.state.formErrorMessage) {
        return (
          <Alert
            message={this.state.formErrorMessage}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '20px'}}
          />
        )
      }
      return null
    }

    const capitalizeFirstLetter = (string) => string[0].toUpperCase() + string.slice(1)
    const isRequired = (property) => schema.required.includes(property)
    const fieldError = (property) => isFieldTouched(property) && getFieldError(property)
    const getFieldHelp = (property) => fieldError(property) || schema.properties[property].description

    return (
      <Form {...formConfig} onSubmit={this.handleSubmit}>
        <div>{formErrorMessage()}</div>
        {Object.keys(schema.properties).map(p => (
          <Form.Item key={p} label={capitalizeFirstLetter(p)} validateStatus={fieldError(p) ? 'error' : ''} help={getFieldHelp(p)}>
            {getFieldDecorator(p, {
              rules: [{ required: isRequired(p), message: 'You must enter this field.' }],
            })(
              <Input />
            )}
          </Form.Item>
        ))}
        <Form.Item style={{marginBottom: '0'}}>
          <Button type="primary" htmlType="submit" disabled={this.disableButton(getFieldsError())}>{this.state.buttonText}</Button>
        </Form.Item>
      </Form>
    )
  }
}

const WrappedJSONSchemaForm = Form.create({ name: 'json_schema_form' })(JSONSchemaForm)

export default WrappedJSONSchemaForm
