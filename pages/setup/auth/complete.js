import { Layout, Typography, Result, Button } from 'antd'
const { Footer } = Layout
const { Paragraph, Text } = Typography;

const SetupAuthCompletePage = () => (
  <div>
    <Result
      status="success"
      title="Authentication setup complete"
      subTitle="GitHub has been configured as your Identity Provider"
      extra={[
        <Paragraph key="para1">It's recommended that you now <Text strong>Login</Text> to continue the setup.</Paragraph>,
        <Button type="primary" key="login">
          <a href="/login">Go to Login page</a>
        </Button>
      ]}
    />
    <Footer style={{textAlign: 'center', backgroundColor: '#fff'}}>
      <span>
        For more information read the <a href="#">Documentation</a>
      </span>
    </Footer>
  </div>
)

SetupAuthCompletePage.getInitialProps = async () => {
  return {
    title: 'Authentication setup complete',
    unrestrictedPage: true
  }
}

export default SetupAuthCompletePage
