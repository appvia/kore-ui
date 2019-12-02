import { Layout, Typography, Card, Button, Icon } from 'antd'
const { Footer } = Layout
const { Title, Text, Paragraph } = Typography

import { hub } from '../../../config'
import CopyTextWithLabel from '../../../lib/components/CopyTextWithLabel'
import AuthConfigForm from '../../../lib/components/forms/AuthConfigForm'

const StepOne = () => (
  <Card title="Step 1 - Create GitHub OAuth app" style={{ marginTop: '20px' }} headStyle={{ backgroundColor: '#f5f5f5' }}>
    <Paragraph>
      <Text>Follow these instructions to setup your GitHub OAuth app</Text>
      <br/>
      <Button type="link" target="_blank" href="https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/" style={{ padding: '0' }}>https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/</Button>
    </Paragraph>
    <Paragraph>You'll need the following details</Paragraph>
    <CopyTextWithLabel label="Homepage URL" text={hub.baseUrl}/>
    <CopyTextWithLabel label="Authorization callback URL" text={`${hub.baseUrl}/login/github/callback`}/>
  </Card>
)

const StepTwo = () => (
  <Card title="Step 2 - Save configuration to the Hub" style={{ marginTop: '20px' }} headStyle={{ backgroundColor: '#f5f5f5' }}>
    <Paragraph>
      <Text>Enter the details from the OAuth application you created.</Text>
    </Paragraph>
    <AuthConfigForm />
  </Card>
)

const ConfigureAuthPage = () => (
  <div>
    <Title>Configure Authentication provider</Title>
    <Title level={3}>Using GitHub</Title>
    <Text type="warning" style={{ fontSize: '12px' }}><Icon type="exclamation-circle"/> You'll need to be an admin of your GitHub organisation in order to complete this</Text>
    <StepOne />
    <StepTwo />
    <Footer style={{textAlign: 'center', backgroundColor: '#fff'}}>
      <span>
        For more information read the <a href="#">Documentation</a>
      </span>
    </Footer>
  </div>
)

ConfigureAuthPage.staticProps = {
  title: 'Configure authentication provider',
  unrestrictedPage: true
}

export default ConfigureAuthPage
