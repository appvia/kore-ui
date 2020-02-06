import { Typography, Icon, Button, Result } from 'antd'
const { Paragraph } = Typography

const GoogleSetupComplete = () => (
  <Result
    icon={<Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />}
    title="Authentication setup complete"
    subTitle="You have configured Google for authentication"
    extra={[
      <Paragraph key="info">It&apos;s recommended that you now sign-in to continue the setup of Appvia Kore.</Paragraph>,
      <Button key="login" type="primary">
        <a href="/login">Login</a>
      </Button>
    ]}
  />
)

GoogleSetupComplete.staticProps = {
  title: 'Google setup complete',
  hideSider: true,
  adminOnly: true
}

export default GoogleSetupComplete
