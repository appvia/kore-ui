import { Typography, Icon, Button, Result } from 'antd'
const { Paragraph } = Typography

const GitHubSetupComplete = () => (
  <Result
    icon={<Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />}
    title="Authentication setup complete"
    subTitle="You have configured GitHub OAuth for authentication"
    extra={[
      <Paragraph key="info">It&apos;s recommended that you now sign-in to continue the setup of Appvia Kore.</Paragraph>,
      <Button key="login" type="primary">
        <a href="/login">Login</a>
      </Button>
    ]}
  />
)

GitHubSetupComplete.staticProps = {
  title: 'GitHub setup complete',
  hideSider: true,
  adminOnly: true
}

export default GitHubSetupComplete
