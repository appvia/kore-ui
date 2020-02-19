import Link from 'next/link'
import { Typography, Result, Icon, Button } from 'antd'
const { Paragraph } = Typography

const SetupAuthIndexPage = () => (
  <div>
    <Result
      icon={<Icon type="smile" theme="twoTone" />}
      title="Welcome to Appvia Kore!"
      subTitle="Authentication is not currently configured"
      extra={[
        <Paragraph key="para1">This must be done before any teams can start using Kore</Paragraph>,
        <Button key="button1" type="primary">
          <Link href="/setup/authentication/choose">
            <a>Begin setup</a>
          </Link>
        </Button>
      ]}
    />
  </div>
)

SetupAuthIndexPage.staticProps = {
  title: 'No authentication configured',
  hideSider: true,
  adminOnly: true
}

export default SetupAuthIndexPage
